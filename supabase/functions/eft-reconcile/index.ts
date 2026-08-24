// EFT reconciliation endpoint.
// Ingests Capitec bank deposits (parsed from bank notification emails or a manual CSV
// paste), dedupes them into bank_deposits, and auto-matches them against psa_orders
// rows with payment_status='awaiting_eft'. On match: order → complete + confirmation email.
// Auth: shared-secret header 'x-eft-secret' (timing-safe compare against EFT_RECONCILE_SECRET).

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-eft-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Timing-safe string compare (pad to equal length, constant-time-ish XOR walk).
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length, 1);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
  }
  return diff === 0;
}

function normaliseRef(ref: unknown): string {
  return String(ref ?? '').replace(/\s+/g, '').toUpperCase();
}

function dedupeKey(amount: number, reference: string | null, receivedAt: string): string {
  const minute = receivedAt.slice(0, 16); // YYYY-MM-DDTHH:MM
  return `${amount.toFixed(2)}|${normaliseRef(reference)}|${minute}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = Deno.env.get('EFT_RECONCILE_SECRET') || '';
  const provided = req.headers.get('x-eft-secret') || '';
  if (!secret || !safeEqual(provided, secret)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const summary = { ok: true, inserted: 0, duplicates: 0, matched: 0, still_unmatched: 0 };

  try {
    const body = await req.json().catch(() => ({}));
    const deposits = Array.isArray(body?.deposits) ? body.deposits : [];

    // ── 1. Ingest with dedupe ───────────────────────────────────────────────
    for (const d of deposits) {
      const amount = Number(d?.amount);
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const receivedAt = d?.received_at ? new Date(d.received_at).toISOString() : new Date().toISOString();
      const reference = d?.reference != null ? String(d.reference).slice(0, 100) : null;

      const { error } = await supabase.from('bank_deposits').insert({
        amount,
        reference,
        payer_name: d?.payer_name != null ? String(d.payer_name).slice(0, 200) : null,
        received_at: receivedAt,
        raw: d?.raw ?? d ?? null,
        source: 'capitec_email',
        dedupe_key: dedupeKey(amount, reference, receivedAt),
        status: 'unmatched',
      });
      if (error) {
        // 23505 unique violation → duplicate deposit
        if ((error as { code?: string }).code === '23505' || error.message.includes('duplicate')) {
          summary.duplicates++;
        } else {
          console.error('bank_deposits insert failed:', error.message);
        }
      } else {
        summary.inserted++;
      }
    }

    // ── 2. Match sweep over ALL unmatched deposits ──────────────────────────
    const { data: unmatched } = await supabase
      .from('bank_deposits')
      .select('id, amount, reference')
      .eq('status', 'unmatched');

    for (const dep of unmatched ?? []) {
      const ref = normaliseRef(dep.reference);
      if (!ref) { summary.still_unmatched++; continue; }

      const { data: orders } = await supabase
        .from('psa_orders')
        .select('order_id, unified_order_id, user_id, customer_email, line_items, order_total, payment_reference')
        .eq('payment_status', 'awaiting_eft')
        .ilike('payment_reference', ref);

      const order = (orders ?? []).find((o) => normaliseRef(o.payment_reference) === ref);
      if (!order) { summary.still_unmatched++; continue; }

      const expected = Number(order.order_total);
      const actual = Number(dep.amount);

      if (Math.abs(expected - actual) >= 0.01) {
        // Reference matches but amount doesn't → discrepancy record, deposit stays unmatched.
        await insertDiscrepancy(supabase, {
          order_id: order.order_id,
          expected_amount: expected,
          actual_amount: actual,
          reference: ref,
          deposit_id: dep.id,
        });
        summary.still_unmatched++;
        continue;
      }

      // ── Match: settle the order ─────────────────────────────────────────
      const now = new Date().toISOString();
      const { error: updErr } = await supabase
        .from('psa_orders')
        .update({ payment_status: 'complete', payment_settled_at: now })
        .eq('order_id', order.order_id)
        .eq('payment_status', 'awaiting_eft'); // guard against double-settle

      if (updErr) {
        console.error('psa_orders settle failed:', updErr.message);
        summary.still_unmatched++;
        continue;
      }

      await supabase
        .from('bank_deposits')
        .update({ status: 'matched', matched_order_id: String(order.order_id) })
        .eq('id', dep.id);

      // Order-confirmation email.
      const recipient = order.customer_email;
      if (recipient) {
        const { error: mailErr } = await supabase.from('email_outbox').insert({
          user_id: order.user_id || null,
          recipient_email: recipient,
          template: 'order_confirmation',
          payload: {
            order_id: order.order_id,
            order_reference: order.order_id,
            customer_name: null,
            items: order.line_items ?? null,
            total: order.order_total,
            currency: 'ZAR',
          },
          idempotency_key: `order_confirmation:${order.order_id}`,
          status: 'queued',
          send_at: now,
        });
        if (mailErr && !mailErr.message.includes('duplicate')) {
          await supabase.from('integration_logs').insert({
            integration: 'eft', action: 'reconcile',
            status: 'order_confirmation_enqueue_failed',
            payload: { orderId: order.order_id, error: mailErr.message },
          });
        }
      }

      await supabase.from('integration_logs').insert({
        integration: 'eft', action: 'reconcile',
        status: 'matched',
        payload: { orderId: order.order_id, depositId: dep.id, amount: actual, reference: ref },
      });

      summary.matched++;
    }

    return json(summary);
  } catch (err) {
    console.error('eft-reconcile error:', err);
    await supabase.from('integration_logs').insert({
      integration: 'eft', action: 'reconcile',
      status: 'exception',
      payload: { error: err instanceof Error ? err.message : String(err) },
    });
    return json({ ...summary, ok: false, error: 'reconciliation failed' }, 500);
  }
});

// Best-effort discrepancy insert. psa_payment_discrepancies schema is not verified from
// this environment; we introspect a sample row when one exists and intersect payload
// keys, otherwise try the known candidate columns and fall back to integration_logs.
async function insertDiscrepancy(
  supabase: ReturnType<typeof createClient>,
  d: { order_id: string; expected_amount: number; actual_amount: number; reference: string; deposit_id: string },
) {
  const candidates: Record<string, unknown> = {
    order_id: d.order_id,
    expected_amount: d.expected_amount,
    actual_amount: d.actual_amount,
    reference: d.reference,
    deposit_id: d.deposit_id,
    status: 'open',
    source: 'eft_capitec',
    notes: `EFT amount mismatch: expected R${d.expected_amount.toFixed(2)}, received R${d.actual_amount.toFixed(2)} (ref ${d.reference})`,
  };

  let payload = candidates;
  try {
    const { data: sample } = await supabase.from('psa_payment_discrepancies').select('*').limit(1).maybeSingle();
    if (sample && typeof sample === 'object') {
      const keys = new Set(Object.keys(sample as Record<string, unknown>));
      payload = Object.fromEntries(Object.entries(candidates).filter(([k]) => keys.has(k)));
    }
  } catch { /* keep candidates */ }

  const { error } = await supabase.from('psa_payment_discrepancies').insert(payload);
  if (error) {
    await supabase.from('integration_logs').insert({
      integration: 'eft', action: 'reconcile',
      status: 'discrepancy_fallback',
      payload: { ...d, insert_error: error.message },
    });
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
