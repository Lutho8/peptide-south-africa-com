CREATE OR REPLACE FUNCTION public.protect_subscription_sensitive_cols()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.payfast_subscription_id IS DISTINCT FROM OLD.payfast_subscription_id
     OR NEW.payfast_token IS DISTINCT FROM OLD.payfast_token
     OR NEW.unit_price_zar IS DISTINCT FROM OLD.unit_price_zar
     OR NEW.discount_pct IS DISTINCT FROM OLD.discount_pct
     OR NEW.interval_weeks IS DISTINCT FROM OLD.interval_weeks
     OR NEW.product_slug IS DISTINCT FROM OLD.product_slug
     OR NEW.variant_label IS DISTINCT FROM OLD.variant_label
     OR NEW.next_charge_at IS DISTINCT FROM OLD.next_charge_at
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify sensitive subscription fields';
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."protect_subscription_sensitive_cols"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."protect_subscription_sensitive_cols"() FROM PUBLIC;
