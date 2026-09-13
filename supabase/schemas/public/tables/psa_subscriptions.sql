CREATE TABLE "public"."psa_subscriptions" (
  "id"                  integer                     NOT NULL DEFAULT nextval('public.psa_subscriptions_id_seq'::regclass),
  "subscription_id"     character varying(100)      NOT NULL,
  "customer_id"         integer,
  "customer_email"      character varying(255),
  "plan_type"           character varying(50),
  "status"              character varying(50),
  "start_date"          timestamp without time zone,
  "next_billing_date"   timestamp without time zone,
  "end_date"            timestamp without time zone,
  "billing_frequency"   character varying(50),
  "discount_percent"    numeric(5,2)                DEFAULT 15.00,
  "products"            jsonb,
  "current_order_count" integer                     DEFAULT 0,
  "max_order_count"     integer,
  "total_revenue"       numeric(10,2)               DEFAULT 0.00,
  "pause_reason"        character varying(255),
  "pause_start_date"    timestamp without time zone,
  "cancel_reason"       character varying(255),
  "cancel_feedback"     text,
  "win_back_attempted"  boolean                     DEFAULT false,
  "win_back_offer"      character varying(100),
  "created_at"          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_subscriptions_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id),
  CONSTRAINT "psa_subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_subscriptions_subscription_id_key" UNIQUE (subscription_id)
);

ALTER TABLE "public"."psa_subscriptions"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_subscriptions_id_seq" OWNED BY "public"."psa_subscriptions"."id";

CREATE INDEX idx_psa_subs_cust_status ON public.psa_subscriptions USING btree (customer_id, status);

CREATE INDEX idx_psa_subs_customer ON public.psa_subscriptions USING btree (customer_id);

CREATE INDEX idx_psa_subs_id ON public.psa_subscriptions USING btree (subscription_id);

CREATE INDEX idx_psa_subs_next_billing ON public.psa_subscriptions USING btree (next_billing_date);

CREATE INDEX idx_psa_subs_status ON public.psa_subscriptions USING btree (status);

CREATE POLICY "sr_psa_subscriptions" ON "public"."psa_subscriptions"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_subscriptions" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_subscriptions" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_subscriptions" TO "postgres", "service_role";
