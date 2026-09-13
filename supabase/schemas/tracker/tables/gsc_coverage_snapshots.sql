CREATE TABLE "tracker"."gsc_coverage_snapshots" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "site_url"    text                     NOT NULL,
  "captured_at" timestamp with time zone NOT NULL DEFAULT now(),
  "submitted"   integer                  DEFAULT 0,
  "indexed"     integer                  DEFAULT 0,
  "errors"      integer                  DEFAULT 0,
  "warnings"    integer                  DEFAULT 0,
  "raw"         jsonb,
  CONSTRAINT "gsc_coverage_snapshots_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."gsc_coverage_snapshots"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX gsc_coverage_snapshots_captured_at_idx ON tracker.gsc_coverage_snapshots USING btree (captured_at DESC);

CREATE POLICY "admin_all" ON "tracker"."gsc_coverage_snapshots"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."gsc_coverage_snapshots" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."gsc_coverage_snapshots" TO "postgres", "service_role";
