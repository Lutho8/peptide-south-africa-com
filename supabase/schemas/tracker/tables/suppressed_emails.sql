CREATE TABLE "tracker"."suppressed_emails" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "email"      text                     NOT NULL,
  "reason"     text                     NOT NULL,
  "metadata"   jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "suppressed_emails_email_key" UNIQUE (email),
  CONSTRAINT "suppressed_emails_pkey" PRIMARY KEY (id),
  CONSTRAINT "suppressed_emails_reason_check" CHECK ((reason = ANY (ARRAY['unsubscribe'::text, 'bounce'::text, 'complaint'::text])))
);

ALTER TABLE "tracker"."suppressed_emails"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_suppressed_emails_email ON tracker.suppressed_emails USING btree (email);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."suppressed_emails" TO "postgres", "service_role";
