CREATE TABLE "tracker"."lab_reports" (
  "id"                         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                    uuid                     NOT NULL,
  "uploaded_at"                timestamp with time zone NOT NULL DEFAULT now(),
  "file_url"                   text                     NOT NULL,
  "file_name"                  text                     NOT NULL,
  "report_date"                date,
  "status"                     text                     NOT NULL DEFAULT 'pending'::text,
  "ai_summary"                 text,
  "extracted_biomarkers"       jsonb                    DEFAULT '[]'::jsonb,
  "ai_insights"                text,
  "created_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  "scan_type"                  text                     NOT NULL DEFAULT 'baseline'::text,
  "patient_age"                integer,
  "patient_sex"                text,
  "goals"                      text[]                   NOT NULL DEFAULT '{}'::text[],
  "peptide_history_used"       boolean,
  "peptide_history_notes"      text,
  "health_score"               integer,
  "protocol"                   jsonb,
  "recommended_stack_peptides" text[]                   NOT NULL DEFAULT '{}'::text[],
  "ai_summary_de"              text,
  "ai_insights_de"             text,
  "detected_language"          text,
  CONSTRAINT "lab_reports_health_score_range" CHECK (((health_score IS NULL) OR ((health_score >= 0) AND (health_score <= 100)))),
  CONSTRAINT "lab_reports_pkey" PRIMARY KEY (id),
  CONSTRAINT "lab_reports_scan_type_check" CHECK ((scan_type = ANY (ARRAY['baseline'::text, 'deep'::text])))
);

ALTER TABLE "tracker"."lab_reports"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tracker"."lab_reports"
  REPLICA IDENTITY FULL;

CREATE TRIGGER trg_schedule_bloodwork_reminders
  AFTER UPDATE ON tracker.lab_reports
  FOR EACH ROW
  EXECUTE FUNCTION tracker.schedule_bloodwork_reminders();

CREATE POLICY "owner_delete" ON "tracker"."lab_reports"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."lab_reports"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."lab_reports"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."lab_reports"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."lab_reports" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."lab_reports" TO "postgres", "service_role";
