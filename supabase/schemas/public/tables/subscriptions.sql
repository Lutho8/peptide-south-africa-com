CREATE TABLE "public"."subscriptions" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                 uuid                     NOT NULL,
  "product_slug"            text                     NOT NULL,
  "variant_label"           text,
  "interval_weeks"          integer                  NOT NULL DEFAULT 8,
  "next_charge_at"          timestamp with time zone,
  "status"                  text                     NOT NULL DEFAULT 'active'::text,
  "discount_pct"            integer                  NOT NULL DEFAULT 12,
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "unit_price_zar"          numeric(10,2),
  "payfast_token"           text,
  "payfast_subscription_id" text,
  CONSTRAINT "subscriptions_interval_weeks_check" CHECK ((interval_weeks = ANY (ARRAY[4, 8, 12]))),
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "subscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text, 'past_due'::text]))),
  CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."subscriptions"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX subscriptions_payfast_token_key ON public.subscriptions USING btree (payfast_token)
  WHERE (payfast_token IS NOT NULL);

CREATE TRIGGER subscriptions_protect_sensitive
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_subscription_sensitive_cols();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins manage all subscriptions" ON "public"."subscriptions"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users cancel own subscriptions" ON "public"."subscriptions"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK (((auth.uid() = user_id) AND (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'paused'::text]))));

CREATE POLICY "Users insert own subscriptions" ON "public"."subscriptions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((auth.uid() = user_id) AND (payfast_subscription_id IS NULL) AND (payfast_token IS NULL) AND (discount_pct = 12) AND (unit_price_zar IS NULL)));

CREATE POLICY "Users view own subscriptions" ON "public"."subscriptions"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscriptions" TO "postgres", "service_role";

REVOKE ALL ("created_at") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("discount_pct") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("discount_pct") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("interval_weeks") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("interval_weeks") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("next_charge_at") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("next_charge_at") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("product_slug") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("product_slug") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("status") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("status"), UPDATE ("status") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("unit_price_zar") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("unit_price_zar") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("updated_at") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("updated_at") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("user_id") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("user_id") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ("variant_label") ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT SELECT ("variant_label") ON TABLE "public"."subscriptions" TO "authenticated";

REVOKE ALL ON TABLE "public"."subscriptions" FROM "authenticated";

GRANT INSERT ON TABLE "public"."subscriptions" TO "authenticated";
