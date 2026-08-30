// Creates a storefront order for direct EFT payment into the Capitec business account.
// EFT order initialisation. The frontend submits price-free product, variant,
// quantity and bundle selections. This function recomputes the payable amount,
// creates both order records, and rejects invalid/stale selections.
// It mirrors the order into psa_orders (payment_method='eft_capitec',
// payment_status='awaiting_eft', payment_reference='PSA-XXXXXX'), enqueues the EFT
// instruction email, and returns the bank details for the instructions page.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { PRICING, quoteCheckout } from '../_shared/pricing.ts';
import { validatePetsFulfilment } from '../_shared/pets-fulfilment.ts';
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
    const { requestId, selections, firstName, lastName, email, fulfilment } = body ?? {};
    if (typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return json({ error: 'invalid checkout request', code: 'BAD_REQUEST' }, 400);
    }
    if (!email || typeof email !== 'string') return json({
      error: 'email required',
      code: 'BAD_REQUEST'
    }, 400);
    let quote;
    try {
      quote = quoteCheckout(selections);
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : 'Invalid cart selection',
        code: 'INVALID_CART'
      }, 400);
    }
    const petsCheckout = Array.isArray(selections) && selections.some((selection)=>
      selection?.kind === 'item' && selection?.slug === 'pets-mobility-collagen'
    );
    let fulfilmentRow = null;
    if (petsCheckout) {
      try {
        fulfilmentRow = validatePetsFulfilment(fulfilment, userId, String(email));
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : 'Invalid delivery details',
          code: 'INVALID_FULFILMENT'
        }, 400);
      }
    }
    // Service-role client is the only writer of the price-bearing order row.
    const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const orderPayload = {
      user_id: userId,
      checkout_request_id: requestId,
      total: quote.total,
      discount_code: null,
      status: 'pending',
      currency: PRICING.currency,
      order_description: quote.description,
      shipping_country: PRICING.shipping.country,
      shipping_method: PRICING.shipping.method,
      shipping_cost: quote.shipping,
      shipping_currency: PRICING.currency,
      free_shipping_applied: quote.freeShippingApplied
    };
    let { data: order, error: orderLookupErr } = await admin.from('orders')
      .select('id, user_id, total, currency, order_description')
      .eq('checkout_request_id', requestId)
      .maybeSingle();
    if (orderLookupErr) {
      console.error('authoritative order lookup failed:', orderLookupErr.message);
      return json({ error: 'Order could not be created. Please try again.' }, 500);
    }
    if (!order) {
      const inserted = await admin.from('orders').insert(orderPayload)
        .select('id, user_id, total, currency, order_description').single();
      order = inserted.data;
      if (inserted.error && (inserted.error as { code?: string }).code === '23505') {
        const raced = await admin.from('orders')
          .select('id, user_id, total, currency, order_description')
          .eq('checkout_request_id', requestId)
          .maybeSingle();
        order = raced.data;
        orderLookupErr = raced.error;
      } else {
        orderLookupErr = inserted.error;
      }
    }
    if (orderLookupErr || !order) {
      console.error('authoritative order insert failed:', orderLookupErr?.message);
      return json({ error: 'Order could not be created. Please try again.' }, 500);
    }
    const requestMatches = order.user_id === userId
      && String(order.currency).toUpperCase() === PRICING.currency
      && Math.abs(Number(order.total) - quote.total) <= 0.01
      && String(order.order_description ?? '') === quote.description;
    if (!requestMatches) {
      return json({ error: 'Checkout request conflicts with an earlier cart.', code: 'ORDER_CONFLICT' }, 409);
    }
    const orderId = order.id;
    const storedTotal = Number(order.total);
    if (fulfilmentRow) {
      const { error: fulfilmentErr } = await admin.from('order_fulfilment_details').upsert({
        ...fulfilmentRow,
        order_id: orderId
      }, { onConflict: 'order_id' });
      if (fulfilmentErr) {
        console.error('order fulfilment insert failed:', fulfilmentErr.message);
        return json({ error: 'Delivery details could not be saved. Please try again.' }, 500);
      }
    }
    const { data: existingOrder, error: existingOrderErr } = await admin.from('psa_orders').select('order_id, user_id, order_total, payment_method, payment_reference').eq('order_id', orderId).maybeSingle();
    if (existingOrderErr) {
      console.error('psa_orders idempotency lookup failed:', existingOrderErr.message);
      return json({
        error: 'Order could not be prepared for EFT. Please try again.'
      }, 500);
    }
    if (existingOrder) {
      const sameOrder = existingOrder.user_id === userId && existingOrder.payment_method === 'eft_capitec' && Math.abs(Number(existingOrder.order_total) - storedTotal) <= 0.01 && typeof existingOrder.payment_reference === 'string' && existingOrder.payment_reference.length > 0;
      if (!sameOrder) {
        return json({
          error: 'Order already has payment details that do not match this request.',
          code: 'ORDER_CONFLICT'
        }, 409);
      }
      return json({
        ok: true,
        order_id: orderId,
        amount: storedTotal,
        payment_reference: existingOrder.payment_reference,
        bank: {
          account_name: accountName,
          bank: 'Capitec Business',
          account_number: accountNumber,
          branch_code: branchCode,
          reference: existingOrder.payment_reference
        }
      });
    }
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
      line_items: order.order_description ?? null,
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
    const storefrontName = petsCheckout ? 'Peptides4Pets' : 'Peptide South Africa';
    const dispatchLine = petsCheckout
      ? `Once the matching deposit is verified, we'll confirm your order and queue it for local courier dispatch.`
      : `Once the matching deposit is verified, we'll confirm your order and dispatch Monday–Wednesday in insulated cold-chain packaging.`;
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
      `Use the reference exactly as shown so our team can verify the matching bank deposit.`,
      dispatchLine,
      ``,
      `— ${storefrontName}`
    ].join('\n');
    const { error: mailErr } = await admin.from('email_outbox').insert({
      user_id: userId,
      recipient_email: String(email).slice(0, 200),
      template: 'order_eft_instructions',
      payload: {
        order_id: orderId,
        order_reference: paymentReference,
        customer_name: customerName,
        items: order.order_description ?? null,
        total: storedTotal,
        currency: 'ZAR',
        storefront: petsCheckout ? 'pets' : 'main',
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
      amount: storedTotal,
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
