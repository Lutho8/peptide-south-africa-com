CREATE OR REPLACE FUNCTION public.sync_shipment_to_crm_order()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF NEW.psa_order_id IS NOT NULL THEN
    UPDATE public.psa_orders SET
      fulfillment_status = NEW.status, courier = NEW.courier,
      tracking_number = NEW.tracking_number, packed_at = NEW.packed_at,
      shipped_at = NEW.dispatched_at, delivered_at = NEW.delivered_at,
      order_status = CASE
        WHEN NEW.status = 'delivered' THEN 'completed'
        WHEN NEW.status IN ('cancelled', 'returned') THEN NEW.status
        ELSE 'processing'
      END,
      updated_at = now()
    WHERE id = NEW.psa_order_id;
  END IF;
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.fulfilment_events (shipment_id, event, note, logged_by)
    VALUES (NEW.id, NEW.status, NEW.packing_notes, COALESCE((SELECT auth.uid())::text, 'system'));
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."sync_shipment_to_crm_order"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."sync_shipment_to_crm_order"() FROM PUBLIC;
