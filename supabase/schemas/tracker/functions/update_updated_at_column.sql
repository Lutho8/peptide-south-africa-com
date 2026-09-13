CREATE OR REPLACE FUNCTION tracker.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'tracker'
  AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."update_updated_at_column"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."update_updated_at_column"() FROM PUBLIC;
