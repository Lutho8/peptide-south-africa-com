CREATE OR REPLACE FUNCTION public.set_updated_at_ops()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
begin new.updated_at = now(); return new; end $function$;

GRANT EXECUTE ON FUNCTION "public"."set_updated_at_ops"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
