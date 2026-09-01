-- Durable checkout consent receipts and a first-party lifecycle event backbone.
-- The existing analytics_events table remains the single event stream so the
-- storefront, portal and order settlement path can be analysed together.

alter table public.analytics_events
  add column if not exists event_version text not null default '1.0',
  add column if not exists source text not null default 'storefront',
  add column if not exists order_id uuid null references public.orders(id) on delete set null;

alter table public.analytics_events
  drop constraint if exists analytics_events_event_check;

alter table public.analytics_events
  add constraint analytics_events_event_check check (event in (
    'book_consult_clicked',
    'consultation_started',
    'consultation_qualified',
    'program_selected',
    'checkout_started',
    'eft_instructions_shown',
    'bank_deposit_verified',
    'payin_completed',
    'portal_viewed',
    'portal_orders_viewed',
    'portal_tracker_opened',
    'portal_coa_opened',
    'reorder_started',
    'checkout_consent_accepted',
    'marketing_consent_granted',
    'order_created',
    'payment_pending',
    'payment_confirmed',
    'order_packed',
    'order_dispatched',
    'order_delivered'
  )),
  add constraint analytics_events_event_version_check
    check (length(event_version) between 1 and 40),
  add constraint analytics_events_source_check
    check (length(source) between 1 and 80);

update public.analytics_events
set order_id = nullif(props ->> 'order_id', '')::uuid
where order_id is null
  and props ? 'order_id'
  and (props ->> 'order_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

create index if not exists analytics_events_user_created_idx
  on public.analytics_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists analytics_events_order_created_idx
  on public.analytics_events (order_id, created_at asc)
  where order_id is not null;

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
      'eft_instructions_shown',
      'portal_viewed',
      'portal_orders_viewed',
      'portal_tracker_opened',
      'portal_coa_opened',
      'reorder_started'
    )
    and (user_id is null or user_id = (select auth.uid()))
    and (
      order_id is null
      or exists (
        select 1 from public.orders
        where orders.id = order_id
          and orders.user_id = (select auth.uid())
      )
    )
    and length(session_id) between 1 and 200
    and length(event_version) between 1 and 40
    and length(source) between 1 and 80
    and octet_length(props::text) <= 8192
  );

drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select" on public.analytics_events
  for select to authenticated
  using ((select public.has_role((select auth.uid()), 'admin')));

revoke all on public.analytics_events from anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;

create table public.checkout_consents (
  id bigint generated always as identity primary key,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null check (length(policy_version) between 1 and 80),
  report_scope_version text not null check (length(report_scope_version) between 1 and 80),
  age_confirmed boolean not null check (age_confirmed),
  research_use_acknowledged boolean not null check (research_use_acknowledged),
  non_human_use_acknowledged boolean not null check (non_human_use_acknowledged),
  report_scope_acknowledged boolean not null check (report_scope_acknowledged),
  marketing_consent boolean not null default false,
  accepted_at timestamptz not null default now(),
  client_accepted_at timestamptz null,
  statements jsonb not null check (
    jsonb_typeof(statements) = 'object'
    and octet_length(statements::text) <= 8192
  ),
  source text not null default 'storefront_checkout' check (length(source) between 1 and 80),
  created_at timestamptz not null default now()
);

comment on table public.checkout_consents is
  'Immutable versioned receipts for research-use checkout acknowledgements and optional marketing consent.';

create index checkout_consents_user_accepted_idx
  on public.checkout_consents (user_id, accepted_at desc);

alter table public.checkout_consents enable row level security;

create policy "checkout_consents_select_own" on public.checkout_consents
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "checkout_consents_admin_select" on public.checkout_consents
  for select to authenticated
  using ((select public.has_role((select auth.uid()), 'admin')));

revoke all on public.checkout_consents from anon, authenticated;
grant select on public.checkout_consents to authenticated;
grant all on public.checkout_consents to service_role;
grant usage, select on sequence public.checkout_consents_id_seq to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.emit_order_lifecycle_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lifecycle_event text;
begin
  if tg_op = 'INSERT' then
    insert into public.analytics_events (
      event, event_version, source, session_id, user_id, order_id, props
    ) values (
      'order_created', '1.0', 'database', 'server:' || new.id::text,
      new.user_id, new.id,
      jsonb_build_object('order_id', new.id, 'status', new.status, 'amount_zar', new.total, 'currency', new.currency)
    ) on conflict do nothing;

    if new.status = 'pending' then
      insert into public.analytics_events (
        event, event_version, source, session_id, user_id, order_id, props
      ) values (
        'payment_pending', '1.0', 'database', 'server:' || new.id::text,
        new.user_id, new.id,
        jsonb_build_object('order_id', new.id, 'payment_provider', new.payment_provider)
      ) on conflict do nothing;
    end if;
    return new;
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  lifecycle_event := case lower(new.status)
    when 'paid' then 'payment_confirmed'
    when 'processing' then 'order_packed'
    when 'packed' then 'order_packed'
    when 'shipped' then 'order_dispatched'
    when 'dispatched' then 'order_dispatched'
    when 'delivered' then 'order_delivered'
    else null
  end;

  if lifecycle_event is not null then
    insert into public.analytics_events (
      event, event_version, source, session_id, user_id, order_id, props
    ) values (
      lifecycle_event, '1.0', 'database', 'server:' || new.id::text,
      new.user_id, new.id,
      jsonb_build_object('order_id', new.id, 'from_status', old.status, 'to_status', new.status)
    ) on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke execute on function private.emit_order_lifecycle_event() from public, anon, authenticated;
grant execute on function private.emit_order_lifecycle_event() to service_role;

drop trigger if exists emit_order_lifecycle_events on public.orders;
create trigger emit_order_lifecycle_events
  after insert or update of status on public.orders
  for each row execute function private.emit_order_lifecycle_event();

create or replace function private.emit_checkout_consent_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.analytics_events (
    event, event_version, source, session_id, user_id, order_id, props
  ) values (
    'checkout_consent_accepted', '1.0', 'database', 'server:' || new.order_id::text,
    new.user_id, new.order_id,
    jsonb_build_object(
      'order_id', new.order_id,
      'policy_version', new.policy_version,
      'report_scope_version', new.report_scope_version,
      'marketing_consent', new.marketing_consent
    )
  ) on conflict do nothing;

  if new.marketing_consent then
    insert into public.analytics_events (
      event, event_version, source, session_id, user_id, order_id, props
    ) values (
      'marketing_consent_granted', '1.0', 'database', 'server:' || new.order_id::text,
      new.user_id, new.order_id,
      jsonb_build_object('order_id', new.order_id, 'policy_version', new.policy_version)
    ) on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke execute on function private.emit_checkout_consent_event() from public, anon, authenticated;
grant execute on function private.emit_checkout_consent_event() to service_role;

drop trigger if exists emit_checkout_consent_events on public.checkout_consents;
create trigger emit_checkout_consent_events
  after insert on public.checkout_consents
  for each row execute function private.emit_checkout_consent_event();

create unique index if not exists analytics_events_order_milestone_once_idx
  on public.analytics_events (event, order_id)
  where order_id is not null and event in (
    'order_created',
    'payment_pending',
    'payment_confirmed',
    'order_packed',
    'order_dispatched',
    'order_delivered',
    'checkout_consent_accepted',
    'marketing_consent_granted'
  );
