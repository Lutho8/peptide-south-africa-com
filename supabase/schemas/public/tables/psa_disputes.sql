CREATE TABLE "public"."psa_disputes" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "order_id"       text,
  "customer_email" text,
  "type"           text                     NOT NULL,
  "amount"         numeric(12,2),
  "reason"         text,
  "status"         text                     NOT NULL DEFAULT 'open'::text,
  "resolved_at"    timestamp with time zone,
  "notes"          text,
  CONSTRAINT "psa_disputes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_disputes"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX psa_disputes_status_idx ON public.psa_disputes USING btree (status, created_at DESC);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_disputes" TO "anon", "authenticated", "postgres", "service_role";
