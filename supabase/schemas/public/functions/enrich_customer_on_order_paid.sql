CREATE OR REPLACE FUNCTION public.enrich_customer_on_order_paid()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    INSERT INTO public.customer_profiles (user_id, first_order_at, last_order_at, order_count, lifetime_value_zar)
    VALUES (NEW.user_id, NEW.paid_at, NEW.paid_at, 1, NEW.total)
    ON CONFLICT (user_id) DO UPDATE SET
      first_order_at = COALESCE(public.customer_profiles.first_order_at, EXCLUDED.first_order_at),
      last_order_at = EXCLUDED.last_order_at,
      order_count = public.customer_profiles.order_count + 1,
      lifetime_value_zar = public.customer_profiles.lifetime_value_zar + NEW.total,
      updated_at = now();
    INSERT INTO public.retention_events (user_id, event, meta)
    VALUES (NEW.user_id, 'order_paid', jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'provider', NEW.payment_provider));
  END IF;
  RETURN NEW;
END $function$;

GRANT EXECUTE ON FUNCTION "public"."enrich_customer_on_order_paid"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."enrich_customer_on_order_paid"() FROM PUBLIC;
