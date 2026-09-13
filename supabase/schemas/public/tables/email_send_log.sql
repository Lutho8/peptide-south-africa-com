CREATE TABLE "public"."email_send_log" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "message_id"      text,
  "template_name"   text                     NOT NULL,
  "recipient_email" text                     NOT NULL,
  "status"          text                     NOT NULL,
  "error_message"   text,
  "metadata"        jsonb,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "email_send_log_pkey" PRIMARY KEY (id),
  CONSTRAINT "email_send_log_status_check"
    CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'suppressed'::text, 'failed'::text, 'bounced'::text, 'complained'::text, 'dlq'::text])))
);

ALTER TABLE "public"."email_send_log"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_send_log_created ON public.email_send_log USING btree (created_at DESC);

CREATE UNIQUE INDEX idx_email_send_log_message_sent_unique ON public.email_send_log USING btree (message_id)
  WHERE (status = 'sent'::text);

CREATE INDEX idx_email_send_log_message ON public.email_send_log USING btree (message_id);

CREATE INDEX idx_email_send_log_recipient ON public.email_send_log USING btree (recipient_email);

CREATE POLICY "Service role can insert send log" ON "public"."email_send_log"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can read send log" ON "public"."email_send_log"
  FOR SELECT
  TO PUBLIC
  USING ((auth.role() = 'service_role'::text));

CREATE POLICY "Service role can update send log" ON "public"."email_send_log"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.role() = 'service_role'::text))
  WITH CHECK ((auth.role() = 'service_role'::text));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."email_send_log" TO "anon", "authenticated", "postgres", "service_role";
