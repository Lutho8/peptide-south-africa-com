CREATE OR REPLACE FUNCTION public.touch_postnet_shipment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF NEW.status = 'picking' AND OLD.status IS DISTINCT FROM 'picking' THEN
    NEW.picked_at := COALESCE(NEW.picked_at, now());
  ELSIF NEW.status = 'packed' AND OLD.status IS DISTINCT FROM 'packed' THEN
    NEW.packed_at := COALESCE(NEW.packed_at, now());
  ELSIF NEW.status = 'dispatched' AND OLD.status IS DISTINCT FROM 'dispatched' THEN
    NEW.dispatched_at := COALESCE(NEW.dispatched_at, now());
    NEW.ship_date := COALESCE(NEW.ship_date, current_date);
  ELSIF NEW.status = 'ready_for_collection' AND OLD.status IS DISTINCT FROM 'ready_for_collection' THEN
    NEW.ready_for_collection_at := COALESCE(NEW.ready_for_collection_at, now());
  ELSIF NEW.status = 'delivered' AND OLD.status IS DISTINCT FROM 'delivered' THEN
    NEW.delivered_at := COALESCE(NEW.delivered_at, now());
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."touch_postnet_shipment"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
