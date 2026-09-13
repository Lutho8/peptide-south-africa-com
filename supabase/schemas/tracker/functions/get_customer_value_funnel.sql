CREATE OR REPLACE FUNCTION tracker.get_customer_value_funnel (
  _days integer DEFAULT 30
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  with date_window as (
    select greatest(1, least(coalesce(_days, 30), 365))::integer as days
  ), events as (
    select user_id, event_name, created_at
    from tracker.journey_events, date_window
    where created_at >= now() - make_interval(days => date_window.days)
  ), commerce_in_window as (
    select user_id, lead_id, session_id, placement
    from tracker.commerce_events, date_window
    where created_at >= now() - make_interval(days => date_window.days)
  ), orders_in_window as (
    select user_id, id
    from public.orders, date_window
    where created_at >= now() - make_interval(days => date_window.days)
      and status not in ('cancelled', 'failed')
  ), repeat_customers as (
    select user_id
    from public.orders
    where status not in ('cancelled', 'failed')
    group by user_id
    having count(*) > 1
  ), returning_dashboard_users as (
    select user_id
    from events
    where event_name = 'dashboard_viewed'
    group by user_id
    having count(distinct created_at::date) > 1
  )
  select jsonb_build_object(
    'days', (select days from date_window),
    'dashboard_users', (select count(distinct user_id) from events where event_name = 'dashboard_viewed'),
    'returning_dashboard_users', (select count(*) from returning_dashboard_users),
    'experience_selected_users', (select count(distinct user_id) from events where event_name = 'experience_selected'),
    'pathway_selected_users', (select count(distinct user_id) from events where event_name = 'pathway_selected'),
    'guided_support_users', (select count(distinct user_id) from events where event_name = 'guided_support_requested'),
    'store_clicks', (select count(*) from commerce_in_window),
    'store_click_sessions', (select count(distinct session_id) from commerce_in_window where session_id is not null),
    'store_click_users', (select count(distinct user_id) from commerce_in_window where user_id is not null),
    'store_click_leads', (select count(distinct lead_id) from commerce_in_window where lead_id is not null),
    'store_click_placements', coalesce((
      select jsonb_object_agg(placement, clicks)
      from (
        select placement, count(*) as clicks
        from commerce_in_window
        group by placement
      ) placement_totals
    ), '{}'::jsonb),
    'reorder_click_users', (select count(distinct user_id) from events where event_name = 'reorder_cta_clicked'),
    'ordering_customers', (select count(distinct user_id) from orders_in_window),
    'orders', (select count(*) from orders_in_window),
    'repeat_customers', (select count(*) from repeat_customers),
    'journey_mix', jsonb_build_object(
      'new_to_peptides', (select count(*) from tracker.customer_journeys where experience_mode = 'new_to_peptides'),
      'experienced', (select count(*) from tracker.customer_journeys where experience_mode = 'experienced'),
      'guided', (select count(*) from tracker.customer_journeys where pathway = 'guided'),
      'research', (select count(*) from tracker.customer_journeys where pathway = 'research')
    )
  )
  where tracker.has_role((select auth.uid()), 'admin'::tracker.app_role);
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."get_customer_value_funnel"(integer) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."get_customer_value_funnel"(integer) FROM PUBLIC;
