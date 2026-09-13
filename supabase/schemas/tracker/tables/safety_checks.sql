CREATE TABLE "tracker"."safety_checks" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           uuid                     NOT NULL,
  "peptide_id"        text                     NOT NULL,
  "profile_hash"      text                     NOT NULL,
  "status"            text                     NOT NULL,
  "severity"          text                     NOT NULL,
  "warnings"          jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "contraindications" jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "reasoning"         text,
  "expires_at"        timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "safety_checks_pkey" PRIMARY KEY (id),
  CONSTRAINT "safety_checks_user_id_peptide_id_profile_hash_key" UNIQUE (user_id, peptide_id, profile_hash)
);

ALTER TABLE "tracker"."safety_checks"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_safety_checks_lookup ON tracker.safety_checks USING btree (user_id, peptide_id, expires_at);

CREATE POLICY "owner_delete" ON "tracker"."safety_checks"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."safety_checks"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."safety_checks"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."safety_checks"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."safety_checks" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."safety_checks" TO "postgres", "service_role";
