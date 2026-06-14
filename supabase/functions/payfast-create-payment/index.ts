// Creates a PayFast hosted-checkout payload (action URL + signed fields).
// The frontend auto-submits a POST form with these fields to the action URL.
// Requires logged-in user. Reads PayFast secrets from env.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Field order is significant for the PayFast signature.
const SIGNATURE_FIELD_ORDER = [
  'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
  'name_first', 'name_last', 'email_address',
  'm_payment_id', 'amount', 'item_name', 'item_description',
];

function pfEncode(v: string): string {
  // PayFast wants RFC 1738 encoding (spaces as +) and uppercase percent-encoding.
  return encodeURIComponent(v)
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildSignature(fields: Record<string, string>, passphrase: string | undefined): string {
  const parts: string[] = [];
  for (const key of SIGNATURE_FIELD_ORDER) {
    const val = fields[key];
    if (val === undefined || val === null || val === '') continue;
    parts.push(`${key}=${pfEncode(String(val).trim())}`);
  }
  let toSign = parts.join('&');
  if (passphrase && passphrase.trim().length > 0) {
    toSign += `&passphrase=${pfEncode(passphrase.trim())}`;
  }
  return createHash('md5').update(toSign).digest('hex');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub as string;

    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID');
    const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY');
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE');
    const mode = (Deno.env.get('PAYFAST_MODE') || 'sandbox').toLowerCase();
    if (!merchantId || !merchantKey) {
      return json({ error: 'Payments not configured yet. Please try again shortly.' }, 503);
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, amount, itemName, firstName, lastName, email, returnUrl, cancelUrl } = body ?? {};

    if (!orderId || typeof orderId !== 'string') return json({ error: 'orderId required' }, 400);
    if (typeof amount !== 'number' || amount <= 0) return json({ error: 'invalid amount' }, 400);
    if (!email || typeof email !== 'string') return json({ error: 'email required' }, 400);

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, status, total, currency')
      .eq('id', orderId)
      .maybeSingle();
    if (orderErr || !order) return json({ error: 'order not found' }, 404);
    if (order.user_id !== userId) return json({ error: 'forbidden' }, 403);

    const storedTotal = Number(order.total);
    if (!Number.isFinite(storedTotal) || storedTotal <= 0) return json({ error: 'order has no payable total' }, 400);
    if (String(order.currency).toUpperCase() !== 'ZAR') return json({ error: 'currency must be ZAR' }, 400);
    if (Math.abs(storedTotal - amount) > 0.01) return json({ error: 'amount mismatch' }, 400);

    const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-itn`;

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: String(returnUrl ?? ''),
      cancel_url: String(cancelUrl ?? ''),
      notify_url: notifyUrl,
      name_first: String(firstName ?? '').slice(0, 100),
      name_last: String(lastName ?? '').slice(0, 100),
      email_address: String(email).slice(0, 100),
      m_payment_id: orderId,
      amount: storedTotal.toFixed(2),
      item_name: (itemName || 'Peptide South Africa order').toString().slice(0, 100),
      item_description: `Order ${orderId.slice(0, 8)}`,
    };

    fields.signature = buildSignature(fields, passphrase);

    const actionUrl = mode === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    return json({ actionUrl, fields });
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
