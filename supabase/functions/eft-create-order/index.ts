// Creates a storefront order for direct EFT payment into the Capitec business account.
// EFT order initialisation. The frontend creates the
// `orders` row itself (same as CheckoutPage does today) and calls this function with
// { orderId, amount, itemName, firstName, lastName, email, returnUrl, cancelUrl }.
// This function mirrors the order into psa_orders (payment_method='eft_capitec',
// payment_status='awaiting_eft', payment_reference='PSA-XXXXXX'), enqueues the EFT
// instruction email, and returns the bank details for the instructions page.
import { createClient } from 'npm:@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Crockford base32 without I/L/O/U
const REF_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function generateReference() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes)out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `PSA-${out}`;
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({
      error: 'Your session has expired. Please sign in again.',
      code: 'AUTH_REQUIRED'
    }, 401);
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({
      error: 'Your session has expired. Please sign in again.',
      code: 'AUTH_REQUIRED'
    }, 401);
    const userId = userData.user.id;
    const accountName = Deno.env.get('EFT_ACCOUNT_NAME');
    const accountNumber = Deno.env.get('EFT_ACCOUNT_NUMBER');
    const branchCode = Deno.env.get('EFT_BRANCH_CODE');
    if (!accountName || !accountNumber || !branchCode) {
      return json({
        error: 'EFT payments not configured yet. Please try again shortly.',
      code: 'EFT_NOT_CONFIGURED'
      }, 503);
    }
    const body = await req.json().catch(()=>({}));
    const { orderId, amount, itemName, firstName, lastName, email } = body ?? {};
    if (!orderId || typeof orderId !== 'string') return json({
      error: 'orderId required',
      code: 'BAD_REQUEST'
    }, 400);
    if (typeof amount !== 'number' || amount <= 0) return json({
      error: 'invalid amount',
      code: 'BAD_REQUEST'
    }, 400);
    if (!email || typeof email !== 'string') return json({
      error: 'email required',
      code: 'BAD_REQUEST'
    }, 400);
    const { data: order, error: orderErr } = await supabase.from('orders').select('id, user_id, status, total, currency, order_description').eq('id', orderId).maybeSingle();
    if (orderErr || !order) return json({
      error: 'order not found',
      code: 'ORDER_NOT_FOUND'
    }, 404);
    if (order.user_id !== userId) return json({
      error: 'forbidden',
      code: 'ORDER_FORBIDDEN'
    }, 403);
    const storedTotal = Number(order.total);
    if (!Number.isFinite(storedTotal) || storedTotal <= 0) return json({
      error: 'order has no payable total'
    }, 400);
    if (String(order.currency).toUpperCase() !== 'ZAR') return json({
      error: 'currency must be ZAR',
      code: 'BAD_REQUEST'
    }, 400);
    if (Math.abs(storedTotal - amount) > 0.01) return json({
      error: 'amount mismatch',
      code: 'AMOUNT_MISMATCH'
    }, 400);
    // Service-role client for psa_orders / email_outbox writes (RLS-locked).
    const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    // Generate a unique payment reference (retry on psa_orders.payment_reference conflict).
    let paymentReference = '';
    for(let attempt = 0; attempt < 5; attempt++){
      const candidate = generateReference();
      const { data: existing } = await admin.from('psa_orders').select('order_id').eq('payment_reference', candidate).limit(1).maybeSingle();
      if (!existing) {
        paymentReference = candidate;
        break;
      }
    }
    if (!paymentReference) return json({
      error: 'could not allocate payment reference'
    }, 500);
    // Mirror into psa_orders (order_id carries the storefront order UUID).
    const { error: psaErr } = await admin.from('psa_orders').insert({
      order_id: orderId,
      unified_order_id: orderId,
      user_id: userId,
      customer_email: String(email).slice(0, 200),
      line_items: order.order_description ?? itemName ?? null,
      order_total: storedTotal,
      payment_method: 'eft_capitec',
      payment_status: 'awaiting_eft',
      payment_reference: paymentReference
    });
    if (psaErr) {
      console.error('psa_orders insert failed:', psaErr.message);
      return json({
        error: 'Order could not be prepared for EFT. Please try again.'
      }, 500);
    }
    const customerName = [
      firstName,
      lastName
    ].filter(Boolean).join(' ').trim() || null;
    const bank = {
      account_name: accountName,
      bank: 'Capitec Business',
      account_number: accountNumber,
      branch_code: branchCode,
      reference: paymentReference
    };
    // EFT instruction email. psa-mailer has no 'order_eft_instructions' template yet, but
    // its _default renderer uses payload.subject / payload.text — so we send both the
    // structured fields and a pre-rendered subject/text. Gap noted for a dedicated template.
    const amountFormatted = `R${storedTotal.toFixed(2)}`;
    const eftText = [
      `Hi${customerName ? ' ' + customerName : ''},`,
      ``,
      `Thanks for your order. To complete it, please make an EFT of ${amountFormatted} to:`,
      ``,
      `Account name: ${accountName}`,
      `Bank: Capitec Business`,
      `Account number: ${accountNumber}`,
      `Branch code: ${branchCode}`,
      `Reference: ${paymentReference}`,
      ``,
      `Use the reference exactly as shown so we can match your payment automatically.`,
      `Once your deposit clears, we'll confirm your order and dispatch Monday–Wednesday`,
      `in insulated cold-chain packaging.`,
      ``,
      `— Peptide South Africa`
    ].join('\n');
    const { error: mailErr } = await admin.from('email_outbox').insert({
      user_id: userId,
      recipient_email: String(email).slice(0, 200),
      template: 'order_eft_instructions',
      payload: {
        order_id: orderId,
        order_reference: paymentReference,
        customer_name: customerName,
        items: order.order_description ?? itemName ?? null,
        total: storedTotal,
        currency: 'ZAR',
        bank,
        subject: `EFT payment instructions — ${amountFormatted} · ref ${paymentReference}`,
        text: eftText
      },
      idempotency_key: `eft_instructions:${orderId}`,
      status: 'queued',
      send_at: new Date().toISOString()
    });
    if (mailErr && !mailErr.message.includes('duplicate')) {
      await admin.from('integration_logs').insert({
        integration: 'eft',
        action: 'create-order',
        status: 'eft_instructions_enqueue_failed',
        payload: {
          orderId,
          error: mailErr.message
        }
      });
    }
    await admin.from('integration_logs').insert({
      integration: 'eft',
      action: 'create-order',
      status: 'awaiting_eft',
      payload: {
        orderId,
        paymentReference,
        amount: storedTotal
      }
    });
    return json({
      ok: true,
      order_id: orderId,
      payment_reference: paymentReference,
      bank
    });
  } catch (err) {
    console.error('eft-create-order error:', err);
    return json({
      error: 'EFT order initialisation failed. Please try again.'
    }, 500);
  }
});
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
