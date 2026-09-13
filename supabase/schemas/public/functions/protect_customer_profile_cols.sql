CREATE OR REPLACE FUNCTION public.protect_customer_profile_cols()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.lifetime_value_zar := OLD.lifetime_value_zar;
    NEW.order_count := OLD.order_count;
    NEW.first_order_at := OLD.first_order_at;
    NEW.last_order_at := OLD.last_order_at;
    NEW.notes := OLD.notes;
    NEW.gp_consult_status := OLD.gp_consult_status;
  END IF;
  RETURN NEW;
END $function$;

GRANT EXECUTE ON FUNCTION "public"."protect_customer_profile_cols"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."protect_customer_profile_cols"() FROM PUBLIC;
