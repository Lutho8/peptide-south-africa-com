// Retention scheduler: scans reorder_reminders past due, enqueues emails
// to email_outbox, marks reminders as sent. Designed to run every 15 min
// via pg_cron. Idempotent — re-runs only pick up new due reminders.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Require shared cron secret on every call. Without it, no access.
  const cronSecret = Deno.env.get('CRON_SECRET');
  const provided = req.headers.get('x-cron-secret') ?? '';
  if (!cronSecret || provided !== cronSecret) {
    return new Response('unauthorized', { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // Fetch due, un-sent reminders (cap batch at 200)
    const { data: due, error } = await supabase
      .from('reorder_reminders')
      .select('id, user_id, product_slug, variant_label, due_at, source_order_id, template, attempt_count')
      .is('sent_at', null)
      .lte('due_at', new Date().toISOString())
      .limit(200);

    if (error) throw error;
    if (!due || due.length === 0) {
      return json({ ok: true, processed: 0 });
    }

    // Fetch recipient emails from auth.users for each user_id
    const userIds = [...new Set(due.map((r) => r.user_id))];
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map<string, string>();
    for (const u of users?.users ?? []) {
      if (userIds.includes(u.id) && u.email) emailMap.set(u.id, u.email);
    }

    let enqueued = 0;
    for (const r of due) {
      const recipient = emailMap.get(r.user_id);
      if (!recipient) continue;

      const idempotencyKey = `reorder:${r.id}:${r.attempt_count}`;
      const { error: insErr } = await supabase.from('email_outbox').insert({
        user_id: r.user_id,
        recipient_email: recipient,
        template: r.template || 'reorder_d0',
        payload: {
          product_slug: r.product_slug,
          variant_label: r.variant_label,
          source_order_id: r.source_order_id,
          reorder_reminder_id: r.id,
        },
        idempotency_key: idempotencyKey,
        status: 'queued',
      });

      if (insErr && !insErr.message.includes('duplicate')) {
        // log and skip
        await supabase.from('integration_logs').insert({
          integration: 'retention', action: 'enqueue_failed', status: 'error',
          error: insErr.message, payload: { reminder_id: r.id },
        });
        continue;
      }

      await supabase
        .from('reorder_reminders')
        .update({ sent_at: new Date().toISOString(), attempt_count: r.attempt_count + 1 })
        .eq('id', r.id);

      await supabase.from('retention_events').insert({
        user_id: r.user_id,
        event: 'reorder_due',
        meta: { product_slug: r.product_slug, reminder_id: r.id },
      });

      enqueued++;
    }

    return json({ ok: true, processed: due.length, enqueued });
  } catch (e) {
    console.error('retention-scheduler error:', e);
    return json({ ok: false, error: 'Internal server error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
