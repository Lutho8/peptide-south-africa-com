CREATE OR REPLACE FUNCTION tracker.bootstrap_admin_role()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
BEGIN
  -- Only grant admin role to the designated admin email
  IF NEW.email = 'lutho.kote@relicom.de' THEN
    INSERT INTO tracker.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."bootstrap_admin_role"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."bootstrap_admin_role"() FROM PUBLIC;
