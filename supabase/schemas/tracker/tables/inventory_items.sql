CREATE TABLE "tracker"."inventory_items" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "peptide_id"       text                     NOT NULL,
  "peptide_name"     text                     NOT NULL,
  "vial_total_mg"    numeric                  NOT NULL,
  "bac_water_ml"     numeric,
  "reconstituted_at" timestamp with time zone,
  "expires_at"       timestamp with time zone,
  "remaining_mg"     numeric                  NOT NULL,
  "lot_number"       text,
  "vendor"           text,
  "coa_url"          text,
  "status"           text                     NOT NULL DEFAULT 'sealed'::text,
  "notes"            text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "inventory_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "inventory_items_status_check" CHECK ((status = ANY (ARRAY['sealed'::text, 'active'::text, 'finished'::text, 'expired'::text, 'discarded'::text]))),
  CONSTRAINT "inventory_items_vial_total_mg_check" CHECK ((vial_total_mg > (0)::numeric))
);

ALTER TABLE "tracker"."inventory_items"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_inventory_user_peptide_status ON tracker.inventory_items USING btree (user_id, peptide_id, status);

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON tracker.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."inventory_items"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."inventory_items"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."inventory_items"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."inventory_items"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."inventory_items" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."inventory_items" TO "postgres", "service_role";
