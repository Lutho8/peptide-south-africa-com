CREATE TABLE "public"."email_outbox" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid,
  "recipient_email" text                     NOT NULL,
  "template"        text                     NOT NULL,
  "payload"         jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "send_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "sent_at"         timestamp with time zone,
  "status"          text                     NOT NULL DEFAULT 'queued'::text,
  "attempt_count"   integer                  NOT NULL DEFAULT 0,
  "error"           text,
  "idempotency_key" text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "email_outbox_idempotency_key_key" UNIQUE (idempotency_key),
  CONSTRAINT "email_outbox_pkey" PRIMARY KEY (id),
  CONSTRAINT "email_outbox_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE "public"."email_outbox"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_outbox_pending ON public.email_outbox USING btree (status, send_at)
  WHERE (status = 'pending'::text);

CREATE INDEX idx_email_outbox_ready ON public.email_outbox USING btree (send_at)
  WHERE (status = 'queued'::text);

CREATE TRIGGER trg_email_outbox_updated_at
  BEFORE UPDATE ON public.email_outbox
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins view outbox" ON "public"."email_outbox"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "No user access to email_outbox" ON "public"."email_outbox"
  FOR ALL
  TO PUBLIC
  USING (false);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."email_outbox" TO "anon", "authenticated", "postgres", "service_role";
