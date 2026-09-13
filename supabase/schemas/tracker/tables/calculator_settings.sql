CREATE TABLE "tracker"."calculator_settings" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "syringe_type"          text                     NOT NULL DEFAULT 'u40'::text,
  "experience_level"      text                     NOT NULL DEFAULT 'intermediate'::text,
  "last_vial_size"        text,
  "last_bac_water"        text,
  "last_target_dose"      text,
  "last_selected_peptide" text,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "calculator_settings_pkey" PRIMARY KEY (id),
  CONSTRAINT "calculator_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "calculator_settings_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "tracker"."calculator_settings"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_calculator_settings_updated_at
  BEFORE UPDATE ON tracker.calculator_settings
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."calculator_settings"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."calculator_settings"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."calculator_settings"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."calculator_settings"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."calculator_settings" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."calculator_settings" TO "postgres", "service_role";
