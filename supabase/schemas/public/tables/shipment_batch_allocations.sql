CREATE TABLE "public"."shipment_batch_allocations" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "shipment_id"      uuid                     NOT NULL,
  "product_slug"     text                     NOT NULL,
  "variant_label"    text,
  "lot_number"       text                     NOT NULL,
  "expires_at"       date,
  "quantity"         integer                  NOT NULL DEFAULT 1,
  "product_batch_id" uuid,
  "allocated_by"     uuid,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "shipment_batch_allocations_allocated_by_fkey" FOREIGN KEY (allocated_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "shipment_batch_allocations_pkey" PRIMARY KEY (id),
  CONSTRAINT "shipment_batch_allocations_product_batch_id_fkey" FOREIGN KEY (product_batch_id) REFERENCES public.product_batches(id) ON DELETE SET NULL,
  CONSTRAINT "shipment_batch_allocations_quantity_check" CHECK ((quantity > 0)),
  CONSTRAINT "shipment_batch_allocations_shipment_id_product_slug_variant_key" UNIQUE NULLS NOT DISTINCT (shipment_id, product_slug, variant_label, lot_number),
  CONSTRAINT "shipment_batch_allocations_shipment_id_fkey" FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE
);

ALTER TABLE "public"."shipment_batch_allocations"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shipment_batch_allocations_product_batch ON public.shipment_batch_allocations USING btree (product_batch_id)
  WHERE (product_batch_id IS NOT NULL);

CREATE INDEX idx_shipment_batch_allocations_shipment ON public.shipment_batch_allocations USING btree (shipment_id);

CREATE POLICY "admins_manage_shipment_batch_allocations" ON "public"."shipment_batch_allocations"
  FOR ALL
  TO "authenticated"
  USING (( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role))
  WITH CHECK (( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."shipment_batch_allocations" TO "postgres", "service_role";
