CREATE TABLE "public"."psa_customers" (
  "id"                             integer                     NOT NULL DEFAULT nextval('public.psa_customers_id_seq'::regclass),
  "email"                          character varying(255)      NOT NULL,
  "phone"                          character varying(20),
  "first_name"                     character varying(100),
  "last_name"                      character varying(100),
  "persona_tag"                    character varying(50),
  "date_of_birth"                  date,
  "gender"                         character varying(20),
  "city"                           character varying(100),
  "suburb"                         character varying(100),
  "province"                       character varying(50),
  "postal_code"                    character varying(10),
  "income_bracket"                 character varying(50),
  "ltv"                            numeric(10,2)               DEFAULT 0.00,
  "order_count"                    integer                     DEFAULT 0,
  "last_order_date"                timestamp without time zone,
  "last_order_value"               numeric(10,2),
  "segment"                        character varying(50),
  "tracker_user_id"                character varying(100),
  "ambassador_id"                  character varying(100),
  "ambassador_tier"                character varying(20),
  "referral_code"                  character varying(20),
  "referred_by"                    character varying(20),
  "referral_credit_balance"        numeric(10,2)               DEFAULT 0.00,
  "consent_email"                  boolean                     DEFAULT false,
  "consent_whatsapp"               boolean                     DEFAULT false,
  "consent_sms"                    boolean                     DEFAULT false,
  "consent_timestamp"              timestamp without time zone,
  "consent_source"                 character varying(100),
  "email_unsubscribed"             boolean                     DEFAULT false,
  "phone_opt_out"                  boolean                     DEFAULT false,
  "sms_opt_out"                    boolean                     DEFAULT false,
  "first_order_date"               timestamp without time zone,
  "first_order_source"             character varying(100),
  "preferred_payment_method"       character varying(50),
  "subscription_status"            character varying(50),
  "subscription_id"                character varying(100),
  "subscription_start_date"        timestamp without time zone,
  "subscription_next_billing_date" timestamp without time zone,
  "subscription_plan"              character varying(50),
  "notes"                          text,
  "created_at"                     timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"                     timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "user_id"                        uuid,
  "last_nurture_email_at"          timestamp with time zone,
  "next_nurture_email_at"          timestamp with time zone,
  "nurture_sequence_step"          integer                     DEFAULT 0,
  "lead_score"                     integer                     DEFAULT 0,
  CONSTRAINT "psa_customers_email_key" UNIQUE (email),
  CONSTRAINT "psa_customers_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_customers_referral_code_key" UNIQUE (referral_code),
  CONSTRAINT "psa_customers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE "public"."psa_customers"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_customers_id_seq" OWNED BY "public"."psa_customers"."id";

ALTER TABLE "public"."psa_customers"
  ADD COLUMN "email_normalized" text GENERATED ALWAYS AS (lower((email)::text)) STORED;

CREATE INDEX idx_psa_cust_ambassador ON public.psa_customers USING btree (ambassador_id);

CREATE INDEX idx_psa_cust_consent_email ON public.psa_customers USING btree (consent_email, email_unsubscribed);

CREATE INDEX idx_psa_cust_consent_wa ON public.psa_customers USING btree (consent_whatsapp, phone_opt_out);

CREATE INDEX idx_psa_cust_email ON public.psa_customers USING btree (email);

CREATE INDEX idx_psa_cust_last_order ON public.psa_customers USING btree (last_order_date DESC);

CREATE INDEX idx_psa_cust_ltv ON public.psa_customers USING btree (ltv DESC);

CREATE INDEX idx_psa_cust_persona ON public.psa_customers USING btree (persona_tag);

CREATE INDEX idx_psa_cust_phone ON public.psa_customers USING btree (phone);

CREATE INDEX idx_psa_cust_referral ON public.psa_customers USING btree (referral_code);

CREATE INDEX idx_psa_cust_segment ON public.psa_customers USING btree (segment);

CREATE INDEX idx_psa_cust_subscription ON public.psa_customers USING btree (subscription_status, subscription_next_billing_date);

CREATE INDEX idx_psa_cust_tracker ON public.psa_customers USING btree (tracker_user_id);

CREATE INDEX idx_psa_customers_email_normalized ON public.psa_customers USING btree (email_normalized);

CREATE INDEX idx_psa_customers_email ON public.psa_customers USING btree (email);

CREATE INDEX idx_psa_customers_next_nurture ON public.psa_customers USING btree (next_nurture_email_at)
  WHERE (next_nurture_email_at IS NOT NULL);

CREATE INDEX idx_psa_customers_segment ON public.psa_customers USING btree (segment);

CREATE INDEX idx_psa_customers_user_id ON public.psa_customers USING btree (user_id);

CREATE TRIGGER psa_customer_lead_sync
  AFTER INSERT OR UPDATE ON public.psa_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.psa_sync_customer_to_lead();

CREATE POLICY "Users can insert own customer record" ON "public"."psa_customers"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can update own customer record" ON "public"."psa_customers"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can view own customer record" ON "public"."psa_customers"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_customers" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_customers" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_customers" TO "postgres", "service_role";
