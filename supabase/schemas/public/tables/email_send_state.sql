CREATE TABLE "public"."email_send_state" (
  "id"                              integer                  NOT NULL DEFAULT 1,
  "retry_after_until"               timestamp with time zone,
  "batch_size"                      integer                  NOT NULL DEFAULT 10,
  "send_delay_ms"                   integer                  NOT NULL DEFAULT 200,
  "auth_email_ttl_minutes"          integer                  NOT NULL DEFAULT 15,
  "transactional_email_ttl_minutes" integer                  NOT NULL DEFAULT 60,
  "updated_at"                      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "email_send_state_id_check" CHECK ((id = 1)),
  CONSTRAINT "email_send_state_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."email_send_state"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage send state" ON "public"."email_send_state"
  FOR ALL
  TO PUBLIC
  USING ((auth.role() = 'service_role'::text))
  WITH CHECK ((auth.role() = 'service_role'::text));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."email_send_state" TO "anon", "authenticated", "postgres", "service_role";
