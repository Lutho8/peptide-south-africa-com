CREATE TABLE "tracker"."audit_logs" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "action"      text                     NOT NULL,
  "entity_type" text,
  "entity_id"   text,
  "metadata"    jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."audit_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX audit_logs_action_created_at_idx ON tracker.audit_logs USING btree (action, created_at DESC);

CREATE INDEX audit_logs_user_id_created_at_idx ON tracker.audit_logs USING btree (user_id, created_at DESC);

CREATE POLICY "owner_insert" ON "tracker"."audit_logs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."audit_logs"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."audit_logs" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."audit_logs" TO "postgres", "service_role";
