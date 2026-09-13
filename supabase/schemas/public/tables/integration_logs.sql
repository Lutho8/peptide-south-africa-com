CREATE TABLE "public"."integration_logs" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "integration" text                     NOT NULL,
  "action"      text                     NOT NULL,
  "status"      text                     NOT NULL,
  "payload"     jsonb,
  "error"       text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "integration_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."integration_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_integration_logs_created ON public.integration_logs USING btree (created_at DESC);

CREATE POLICY "Admins view integration logs" ON "public"."integration_logs"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."integration_logs" TO "anon", "authenticated", "postgres", "service_role";
