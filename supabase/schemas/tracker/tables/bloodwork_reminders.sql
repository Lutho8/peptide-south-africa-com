CREATE TABLE "tracker"."bloodwork_reminders" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "lab_report_id"   uuid                     NOT NULL,
  "kind"            text                     NOT NULL,
  "due_at"          timestamp with time zone NOT NULL,
  "notified_at"     timestamp with time zone,
  "acknowledged_at" timestamp with time zone,
  "status"          text                     NOT NULL DEFAULT 'pending'::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "bloodwork_reminders_kind_check" CHECK ((kind = ANY (ARRAY['pre'::text, 'due'::text, 'overdue'::text]))),
  CONSTRAINT "bloodwork_reminders_lab_report_id_kind_key" UNIQUE (lab_report_id, kind),
  CONSTRAINT "bloodwork_reminders_pkey" PRIMARY KEY (id),
  CONSTRAINT "bloodwork_reminders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'acknowledged'::text, 'dismissed'::text]))),
  CONSTRAINT "bloodwork_reminders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "bloodwork_reminders_lab_report_id_fkey" FOREIGN KEY (lab_report_id) REFERENCES tracker.lab_reports(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."bloodwork_reminders"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bloodwork_reminders_due ON tracker.bloodwork_reminders USING btree (due_at)
  WHERE (notified_at IS NULL);

CREATE INDEX idx_bloodwork_reminders_user ON tracker.bloodwork_reminders USING btree (user_id, status);

CREATE TRIGGER set_bloodwork_reminders_updated_at
  BEFORE UPDATE ON tracker.bloodwork_reminders
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."bloodwork_reminders"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."bloodwork_reminders"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."bloodwork_reminders"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."bloodwork_reminders"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."bloodwork_reminders" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."bloodwork_reminders" TO "postgres", "service_role";
