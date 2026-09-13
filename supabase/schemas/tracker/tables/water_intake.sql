CREATE TABLE "tracker"."water_intake" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "date"       date                     NOT NULL,
  "amount_ml"  integer                  NOT NULL DEFAULT 0,
  "goal_ml"    integer                  NOT NULL DEFAULT 2500,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "water_intake_pkey" PRIMARY KEY (id),
  CONSTRAINT "water_intake_user_id_date_key" UNIQUE (user_id, date)
);

ALTER TABLE "tracker"."water_intake"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_water_intake_updated_at
  BEFORE UPDATE ON tracker.water_intake
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."water_intake"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."water_intake"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."water_intake"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."water_intake"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."water_intake" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."water_intake" TO "postgres", "service_role";
