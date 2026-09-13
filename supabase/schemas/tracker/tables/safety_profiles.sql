CREATE TABLE "tracker"."safety_profiles" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "medications"      text[]                   NOT NULL DEFAULT '{}'::text[],
  "conditions"       text[]                   NOT NULL DEFAULT '{}'::text[],
  "allergies"        text[]                   NOT NULL DEFAULT '{}'::text[],
  "is_pregnant"      boolean                  NOT NULL DEFAULT false,
  "age"              integer,
  "sex"              text,
  "weight_kg"        numeric,
  "kidney_status"    text,
  "liver_status"     text,
  "oncology_history" boolean                  NOT NULL DEFAULT false,
  "notes"            text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "safety_profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "safety_profiles_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "tracker"."safety_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_safety_profiles_updated
  BEFORE UPDATE ON tracker.safety_profiles
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."safety_profiles"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."safety_profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."safety_profiles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."safety_profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."safety_profiles" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."safety_profiles" TO "postgres", "service_role";
