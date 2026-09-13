CREATE TABLE "public"."psa_fraud_signals" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "signal_type" text                     NOT NULL,
  "severity"    text                     NOT NULL DEFAULT 'medium'::text,
  "reference"   text,
  "payer_name"  text,
  "amount"      numeric(12,2),
  "deposit_id"  uuid,
  "order_id"    text,
  "details"     jsonb,
  "status"      text                     NOT NULL DEFAULT 'open'::text,
  CONSTRAINT "psa_fraud_signals_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_fraud_signals"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX psa_fraud_signals_reference_idx ON public.psa_fraud_signals USING btree (reference);

CREATE INDEX psa_fraud_signals_status_idx ON public.psa_fraud_signals USING btree (status, created_at DESC);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_fraud_signals" TO "anon", "authenticated", "postgres", "service_role";
