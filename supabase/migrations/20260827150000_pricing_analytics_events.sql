-- Privacy-minimised append-only storefront and EFT funnel events.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null check (event in (
    'book_consult_clicked',
    'consultation_started',
    'consultation_qualified',
    'program_selected',
    'checkout_started',
    'eft_instructions_shown',
    'bank_deposit_verified',
    'payin_completed'
  )),
  session_id text not null check (length(session_id) between 1 and 200),
  user_id uuid null,
  props jsonb not null default '{}'::jsonb check (octet_length(props::text) <= 8192)
);

alter table public.orders
  add column if not exists checkout_request_id uuid;

create unique index if not exists orders_checkout_request_id_idx
  on public.orders (checkout_request_id)
  where checkout_request_id is not null;

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);

alter table public.analytics_events enable row level security;
drop policy if exists "analytics_events_insert" on public.analytics_events;
create policy "analytics_events_insert" on public.analytics_events
  for insert to anon, authenticated
  with check (
    event in (
      'book_consult_clicked',
      'consultation_started',
      'consultation_qualified',
      'program_selected',
      'checkout_started',
      'eft_instructions_shown'
    )
    and (user_id is null or user_id = (select auth.uid()))
    and length(session_id) between 1 and 200
    and octet_length(props::text) <= 8192
  );
revoke all on public.analytics_events from anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;

-- Settlement revenue events are database-derived, so the browser cannot
-- fabricate revenue and the legacy EFT reconciler does not need a code deploy.
create unique index if not exists analytics_events_settlement_once_idx
  on public.analytics_events (event, ((props ->> 'order_id')))
  where event in ('bank_deposit_verified', 'payin_completed');

create or replace function public.emit_verified_eft_revenue_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  settled_user_id uuid;
begin
  if old.payment_status = 'awaiting_eft' and new.payment_status = 'complete' then
    select user_id into settled_user_id from public.orders where id = new.order_id;
    insert into public.analytics_events (event, session_id, user_id, props)
    values
      ('bank_deposit_verified', 'server:' || new.order_id::text, settled_user_id,
        jsonb_build_object('order_id', new.order_id, 'server_confirmed_amount_zar', new.order_total, 'currency', 'ZAR', 'verification', 'matching_bank_deposit')),
      ('payin_completed', 'server:' || new.order_id::text, settled_user_id,
        jsonb_build_object('order_id', new.order_id, 'server_confirmed_amount_zar', new.order_total, 'currency', 'ZAR', 'verification', 'matching_bank_deposit'))
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists emit_verified_eft_revenue_events on public.psa_orders;
create trigger emit_verified_eft_revenue_events
  after update of payment_status on public.psa_orders
  for each row execute function public.emit_verified_eft_revenue_events();
