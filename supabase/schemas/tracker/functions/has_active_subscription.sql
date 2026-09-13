CREATE OR REPLACE FUNCTION tracker.has_active_subscription (
  _user_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
  SELECT EXISTS (
    SELECT 1 FROM tracker.subscriptions
    WHERE user_id = _user_id
      AND status IN ('active','trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."has_active_subscription"(uuid) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."has_active_subscription"(uuid) FROM PUBLIC;
