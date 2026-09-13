CREATE OR REPLACE FUNCTION tracker.decrement_inventory_on_dose()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
DECLARE
  target_id UUID;
BEGIN
  IF NEW.unit <> 'mg' THEN RETURN NEW; END IF;
  SELECT id INTO target_id
    FROM tracker.inventory_items
   WHERE user_id = NEW.user_id
     AND peptide_id = NEW.peptide_id
     AND status IN ('sealed','active')
     AND remaining_mg > 0
   ORDER BY COALESCE(reconstituted_at, created_at) ASC
   LIMIT 1;
  IF target_id IS NULL THEN RETURN NEW; END IF;
  UPDATE tracker.inventory_items
     SET remaining_mg = GREATEST(0, remaining_mg - NEW.dose),
         status = CASE
                    WHEN remaining_mg - NEW.dose <= 0 THEN 'finished'
                    WHEN status = 'sealed' THEN 'active'
                    ELSE status
                  END,
         updated_at = now()
   WHERE id = target_id;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."decrement_inventory_on_dose"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."decrement_inventory_on_dose"() FROM PUBLIC;
