CREATE OR REPLACE FUNCTION public.psa_pets_waitlist_count()
  RETURNS bigint
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$ select count(*) from public.psa_pets_waitlist $function$;

GRANT EXECUTE ON FUNCTION "public"."psa_pets_waitlist_count"() TO "anon", "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."psa_pets_waitlist_count"() FROM PUBLIC;
