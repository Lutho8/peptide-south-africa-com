CREATE TABLE "tracker"."email_unsubscribe_tokens" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "token"      text                     NOT NULL,
  "email"      text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "used_at"    timestamp with time zone,
  CONSTRAINT "email_unsubscribe_tokens_email_key" UNIQUE (email),
  CONSTRAINT "email_unsubscribe_tokens_pkey" PRIMARY KEY (id),
  CONSTRAINT "email_unsubscribe_tokens_token_key" UNIQUE (token)
);

ALTER TABLE "tracker"."email_unsubscribe_tokens"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_unsubscribe_tokens_token ON tracker.email_unsubscribe_tokens USING btree (token);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."email_unsubscribe_tokens" TO "postgres", "service_role";
