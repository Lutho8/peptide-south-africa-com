CREATE TABLE "tracker"."injection_records" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "site_id"        text                     NOT NULL,
  "peptide_id"     text                     NOT NULL,
  "peptide_name"   text,
  "dose_mg"        numeric,
  "route"          text                     NOT NULL DEFAULT 'subcutaneous'::text,
  "injected_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "pain_score"     smallint,
  "swelling_score" smallint,
  "notes"          text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "injection_records_pain_score_check" CHECK (((pain_score >= 0) AND (pain_score <= 10))),
  CONSTRAINT "injection_records_pkey" PRIMARY KEY (id),
  CONSTRAINT "injection_records_swelling_score_check" CHECK (((swelling_score >= 0) AND (swelling_score <= 10))),
  CONSTRAINT "injection_records_site_id_fkey" FOREIGN KEY (site_id) REFERENCES tracker.injection_sites(id)
);

ALTER TABLE "tracker"."injection_records"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_injection_records_site_id ON tracker.injection_records USING btree (site_id);

CREATE INDEX idx_injection_records_user_site ON tracker.injection_records USING btree (user_id, site_id, injected_at DESC);

CREATE INDEX idx_injection_records_user_time ON tracker.injection_records USING btree (user_id, injected_at DESC);

CREATE POLICY "owner_delete" ON "tracker"."injection_records"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."injection_records"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."injection_records"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."injection_records"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."injection_records" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."injection_records" TO "postgres", "service_role";
