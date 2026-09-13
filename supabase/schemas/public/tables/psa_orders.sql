CREATE TABLE "public"."psa_orders" (
  "id"                          integer                     NOT NULL DEFAULT nextval('public.psa_orders_id_seq'::regclass),
  "order_id"                    character varying(100)      NOT NULL,
  "customer_id"                 integer,
  "customer_email"              character varying(255),
  "customer_phone"              character varying(20),
  "order_total"                 numeric(10,2)               NOT NULL,
  "order_subtotal"              numeric(10,2),
  "order_discount"              numeric(10,2)               DEFAULT 0.00,
  "order_shipping"              numeric(10,2)               DEFAULT 0.00,
  "order_tax"                   numeric(10,2)               DEFAULT 0.00,
  "order_status"                character varying(50),
  "payment_status"              character varying(50)       DEFAULT 'pending'::character varying,
  "payment_method"              character varying(50),
  "payment_reference"           character varying(255),
  "payment_processor_fee"       numeric(10,2)               DEFAULT 0.00,
  "payment_settled_at"          timestamp without time zone,
  "line_items"                  jsonb,
  "coupon_codes"                jsonb,
  "shipping_address"            jsonb,
  "billing_address"             jsonb,
  "subscription_id"             character varying(100),
  "affiliate_id"                character varying(100),
  "commission_amount"           numeric(10,2)               DEFAULT 0.00,
  "source"                      character varying(100),
  "medium"                      character varying(100),
  "campaign"                    character varying(100),
  "device"                      character varying(50),
  "persona_tag"                 character varying(50),
  "notes"                       text,
  "created_at"                  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"                  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "user_id"                     uuid,
  "unified_order_id"            uuid,
  "abandoned_cart_processed"    boolean                     DEFAULT false,
  "abandoned_cart_discount_pct" numeric                     DEFAULT 10,
  "fulfillment_status"          text                        NOT NULL DEFAULT 'unfulfilled'::text,
  "courier"                     text,
  "tracking_number"             text,
  "packed_at"                   timestamp with time zone,
  "shipped_at"                  timestamp with time zone,
  "delivered_at"                timestamp with time zone,
  "customer_type"               text                        NOT NULL DEFAULT 'b2c'::text,
  CONSTRAINT "psa_orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id),
  CONSTRAINT "psa_orders_order_id_key" UNIQUE (order_id),
  CONSTRAINT "psa_orders_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE "public"."psa_orders"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_orders_id_seq" OWNED BY "public"."psa_orders"."id";

CREATE INDEX idx_psa_orders_abandoned ON public.psa_orders USING btree (abandoned_cart_processed)
  WHERE (abandoned_cart_processed = false);

CREATE INDEX idx_psa_orders_affiliate ON public.psa_orders USING btree (affiliate_id);

CREATE INDEX idx_psa_orders_created ON public.psa_orders USING btree (created_at DESC);

CREATE INDEX idx_psa_orders_customer ON public.psa_orders USING btree (customer_id);

CREATE INDEX idx_psa_orders_email ON public.psa_orders USING btree (customer_email);

CREATE INDEX idx_psa_orders_oid ON public.psa_orders USING btree (order_id);

CREATE INDEX idx_psa_orders_pay_status ON public.psa_orders USING btree (payment_status);

CREATE INDEX idx_psa_orders_source ON public.psa_orders USING btree (source, medium, campaign);

CREATE INDEX idx_psa_orders_status ON public.psa_orders USING btree (order_status);

CREATE INDEX idx_psa_orders_sub ON public.psa_orders USING btree (subscription_id);

CREATE INDEX idx_psa_orders_user_id ON public.psa_orders USING btree (user_id);

CREATE INDEX psa_orders_fulfillment_idx ON public.psa_orders USING btree (fulfillment_status, created_at DESC);

CREATE TRIGGER emit_verified_eft_revenue_events
  AFTER UPDATE OF payment_status ON public.psa_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.emit_verified_eft_revenue_events();

CREATE POLICY "Users can view own orders" ON "public"."psa_orders"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_orders" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_orders" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_orders" TO "postgres", "service_role";
