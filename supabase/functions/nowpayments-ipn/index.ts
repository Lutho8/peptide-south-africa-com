// NowPayments IPN webhook. Public endpoint (verify_jwt=false).
// Verifies HMAC-SHA512 signature against NOWPAYMENTS_IPN_SECRET, then updates
// the matching order row.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');
  if (!ipnSecret) return new Response('not configured', { status: 503 });

  const rawBody = await req.text();
  const sigHeader = req.headers.get('x-nowpayments-sig') ?? '';

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('bad json', { status: 400 });
  }

  // Verify signature: HMAC-SHA512 over JSON with keys sorted alphabetically.
  const sorted = sortObject(payload);
  const canonical = JSON.stringify(sorted);
  const expected = await hmacSha512Hex(ipnSecret, canonical);
  if (!timingSafeEqual(expected, sigHeader)) {
    return new Response('invalid signature', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const status = (payload['payment_status'] as string) ?? '';
  const orderId = (payload['order_id'] as string) ?? null;
  const paymentId = payload['payment_id']?.toString() ?? null;

  let nextStatus: string | null = null;
  let paidAt: string | null = null;
  // Only mark fully paid on confirmed/finished. Partial payments are flagged
  // for manual review to avoid underpayment exploitation.
  if (status === 'finished' || status === 'confirmed') {
    nextStatus = 'paid';
    paidAt = new Date().toISOString();
  } else if (status === 'partially_paid') {
    nextStatus = 'underpaid';
  } else if (status === 'failed' || status === 'expired' || status === 'refunded') {
    nextStatus = status === 'refunded' ? 'refunded' : 'failed';
  }

  if (orderId && nextStatus) {
    await supabase
      .from('orders')
      .update({
        status: nextStatus,
        nowpayments_payment_id: paymentId,
        ...(paidAt ? { paid_at: paidAt } : {}),
      })
      .eq('id', orderId);
  }

  await supabase.from('integration_logs').insert({
    integration: 'nowpayments',
    action: 'ipn',
    status: nextStatus ?? status ?? 'unknown',
    payload: payload as never,
  });

  return new Response('ok', { status: 200 });
});

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj as Record<string, unknown>).sort()) {
      out[k] = sortObject((obj as Record<string, unknown>)[k]);
    }
    return out;
  }
  return obj;
}

async function hmacSha512Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
