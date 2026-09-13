CREATE OR REPLACE FUNCTION tracker.get_dashboard_snapshot()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
  select jsonb_build_object(
    'journey', (
      select to_jsonb(journey_row)
      from (
        select
          experience_mode,
          pathway,
          lifecycle_stage,
          primary_goal,
          onboarding_step,
          next_action_code,
          last_active_at,
          updated_at
        from tracker.customer_journeys
        where user_id = (select auth.uid())
      ) as journey_row
    ),
    'profile', (
      select jsonb_build_object(
        'display_name', display_name,
        'profile_completed', profile_completed_at is not null
      )
      from tracker.profiles
      where id = (select auth.uid())
    ),
    'workspace', jsonb_build_object(
      'stack_items', (
        select count(*) from tracker.user_stacks
        where user_id = (select auth.uid())
      ),
      'recent_events', coalesce((
        select jsonb_agg(to_jsonb(event_row) order by event_row.created_at desc)
        from (
          select id, event_name, source, context, created_at
          from tracker.journey_events
          where user_id = (select auth.uid())
          order by created_at desc, id desc
          limit 8
        ) as event_row
      ), '[]'::jsonb),
      'latest_lab_report', (
        select jsonb_build_object(
          'id', id,
          'status', status,
          'uploaded_at', uploaded_at,
          'report_date', report_date
        )
        from tracker.lab_reports
        where user_id = (select auth.uid())
        order by uploaded_at desc
        limit 1
      )
    )
  )
  where (select auth.uid()) is not null;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."get_dashboard_snapshot"() TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."get_dashboard_snapshot"() FROM PUBLIC;
