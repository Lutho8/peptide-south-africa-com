CREATE OR REPLACE FUNCTION public.psa_update_timestamp()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."psa_update_timestamp"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
