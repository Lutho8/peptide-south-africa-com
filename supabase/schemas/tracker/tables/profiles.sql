CREATE TABLE "tracker"."profiles" (
  "id"                      uuid                     NOT NULL,
  "display_name"            text,
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "email_reminders_enabled" boolean                  NOT NULL DEFAULT false,
  "full_name"               text,
  "age"                     integer,
  "gender"                  text,
  "height_cm"               numeric,
  "weight_kg"               numeric,
  "activity_level"          text,
  "experience"              text,
  "goals"                   text[]                   DEFAULT '{}'::text[],
  "profile_completed_at"    timestamp with time zone,
  CONSTRAINT "profiles_activity_check" CHECK (((activity_level IS NULL) OR (activity_level = ANY (ARRAY['sedentary'::text, 'moderate'::text, 'active'::text, 'athlete'::text])))),
  CONSTRAINT "profiles_display_name_length" CHECK ((char_length(display_name) <= 100)),
  CONSTRAINT "profiles_experience_check" CHECK (((experience IS NULL) OR (experience = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))),
  CONSTRAINT "profiles_gender_check" CHECK (((gender IS NULL) OR (gender = ANY (ARRAY['male'::text, 'female'::text])))),
  CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON tracker.profiles
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "admin_select" ON "tracker"."profiles"
  FOR SELECT
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

CREATE POLICY "owner_insert" ON "tracker"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "owner_select" ON "tracker"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "owner_update" ON "tracker"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."profiles" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."profiles" TO "postgres", "service_role";
