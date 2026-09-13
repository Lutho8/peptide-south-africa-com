CREATE TABLE "public"."orders" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "total"                 numeric(12,2)            NOT NULL DEFAULT 0,
  "discount_code"         text,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "status"                text                     NOT NULL DEFAULT 'pending'::text,
  "currency"              text                     NOT NULL DEFAULT 'ZAR'::text,
  "order_description"     text,
  "paid_at"               timestamp with time zone,
  "shipping_country"      text,
  "shipping_method"       text,
  "shipping_cost"         numeric                  NOT NULL DEFAULT 0,
  "shipping_currency"     text,
  "free_shipping_applied" boolean                  NOT NULL DEFAULT false,
  "payfast_pf_payment_id" text,
  "payfast_token"         text,
  "payment_provider"      text                     NOT NULL DEFAULT 'payfast'::text,
  "public_ref"            text
    NOT NULL DEFAULT
    ((('PSA-'::text || to_char((CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg'::text), 'YYMMDD'::text)) || '-'::text) || upper(substr(replace((gen_random_uuid())::text,
    '-'::text, ''::text), 1, 8))),
  "customer_name"         text,
  "customer_email"        text,
  "customer_phone"        text,
  "shipping_address"      jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "order_items"           jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "checkout_request_id"   uuid,
  CONSTRAINT "orders_order_items_array" CHECK ((jsonb_typeof(order_items) = 'array'::text)),
  CONSTRAINT "orders_pkey" PRIMARY KEY (id),
  CONSTRAINT "orders_shipping_address_object" CHECK ((jsonb_typeof(shipping_address) = 'object'::text)),
  CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."orders"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."orders"
  REPLICA IDENTITY FULL;

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (lower(customer_email))
  WHERE (customer_email IS NOT NULL);

CREATE INDEX idx_orders_payfast_pf_payment_id ON public.orders USING btree (payfast_pf_payment_id);

CREATE UNIQUE INDEX idx_orders_public_ref ON public.orders USING btree (public_ref);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);

CREATE UNIQUE INDEX orders_checkout_request_id_idx ON public.orders USING btree (checkout_request_id)
  WHERE (checkout_request_id IS NOT NULL);

CREATE TRIGGER emit_order_lifecycle_events
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION private.emit_order_lifecycle_event();

CREATE TRIGGER orders_protect_sensitive_cols
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_orders_sensitive_cols();

CREATE TRIGGER trg_enrich_customer_on_order_paid
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enrich_customer_on_order_paid();

CREATE POLICY "Users create own orders" ON "public"."orders"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "orders_owner_or_admin_select" ON "public"."orders"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role)));

CREATE POLICY "orders_update_own_pending" ON "public"."orders"
  FOR UPDATE
  TO "authenticated"
  USING (((auth.uid() = user_id) AND (status = 'pending'::text)))
  WITH CHECK (((auth.uid() = user_id) AND (status = 'pending'::text)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."orders" TO "postgres", "service_role";

REVOKE ALL ("created_at") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("currency") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("currency") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("discount_code") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("discount_code") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("free_shipping_applied") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("free_shipping_applied") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("order_description") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("order_description") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("paid_at") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("paid_at") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("public_ref") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("public_ref") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("shipping_cost") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("shipping_cost") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("shipping_country") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("shipping_country"), UPDATE ("shipping_country") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("shipping_currency") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("shipping_currency") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("shipping_method") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("shipping_method"), UPDATE ("shipping_method") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("status") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("status") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("total") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("total") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ("user_id") ON TABLE "public"."orders" FROM "authenticated";

GRANT SELECT ("user_id") ON TABLE "public"."orders" TO "authenticated";

REVOKE ALL ON TABLE "public"."orders" FROM "authenticated";

GRANT INSERT ON TABLE "public"."orders" TO "authenticated";
