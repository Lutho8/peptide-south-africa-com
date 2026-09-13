CREATE TABLE "tracker"."food_logs" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "date"       date                     NOT NULL,
  "meal_name"  text                     NOT NULL,
  "meal_type"  text                     NOT NULL DEFAULT 'snack'::text,
  "calories"   integer                  NOT NULL DEFAULT 0,
  "protein_g"  numeric(6,1)             NOT NULL DEFAULT 0,
  "carbs_g"    numeric(6,1)             NOT NULL DEFAULT 0,
  "fat_g"      numeric(6,1)             NOT NULL DEFAULT 0,
  "fiber_g"    numeric(6,1)             NOT NULL DEFAULT 0,
  "notes"      text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "food_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."food_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_food_logs_updated_at
  BEFORE UPDATE ON tracker.food_logs
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."food_logs"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."food_logs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."food_logs"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."food_logs"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."food_logs" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."food_logs" TO "postgres", "service_role";
