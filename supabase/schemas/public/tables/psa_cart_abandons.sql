CREATE TABLE "public"."psa_cart_abandons" (
  "id"                          integer                  NOT NULL DEFAULT nextval('public.psa_cart_abandons_id_seq'::regclass),
  "user_id"                     uuid,
  "email"                       text,
  "cart_items"                  jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "cart_subtotal"               numeric(10,2)            NOT NULL DEFAULT 0,
  "abandoned_at"                timestamp with time zone DEFAULT now(),
  "recovery_email_1_sent_at"    timestamp with time zone,
  "recovery_email_1_opened"     boolean                  DEFAULT false,
  "recovery_email_2_sent_at"    timestamp with time zone,
  "recovery_email_2_opened"     boolean                  DEFAULT false,
  "recovery_whatsapp_sent_at"   timestamp with time zone,
  "recovery_whatsapp_delivered" boolean                  DEFAULT false,
  "discount_code_applied"       text,
  "discount_pct"                numeric                  DEFAULT 10,
  "recovered_at"                timestamp with time zone,
  "recovered_order_id"          uuid,
  "status"                      text                     NOT NULL DEFAULT 'abandoned'::text,
  "source_site"                 text                     NOT NULL DEFAULT 'peptide-south-africa.co.za'::text,
  "created_at"                  timestamp with time zone DEFAULT now(),
  "updated_at"                  timestamp with time zone DEFAULT now(),
  CONSTRAINT "psa_cart_abandons_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_cart_abandons_status_check"
    CHECK ((status = ANY (ARRAY['abandoned'::text, 'email_1_sent'::text, 'email_2_sent'::text, 'whatsapp_sent'::text, 'recovered'::text, 'expired'::text, 'test'::text])))
);

ALTER TABLE "public"."psa_cart_abandons"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_cart_abandons_id_seq" OWNED BY "public"."psa_cart_abandons"."id";

CREATE INDEX idx_psa_cart_abandons_abandoned_at ON public.psa_cart_abandons USING btree (abandoned_at);

CREATE INDEX idx_psa_cart_abandons_email ON public.psa_cart_abandons USING btree (email);

CREATE INDEX idx_psa_cart_abandons_recovered ON public.psa_cart_abandons USING btree (recovered_at)
  WHERE (recovered_at IS NULL);

CREATE INDEX idx_psa_cart_abandons_status ON public.psa_cart_abandons USING btree (status);

CREATE INDEX idx_psa_cart_abandons_user_id ON public.psa_cart_abandons USING btree (user_id);

CREATE TRIGGER psa_cart_abandon_alert
  BEFORE INSERT ON public.psa_cart_abandons
  FOR EACH ROW
  EXECUTE FUNCTION public.psa_cart_abandon_alert();

CREATE TRIGGER psa_cart_abandons_updated_at
  BEFORE UPDATE ON public.psa_cart_abandons
  FOR EACH ROW
  EXECUTE FUNCTION public.psa_update_timestamp();

CREATE POLICY "Allow anonymous cart abandon" ON "public"."psa_cart_abandons"
  FOR INSERT
  TO "anon"
  WITH CHECK ((cart_subtotal > (0)::numeric));

CREATE POLICY "Users can view own cart abandons" ON "public"."psa_cart_abandons"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_cart_abandons" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_cart_abandons" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_cart_abandons" TO "postgres", "service_role";
