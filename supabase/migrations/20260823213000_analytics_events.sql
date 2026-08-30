-- PSA funnel + merchandising event stream (privacy-minimised, append-only).
--
-- Written by the storefront (anon/authenticated clients) and edge functions
-- (service role). Powers the EFT funnel
--   checkout_started -> eft_instructions_shown -> payin_completed
-- plus merchandising metrics (pdp_variant_selected, cart_upgrade_5pack_clicked,
-- build_stack_prefill_started, ...). Contract: src/lib/analytics.ts.
--
-- Privacy: no PII in props — product slugs, pack sizes, ZAR amounts and order
-- ids only. session_id is a random per-browser-session token, not an identity.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  session_id text not null,
  user_id uuid null,
  props jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);

alter table public.analytics_events enable row level security;

-- Clients may append events; they may never read them back.
-- Dashboards/reporting read via the service role only.
drop policy if exists "analytics_events_insert" on public.analytics_events;
create policy "analytics_events_insert" on public.analytics_events
  for insert to anon, authenticated
  with check (true);

grant insert on public.analytics_events to anon, authenticated;
