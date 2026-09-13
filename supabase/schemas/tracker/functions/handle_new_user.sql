CREATE OR REPLACE FUNCTION tracker.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
DECLARE
  safe_name TEXT;
BEGIN
  -- Sanitize and validate the display_name from user metadata
  safe_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    'User'
  );
  -- Limit length to prevent excessively long values
  safe_name := LEFT(safe_name, 100);
  -- Remove any potentially dangerous characters
  safe_name := regexp_replace(safe_name, '[<>"'';&]', '', 'g');

  INSERT INTO tracker.profiles (id, display_name)
  VALUES (NEW.id, safe_name);
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."handle_new_user"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."handle_new_user"() FROM PUBLIC;
