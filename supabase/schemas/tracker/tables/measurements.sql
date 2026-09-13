CREATE TABLE "tracker"."measurements" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "date"           date                     NOT NULL,
  "waist_cm"       numeric,
  "hips_cm"        numeric,
  "chest_cm"       numeric,
  "left_arm_cm"    numeric,
  "right_arm_cm"   numeric,
  "left_thigh_cm"  numeric,
  "right_thigh_cm" numeric,
  "notes"          text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "measurements_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."measurements"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_measurements_updated_at
  BEFORE UPDATE ON tracker.measurements
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."measurements"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."measurements"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."measurements"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."measurements"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."measurements" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."measurements" TO "postgres", "service_role";
