CREATE TABLE "tracker"."dose_reminders" (
  "id"                         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                    uuid                     NOT NULL,
  "peptide_id"                 text                     NOT NULL,
  "peptide_name"               text                     NOT NULL,
  "dose"                       text                     NOT NULL,
  "time"                       time without time zone   NOT NULL,
  "days"                       text[]                   NOT NULL DEFAULT '{}'::text[],
  "enabled"                    boolean                  NOT NULL DEFAULT true,
  "created_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  "email_notification_enabled" boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "dose_reminders_pkey" PRIMARY KEY (id),
  CONSTRAINT "dose_reminders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."dose_reminders"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_dose_reminders_user_id ON tracker.dose_reminders USING btree (user_id);

CREATE TRIGGER update_dose_reminders_updated_at
  BEFORE UPDATE ON tracker.dose_reminders
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."dose_reminders"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."dose_reminders"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."dose_reminders"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."dose_reminders"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."dose_reminders" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."dose_reminders" TO "postgres", "service_role";
