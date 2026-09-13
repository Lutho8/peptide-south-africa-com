CREATE TABLE "public"."psa_whatsapp_sends" (
  "id"                  integer                     NOT NULL DEFAULT nextval('public.psa_whatsapp_sends_id_seq'::regclass),
  "customer_phone"      character varying(20),
  "customer_id"         integer,
  "template_name"       character varying(100),
  "message_type"        character varying(50),
  "sent_at"             timestamp without time zone,
  "delivered_at"        timestamp without time zone,
  "read_at"             timestamp without time zone,
  "failed"              boolean                     DEFAULT false,
  "fail_reason"         text,
  "whatsapp_message_id" character varying(255),
  "created_at"          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_whatsapp_sends_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id),
  CONSTRAINT "psa_whatsapp_sends_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_whatsapp_sends"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_whatsapp_sends_id_seq" OWNED BY "public"."psa_whatsapp_sends"."id";

CREATE INDEX idx_psa_wa_customer ON public.psa_whatsapp_sends USING btree (customer_id);

CREATE INDEX idx_psa_wa_phone ON public.psa_whatsapp_sends USING btree (customer_phone);

CREATE INDEX idx_psa_wa_template ON public.psa_whatsapp_sends USING btree (template_name);

CREATE POLICY "sr_psa_whatsapp_sends" ON "public"."psa_whatsapp_sends"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_whatsapp_sends" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_whatsapp_sends" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_whatsapp_sends" TO "postgres", "service_role";
