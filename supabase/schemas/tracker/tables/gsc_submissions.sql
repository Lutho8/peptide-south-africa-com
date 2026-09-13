CREATE TABLE "tracker"."gsc_submissions" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "site_url"     text                     NOT NULL,
  "sitemap_url"  text                     NOT NULL,
  "submitted_at" timestamp with time zone NOT NULL DEFAULT now(),
  "status"       text                     NOT NULL,
  "http_status"  integer,
  "errors"       jsonb                    DEFAULT '[]'::jsonb,
  "warnings"     integer                  DEFAULT 0,
  "source"       text                     NOT NULL DEFAULT 'manual'::text,
  CONSTRAINT "gsc_submissions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."gsc_submissions"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX gsc_submissions_submitted_at_idx ON tracker.gsc_submissions USING btree (submitted_at DESC);

CREATE POLICY "admin_all" ON "tracker"."gsc_submissions"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."gsc_submissions" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."gsc_submissions" TO "postgres", "service_role";
