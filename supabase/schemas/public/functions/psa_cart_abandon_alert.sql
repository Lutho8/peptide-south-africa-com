CREATE OR REPLACE FUNCTION public.psa_cart_abandon_alert()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF NEW.cart_subtotal > 2000 THEN
    NEW.status := 'high_value_abandoned';
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."psa_cart_abandon_alert"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
