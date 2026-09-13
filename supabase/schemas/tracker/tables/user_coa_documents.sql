CREATE TABLE "tracker"."user_coa_documents" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"             uuid                     NOT NULL,
  "peptide_id"          text,
  "file_path"           text                     NOT NULL,
  "original_filename"   text                     NOT NULL,
  "mime_type"           text                     NOT NULL,
  "status"              text                     NOT NULL DEFAULT 'uploaded'::text,
  "sample_name"         text,
  "lab_name"            text,
  "report_number"       text,
  "batch_number"        text,
  "tested_at"           date,
  "identity_status"     text                     NOT NULL DEFAULT 'not_reported'::text,
  "hplc_status"         text                     NOT NULL DEFAULT 'not_reported'::text,
  "purity_pct"          numeric(6,3),
  "assay_status"        text                     NOT NULL DEFAULT 'not_reported'::text,
  "assay_pct"           numeric(6,3),
  "net_content_status"  text                     NOT NULL DEFAULT 'not_reported'::text,
  "net_content_mg"      numeric(10,3),
  "endotoxin_status"    text                     NOT NULL DEFAULT 'not_reported'::text,
  "sterility_status"    text                     NOT NULL DEFAULT 'not_reported'::text,
  "traceability_status" text                     NOT NULL DEFAULT 'not_reported'::text,
  "notes"               text,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_coa_documents_assay_pct_check" CHECK (((assay_pct IS NULL) OR ((assay_pct >= (0)::numeric) AND (assay_pct <= (100)::numeric)))),
  CONSTRAINT "user_coa_documents_assay_status_check" CHECK ((assay_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_batch_number_check" CHECK (((batch_number IS NULL) OR (char_length(batch_number) <= 120))),
  CONSTRAINT "user_coa_documents_endotoxin_status_check" CHECK ((endotoxin_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_file_path_check" CHECK (((char_length(file_path) >= 3) AND (char_length(file_path) <= 500))),
  CONSTRAINT "user_coa_documents_file_path_key" UNIQUE (file_path),
  CONSTRAINT "user_coa_documents_hplc_status_check" CHECK ((hplc_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_identity_status_check" CHECK ((identity_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_lab_name_check" CHECK (((lab_name IS NULL) OR (char_length(lab_name) <= 160))),
  CONSTRAINT "user_coa_documents_mime_type_check" CHECK ((mime_type = ANY (ARRAY['application/pdf'::text, 'image/jpeg'::text, 'image/png'::text, 'image/webp'::text]))),
  CONSTRAINT "user_coa_documents_net_content_mg_check" CHECK (((net_content_mg IS NULL) OR (net_content_mg >= (0)::numeric))),
  CONSTRAINT "user_coa_documents_net_content_status_check"
    CHECK ((net_content_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_notes_check" CHECK (((notes IS NULL) OR (char_length(notes) <= 3000))),
  CONSTRAINT "user_coa_documents_original_filename_check" CHECK (((char_length(original_filename) >= 1) AND (char_length(original_filename) <= 240))),
  CONSTRAINT "user_coa_documents_peptide_id_check" CHECK (((peptide_id IS NULL) OR ((char_length(peptide_id) >= 1) AND (char_length(peptide_id) <= 100)))),
  CONSTRAINT "user_coa_documents_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_coa_documents_purity_pct_check" CHECK (((purity_pct IS NULL) OR ((purity_pct >= (0)::numeric) AND (purity_pct <= (100)::numeric)))),
  CONSTRAINT "user_coa_documents_report_number_check" CHECK (((report_number IS NULL) OR (char_length(report_number) <= 120))),
  CONSTRAINT "user_coa_documents_sample_name_check" CHECK (((sample_name IS NULL) OR (char_length(sample_name) <= 200))),
  CONSTRAINT "user_coa_documents_status_check" CHECK ((status = ANY (ARRAY['uploaded'::text, 'reviewed'::text, 'needs_attention'::text]))),
  CONSTRAINT "user_coa_documents_sterility_status_check" CHECK ((sterility_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_traceability_status_check"
    CHECK ((traceability_status = ANY (ARRAY['shown'::text, 'incomplete'::text, 'not_reported'::text, 'not_applicable'::text]))),
  CONSTRAINT "user_coa_documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."user_coa_documents"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX user_coa_documents_user_created_idx ON tracker.user_coa_documents USING btree (user_id, created_at DESC);

CREATE INDEX user_coa_documents_user_peptide_idx ON tracker.user_coa_documents USING btree (user_id, peptide_id, created_at DESC);

CREATE TRIGGER user_coa_documents_set_updated_at
  BEFORE UPDATE ON tracker.user_coa_documents
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "user_coa_documents_owner_delete" ON "tracker"."user_coa_documents"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "user_coa_documents_owner_insert" ON "tracker"."user_coa_documents"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (split_part(file_path, '/'::text, 1) = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "user_coa_documents_owner_select" ON "tracker"."user_coa_documents"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "user_coa_documents_owner_update" ON "tracker"."user_coa_documents"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (split_part(file_path, '/'::text, 1) = (( SELECT auth.uid() AS uid))::text)));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."user_coa_documents" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."user_coa_documents" TO "postgres", "service_role";
