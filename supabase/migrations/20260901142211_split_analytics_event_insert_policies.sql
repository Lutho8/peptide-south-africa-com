-- Keep anonymous funnel telemetry independent from order-table access while
-- preserving ownership checks for authenticated portal and order events.

drop policy if exists "analytics_events_insert" on public.analytics_events;
drop policy if exists "analytics_events_insert_anon" on public.analytics_events;
drop policy if exists "analytics_events_insert_authenticated" on public.analytics_events;

create policy "analytics_events_insert_anon" on public.analytics_events
  for insert to anon
  with check (
    event in (
      'book_consult_clicked',
      'consultation_started',
      'consultation_qualified',
      'program_selected',
      'checkout_started'
    )
    and user_id is null
    and order_id is null
    and length(session_id) between 1 and 200
    and length(event_version) between 1 and 40
    and length(source) between 1 and 80
    and octet_length(props::text) <= 8192
  );

create policy "analytics_events_insert_authenticated" on public.analytics_events
  for insert to authenticated
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
