CREATE TABLE "public"."psa_email_sends" (
  "id"             integer                     NOT NULL DEFAULT nextval('public.psa_email_sends_id_seq'::regclass),
  "customer_email" character varying(255),
  "customer_id"    integer,
  "template_id"    character varying(100),
  "sequence_name"  character varying(100),
  "sequence_step"  integer,
  "sent_at"        timestamp without time zone,
  "opened_at"      timestamp without time zone,
  "clicked_at"     timestamp without time zone,
  "bounced"        boolean                     DEFAULT false,
  "spam_reported"  boolean                     DEFAULT false,
  "unsubscribed"   boolean                     DEFAULT false,
  "device"         character varying(50),
  "created_at"     timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_email_sends_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id),
  CONSTRAINT "psa_email_sends_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_email_sends"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_email_sends_id_seq" OWNED BY "public"."psa_email_sends"."id";

CREATE INDEX idx_psa_email_cust ON public.psa_email_sends USING btree (customer_email);

CREATE INDEX idx_psa_email_sent ON public.psa_email_sends USING btree (sent_at DESC);

CREATE INDEX idx_psa_email_seq ON public.psa_email_sends USING btree (sequence_name, sequence_step);

CREATE INDEX idx_psa_email_template ON public.psa_email_sends USING btree (template_id);

CREATE POLICY "sr_psa_email_sends" ON "public"."psa_email_sends"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_email_sends" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_email_sends" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_email_sends" TO "postgres", "service_role";
