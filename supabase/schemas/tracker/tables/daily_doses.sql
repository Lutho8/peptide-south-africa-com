CREATE TABLE "tracker"."daily_doses" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid                     NOT NULL,
  "date"         date                     NOT NULL,
  "peptide_id"   text                     NOT NULL,
  "peptide_name" text                     NOT NULL,
  "dose"         numeric                  NOT NULL,
  "unit"         text                     NOT NULL,
  "time"         time without time zone   NOT NULL,
  "notes"        text,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "daily_doses_dose_check" CHECK ((dose > (0)::numeric)),
  CONSTRAINT "daily_doses_pkey" PRIMARY KEY (id),
  CONSTRAINT "daily_doses_unit_check" CHECK ((unit = ANY (ARRAY['mg'::text, 'IU'::text, 'units'::text])))
);

ALTER TABLE "tracker"."daily_doses"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_daily_doses_user_date ON tracker.daily_doses USING btree (user_id, date);

CREATE TRIGGER trg_decrement_inventory
  AFTER INSERT ON tracker.daily_doses
  FOR EACH ROW
  EXECUTE FUNCTION tracker.decrement_inventory_on_dose();

CREATE TRIGGER update_daily_doses_updated_at
  BEFORE UPDATE ON tracker.daily_doses
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."daily_doses"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."daily_doses"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."daily_doses"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."daily_doses"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."daily_doses" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."daily_doses" TO "postgres", "service_role";
