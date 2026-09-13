CREATE TABLE "tracker"."email_send_state" (
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

ALTER TABLE "tracker"."email_send_state"
  ENABLE ROW LEVEL SECURITY;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."email_send_state" TO "postgres", "service_role";
