CREATE TABLE "tracker"."protocol_adherence" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       uuid                     NOT NULL,
  "lab_report_id" uuid                     NOT NULL,
  "section"       text                     NOT NULL,
  "item_key"      text                     NOT NULL,
  "item_label"    text                     NOT NULL,
  "completed_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "protocol_adherence_pkey" PRIMARY KEY (id),
  CONSTRAINT "protocol_adherence_section_check" CHECK ((section = ANY (ARRAY['supplements'::text, 'nutrition'::text, 'exercise'::text, 'stress'::text]))),
  CONSTRAINT "protocol_adherence_user_id_lab_report_id_section_item_key_key" UNIQUE (user_id, lab_report_id, section, item_key)
);

ALTER TABLE "tracker"."protocol_adherence"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX protocol_adherence_user_report_idx ON tracker.protocol_adherence USING btree (user_id, lab_report_id);

CREATE INDEX protocol_adherence_user_section_completed_idx ON tracker.protocol_adherence USING btree (user_id, section, completed_at DESC);

CREATE POLICY "owner_delete" ON "tracker"."protocol_adherence"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."protocol_adherence"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."protocol_adherence"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."protocol_adherence"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."protocol_adherence" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."protocol_adherence" TO "postgres", "service_role";
