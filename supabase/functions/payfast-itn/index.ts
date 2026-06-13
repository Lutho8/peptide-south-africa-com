// PayFast Instant Transaction Notification (ITN) handler.
// Validates signature, server-to-server validates the payload with PayFast,
// confirms the amount, and updates the order status.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function pfEncode(v: string): string {
  return encodeURIComponent(v)
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildSignature(fields: Record<string, string>, passphrase: string | undefined): string {
  // For ITN we sign all fields except `signature` in the order they were received.
  const parts: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'signature') continue;
    if (v === undefined || v === null || v === '') continue;
    parts.push(`${k}=${pfEncode(String(v).trim())}`);
  }
  let toSign = parts.join('&');
  if (passphrase && passphrase.trim().length > 0) {
    toSign += `&passphrase=${pfEncode(passphrase.trim())}`;
  }
  return createHash('md5').update(toSign).digest('hex');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Always respond 200 to PayFast so they don't keep retrying — we log internal failures.
  const ok = () => new Response('OK', { status: 200, headers: corsHeaders });

  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const fields: Record<string, string> = {};
    for (const [k, v] of params.entries()) fields[k] = v;

    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE');
    const mode = (Deno.env.get('PAYFAST_MODE') || 'sandbox').toLowerCase();

    const expectedSig = buildSignature(fields, passphrase);
    if (!fields.signature || fields.signature !== expectedSig) {
      await supabase.from('integration_logs').insert({
        source: 'payfast-itn',
        status: 'invalid_signature',
        payload: fields,
      });
      return ok();
    }

    // Server-to-server validation: post the raw body back to PayFast.
    const validateHost = mode === 'live'
      ? 'https://www.payfast.co.za/eng/query/validate'
      : 'https://sandbox.payfast.co.za/eng/query/validate';
    const validateRes = await fetch(validateHost, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody,
    });
    const validateText = (await validateRes.text()).trim().toUpperCase();
    if (validateText !== 'VALID') {
      await supabase.from('integration_logs').insert({
        source: 'payfast-itn',
        status: 'validate_failed',
        payload: { validateText, fields },
      });
      return ok();
    }

    const orderId = fields.m_payment_id;
    const amountGross = Number(fields.amount_gross);
    const paymentStatus = (fields.payment_status || '').toUpperCase();
    const pfPaymentId = fields.pf_payment_id;
    const token = fields.token || null;

    const { data: order } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      await supabase.from('integration_logs').insert({
        source: 'payfast-itn',
        status: 'order_not_found',
        payload: fields,
      });
      return ok();
    }

    if (Math.abs(Number(order.total) - amountGross) > 0.01) {
      await supabase.from('integration_logs').insert({
        source: 'payfast-itn',
        status: 'amount_mismatch',
        payload: { storedTotal: order.total, amountGross, fields },
      });
      return ok();
    }

    const update: Record<string, unknown> = {
      payfast_pf_payment_id: pfPaymentId,
    };
    if (token) update.payfast_token = token;

    if (paymentStatus === 'COMPLETE') {
      update.status = 'paid';
      update.paid_at = new Date().toISOString();
    } else if (paymentStatus === 'CANCELLED') {
      update.status = 'cancelled';
    } else if (paymentStatus === 'FAILED') {
      update.status = 'failed';
    }

    await supabase.from('orders').update(update).eq('id', orderId);

    await supabase.from('integration_logs').insert({
      source: 'payfast-itn',
      status: paymentStatus.toLowerCase() || 'received',
      payload: fields,
    });

    return ok();
  } catch (err) {
    await supabase.from('integration_logs').insert({
      source: 'payfast-itn',
      status: 'exception',
      payload: { error: err instanceof Error ? err.message : String(err) },
    });
    return ok();
  }
});
