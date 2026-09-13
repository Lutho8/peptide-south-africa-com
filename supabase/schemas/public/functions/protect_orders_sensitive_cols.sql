CREATE OR REPLACE FUNCTION public.protect_orders_sensitive_cols()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.total IS DISTINCT FROM OLD.total
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.payfast_token IS DISTINCT FROM OLD.payfast_token
     OR NEW.payfast_pf_payment_id IS DISTINCT FROM OLD.payfast_pf_payment_id
     OR NEW.shipping_cost IS DISTINCT FROM OLD.shipping_cost
     OR NEW.shipping_currency IS DISTINCT FROM OLD.shipping_currency
     OR NEW.free_shipping_applied IS DISTINCT FROM OLD.free_shipping_applied
     OR NEW.discount_code IS DISTINCT FROM OLD.discount_code
     OR NEW.order_description IS DISTINCT FROM OLD.order_description THEN
    RAISE EXCEPTION 'Not allowed to modify protected order fields';
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."protect_orders_sensitive_cols"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."protect_orders_sensitive_cols"() FROM PUBLIC;
