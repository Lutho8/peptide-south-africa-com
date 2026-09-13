CREATE OR REPLACE FUNCTION tracker.has_role (
  _user_id uuid,
  _role    tracker.app_role
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select _user_id = (select auth.uid())
    and exists (
      select 1
      from tracker.user_roles
      where user_id = _user_id and role = _role
    )
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."has_role"(uuid, tracker.app_role) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."has_role"(uuid, tracker.app_role) FROM PUBLIC;
