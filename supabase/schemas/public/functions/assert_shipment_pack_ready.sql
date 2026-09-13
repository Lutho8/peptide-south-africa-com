CREATE OR REPLACE FUNCTION public.assert_shipment_pack_ready()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if new.status in ('ready_for_collection', 'dispatched', 'in_transit', 'delivered') then
    if not (
      coalesce((new.packing_checklist ->> 'items_verified')::boolean, false)
      and coalesce((new.packing_checklist ->> 'batch_verified')::boolean, false)
      and coalesce((new.packing_checklist ->> 'insulation_added')::boolean, false)
      and coalesce((new.packing_checklist ->> 'cold_pack_added')::boolean, false)
      and coalesce((new.packing_checklist ->> 'tamper_seal_applied')::boolean, false)
      and coalesce((new.packing_checklist ->> 'insert_added')::boolean, false)
      and coalesce((new.packing_checklist ->> 'final_check')::boolean, false)
    ) then
      raise exception 'Shipment cannot be released: packing checklist is incomplete';
    end if;

    if nullif(btrim(new.tamper_seal_number), '') is null then
      raise exception 'Shipment cannot be released: tamper seal number is required';
    end if;

    if new.packed_at is null then
      raise exception 'Shipment cannot be released: packed_at is required';
    end if;

    if not exists (
      select 1 from public.shipment_batch_allocations
      where shipment_id = new.id
    ) then
      raise exception 'Shipment cannot be released: batch allocation is required';
    end if;
  end if;

  return new;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."assert_shipment_pack_ready"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."assert_shipment_pack_ready"() FROM PUBLIC;
