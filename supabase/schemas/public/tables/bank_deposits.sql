CREATE TABLE "public"."bank_deposits" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "received_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "amount"           numeric(10,2)            NOT NULL,
  "reference"        text,
  "payer_name"       text,
  "raw"              jsonb,
  "source"           text                     NOT NULL DEFAULT 'capitec_email'::text,
  "dedupe_key"       text,
  "matched_order_id" text,
  "status"           text                     NOT NULL DEFAULT 'unmatched'::text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "bank_deposits_dedupe_key_key" UNIQUE (dedupe_key),
  CONSTRAINT "bank_deposits_pkey" PRIMARY KEY (id),
  CONSTRAINT "bank_deposits_status_check" CHECK ((status = ANY (ARRAY['unmatched'::text, 'matched'::text, 'ignored'::text, 'duplicate'::text])))
);

ALTER TABLE "public"."bank_deposits"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX bank_deposits_reference_idx ON public.bank_deposits USING btree (reference);

CREATE INDEX bank_deposits_status_idx ON public.bank_deposits USING btree (status);

CREATE POLICY "bank_deposits_service_role_all" ON "public"."bank_deposits"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."bank_deposits" TO "anon", "authenticated", "postgres", "service_role";
