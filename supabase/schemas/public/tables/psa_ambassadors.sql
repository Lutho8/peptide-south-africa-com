CREATE TABLE "public"."psa_ambassadors" (
  "id"                  integer                     NOT NULL DEFAULT nextval('public.psa_ambassadors_id_seq'::regclass),
  "ambassador_id"       character varying(100)      NOT NULL,
  "customer_id"         integer,
  "email"               character varying(255),
  "phone"               character varying(20),
  "first_name"          character varying(100),
  "last_name"           character varying(100),
  "social_handles"      jsonb,
  "follower_count"      integer                     DEFAULT 0,
  "tier"                character varying(20),
  "commission_rate"     numeric(5,2)                DEFAULT 20.00,
  "commission_earned"   numeric(10,2)               DEFAULT 0.00,
  "commission_paid"     numeric(10,2)               DEFAULT 0.00,
  "commission_balance"  numeric(10,2)               DEFAULT 0.00,
  "referral_code"       character varying(20),
  "referral_count"      integer                     DEFAULT 0,
  "referral_revenue"    numeric(10,2)               DEFAULT 0.00,
  "content_submissions" integer                     DEFAULT 0,
  "content_approved"    integer                     DEFAULT 0,
  "last_activity_date"  timestamp without time zone,
  "status"              character varying(50),
  "onboarding_complete" boolean                     DEFAULT false,
  "contract_signed"     boolean                     DEFAULT false,
  "payment_method"      character varying(50),
  "payment_details"     jsonb,
  "notes"               text,
  "created_at"          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_ambassadors_ambassador_id_key" UNIQUE (ambassador_id),
  CONSTRAINT "psa_ambassadors_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_ambassadors_referral_code_key" UNIQUE (referral_code),
  CONSTRAINT "psa_ambassadors_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id)
);

ALTER TABLE "public"."psa_ambassadors"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_ambassadors_id_seq" OWNED BY "public"."psa_ambassadors"."id";

CREATE INDEX idx_psa_amb_code ON public.psa_ambassadors USING btree (referral_code);

CREATE INDEX idx_psa_amb_customer ON public.psa_ambassadors USING btree (customer_id);

CREATE INDEX idx_psa_amb_id ON public.psa_ambassadors USING btree (ambassador_id);

CREATE INDEX idx_psa_amb_status ON public.psa_ambassadors USING btree (status);

CREATE INDEX idx_psa_amb_tier ON public.psa_ambassadors USING btree (tier);

CREATE POLICY "sr_psa_ambassadors" ON "public"."psa_ambassadors"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_ambassadors" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_ambassadors" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_ambassadors" TO "postgres", "service_role";
