CREATE TABLE "public"."psa_payment_discrepancies" (
  "id"                    integer                     NOT NULL DEFAULT nextval('public.psa_payment_discrepancies_id_seq'::regclass),
  "order_id"              character varying(100),
  "expected_amount"       numeric(10,2),
  "actual_amount"         numeric(10,2),
  "discrepancy_type"      character varying(50),
  "payment_processor"     character varying(50),
  "transaction_reference" character varying(255),
  "status"                character varying(50),
  "resolution_notes"      text,
  "resolved_at"           timestamp without time zone,
  "created_at"            timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_payment_discrepancies_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_payment_discrepancies"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_payment_discrepancies_id_seq" OWNED BY "public"."psa_payment_discrepancies"."id";

CREATE INDEX idx_psa_disc_created ON public.psa_payment_discrepancies USING btree (created_at DESC);

CREATE INDEX idx_psa_disc_order ON public.psa_payment_discrepancies USING btree (order_id);

CREATE INDEX idx_psa_disc_status ON public.psa_payment_discrepancies USING btree (status);

CREATE POLICY "sr_psa_payment_discrepancies" ON "public"."psa_payment_discrepancies"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_payment_discrepancies" TO "anon", "authenticated", "postgres", "service_role";
