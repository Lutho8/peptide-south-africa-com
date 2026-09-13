CREATE TABLE "public"."email_unsubscribe_tokens" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "token"      text                     NOT NULL,
  "email"      text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "used_at"    timestamp with time zone,
  CONSTRAINT "email_unsubscribe_tokens_email_key" UNIQUE (email),
  CONSTRAINT "email_unsubscribe_tokens_pkey" PRIMARY KEY (id),
  CONSTRAINT "email_unsubscribe_tokens_token_key" UNIQUE (token)
);

ALTER TABLE "public"."email_unsubscribe_tokens"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens USING btree (token);

CREATE POLICY "Service role can insert tokens" ON "public"."email_unsubscribe_tokens"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can mark tokens as used" ON "public"."email_unsubscribe_tokens"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.role() = 'service_role'::text))
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can read tokens" ON "public"."email_unsubscribe_tokens"
  FOR SELECT
  TO PUBLIC
  USING ((auth.role() = 'service_role'::text));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."email_unsubscribe_tokens" TO "anon", "authenticated", "postgres", "service_role";
