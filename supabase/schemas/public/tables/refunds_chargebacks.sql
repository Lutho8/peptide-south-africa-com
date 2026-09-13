CREATE TABLE "public"."refunds_chargebacks" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "order_ref"         text                     NOT NULL,
  "customer_id"       integer,
  "type"              text                     NOT NULL,
  "reason"            text,
  "amount"            numeric(10,2)            NOT NULL,
  "processor"         text,
  "status"            text                     NOT NULL DEFAULT 'requested'::text,
  "evidence_due_date" date,
  "cpa_basis"         text,
  "notes"             text,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "refunds_chargebacks_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id) ON DELETE SET NULL,
  CONSTRAINT "refunds_chargebacks_pkey" PRIMARY KEY (id),
  CONSTRAINT "refunds_chargebacks_processor_check" CHECK ((processor = ANY (ARRAY['payfast'::text, 'yoco'::text, 'ozow'::text, 'eft'::text, 'other'::text]))),
  CONSTRAINT "refunds_chargebacks_status_check"
    CHECK ((status = ANY (ARRAY['requested'::text, 'evidence_due'::text, 'evidence_submitted'::text, 'won'::text, 'lost'::text, 'refunded'::text, 'closed'::text]))),
  CONSTRAINT "refunds_chargebacks_type_check" CHECK ((type = ANY (ARRAY['refund'::text, 'chargeback'::text])))
);

ALTER TABLE "public"."refunds_chargebacks"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rc_status ON public.refunds_chargebacks USING btree (status)
  WHERE (status <> ALL (ARRAY['won'::text, 'refunded'::text, 'closed'::text]));

CREATE TRIGGER t_rc_upd
  BEFORE UPDATE ON public.refunds_chargebacks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_ops();

CREATE POLICY "auth_full_rc" ON "public"."refunds_chargebacks"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."refunds_chargebacks" TO "anon", "authenticated", "postgres", "service_role";
