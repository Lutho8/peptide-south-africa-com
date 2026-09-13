CREATE TABLE "tracker"."tracking_periods" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "peptide_id"            text                     NOT NULL,
  "peptide_name"          text                     NOT NULL,
  "recorded_amount"       text                     NOT NULL,
  "recorded_frequency"    text                     NOT NULL,
  "start_date"            date                     NOT NULL,
  "planned_duration_days" integer                  NOT NULL,
  "recorded_pause_days"   integer                  NOT NULL DEFAULT 0,
  "status"                text                     NOT NULL DEFAULT 'active'::text,
  "notes"                 text,
  "pause_reason"          text,
  "paused_at"             date,
  "resumed_at"            date,
  "missed_days"           integer,
  "split_parts"           integer,
  "dose_times"            text[]                   NOT NULL DEFAULT '{}'::text[],
  "reminder_enabled"      boolean                  NOT NULL DEFAULT false,
  "reminder_lead_minutes" integer,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "tracking_periods_missed_days_check" CHECK (((missed_days IS NULL) OR (missed_days >= 0))),
  CONSTRAINT "tracking_periods_pause_reason_check" CHECK (((pause_reason IS NULL) OR (pause_reason = ANY (ARRAY['missed_doses'::text, 'out_of_stock'::text, 'other'::text])))),
  CONSTRAINT "tracking_periods_pkey" PRIMARY KEY (id),
  CONSTRAINT "tracking_periods_planned_duration_days_check" CHECK ((planned_duration_days > 0)),
  CONSTRAINT "tracking_periods_recorded_pause_days_check" CHECK ((recorded_pause_days >= 0)),
  CONSTRAINT "tracking_periods_reminder_lead_minutes_check" CHECK (((reminder_lead_minutes IS NULL) OR (reminder_lead_minutes >= 0))),
  CONSTRAINT "tracking_periods_split_parts_check" CHECK (((split_parts IS NULL) OR (split_parts > 0))),
  CONSTRAINT "tracking_periods_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'break'::text, 'completed'::text]))),
  CONSTRAINT "tracking_periods_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."tracking_periods"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tracking_periods_user_status_start ON tracker.tracking_periods USING btree (user_id, status, start_date DESC);

CREATE TRIGGER update_tracking_periods_updated_at
  BEFORE UPDATE ON tracker.tracking_periods
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."tracking_periods"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."tracking_periods"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."tracking_periods"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."tracking_periods"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."tracking_periods" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."tracking_periods" TO "postgres", "service_role";
