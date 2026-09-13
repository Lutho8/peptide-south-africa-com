CREATE TABLE "public"."suppressed_emails" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "email"      text                     NOT NULL,
  "reason"     text                     NOT NULL,
  "metadata"   jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "suppressed_emails_email_key" UNIQUE (email),
  CONSTRAINT "suppressed_emails_pkey" PRIMARY KEY (id),
  CONSTRAINT "suppressed_emails_reason_check" CHECK ((reason = ANY (ARRAY['unsubscribe'::text, 'bounce'::text, 'complaint'::text])))
);

ALTER TABLE "public"."suppressed_emails"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_suppressed_emails_email ON public.suppressed_emails USING btree (email);

CREATE POLICY "Service role can insert suppressed emails" ON "public"."suppressed_emails"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can read suppressed emails" ON "public"."suppressed_emails"
  FOR SELECT
  TO PUBLIC
  USING ((auth.role() = 'service_role'::text));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."suppressed_emails" TO "anon", "authenticated", "postgres", "service_role";
