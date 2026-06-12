// Creates a NowPayments hosted-checkout session and returns the redirect URL.
// Requires logged-in user. Reads NOWPAYMENTS_API_KEY from env.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub as string;

    const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!apiKey) {
      return json({ error: 'Payments not configured yet. Please try again shortly.' }, 503);
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, amount, currency, description, successUrl, cancelUrl } = body ?? {};

    if (!orderId || typeof orderId !== 'string') return json({ error: 'orderId required' }, 400);
    if (typeof amount !== 'number' || amount <= 0) return json({ error: 'invalid amount' }, 400);
    if (currency !== 'eur' && currency !== 'zar') return json({ error: 'invalid currency' }, 400);

    // Confirm the order belongs to the caller and the requested amount matches
    // the stored order total. Prevents client-side price manipulation.
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, status, total, currency')
      .eq('id', orderId)
      .maybeSingle();
    if (orderErr || !order) return json({ error: 'order not found' }, 404);
    if (order.user_id !== userId) return json({ error: 'forbidden' }, 403);

    const storedTotal = Number(order.total);
    const storedCurrency = String(order.currency ?? '').toLowerCase();
    if (!Number.isFinite(storedTotal) || storedTotal <= 0) {
      return json({ error: 'order has no payable total' }, 400);
    }
    if (storedCurrency !== currency) {
      return json({ error: 'currency mismatch' }, 400);
    }
    // Allow only sub-cent rounding drift between client and stored total.
    if (Math.abs(storedTotal - amount) > 0.01) {
      return json({ error: 'amount mismatch' }, 400);
    }


    const ipnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-ipn`;

    const npRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: currency,
        order_id: orderId,
        order_description: (description ?? '').toString().slice(0, 500),
        ipn_callback_url: ipnUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        is_fee_paid_by_user: true,
      }),
    });

    const np = await npRes.json().catch(() => ({}));
    if (!npRes.ok) {
      return json({ error: np?.message ?? 'NowPayments request failed', details: np }, 502);
    }

    const paymentId = np?.payment_id?.toString() ?? null;
    const paymentUrl = np?.invoice_url ?? np?.payment_url ?? null;

    if (paymentId) {
      await supabase.from('orders').update({ nowpayments_payment_id: paymentId }).eq('id', orderId);
    }

    if (!paymentUrl) {
      return json({ error: 'No payment URL returned by NowPayments' }, 502);
    }

    return json({ payment_url: paymentUrl, payment_id: paymentId });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Internal error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
