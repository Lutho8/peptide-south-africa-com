CREATE TABLE "tracker"."ai_request_usage" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "user_id"    uuid                     NOT NULL,
  "peptide_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ai_request_usage_pkey" PRIMARY KEY (id),
  CONSTRAINT "ai_request_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."ai_request_usage"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX ai_request_usage_user_created_idx ON tracker.ai_request_usage USING btree (user_id, created_at DESC);

CREATE POLICY "ai_request_usage_owner_insert" ON "tracker"."ai_request_usage"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "ai_request_usage_owner_select" ON "tracker"."ai_request_usage"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT INSERT, SELECT ON TABLE "tracker"."ai_request_usage" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."ai_request_usage" TO "postgres", "service_role";
