CREATE TABLE "public"."customer_reviews" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "display_name"      text                     NOT NULL,
  "email"             text                     NOT NULL,
  "location"          text,
  "rating"            integer                  NOT NULL,
  "review"            text                     NOT NULL,
  "product_type"      text,
  "order_ref"         text,
  "consent_publish"   boolean                  NOT NULL DEFAULT false,
  "status"            text                     NOT NULL DEFAULT 'pending'::text,
  "verified_purchase" boolean                  NOT NULL DEFAULT false,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "published_at"      timestamp with time zone,
  CONSTRAINT "customer_reviews_display_name_check" CHECK (((char_length(btrim(display_name)) >= 2) AND (char_length(btrim(display_name)) <= 80))),
  CONSTRAINT "customer_reviews_email_check" CHECK (((char_length(email) <= 320) AND (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text))),
  CONSTRAINT "customer_reviews_location_check" CHECK (((location IS NULL) OR (char_length(location) <= 100))),
  CONSTRAINT "customer_reviews_order_ref_check" CHECK (((order_ref IS NULL) OR (char_length(order_ref) <= 80))),
  CONSTRAINT "customer_reviews_pkey" PRIMARY KEY (id),
  CONSTRAINT "customer_reviews_product_type_check" CHECK (((product_type IS NULL) OR (char_length(product_type) <= 120))),
  CONSTRAINT "customer_reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
  CONSTRAINT "customer_reviews_review_check" CHECK (((char_length(btrim(review)) >= 20) AND (char_length(btrim(review)) <= 2000))),
  CONSTRAINT "customer_reviews_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'published'::text, 'rejected'::text])))
);

ALTER TABLE "public"."customer_reviews"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX customer_reviews_published_idx ON public.customer_reviews USING btree (published_at DESC)
  WHERE ((status = 'published'::text) AND (consent_publish = true));

CREATE POLICY "Admins manage customer reviews" ON "public"."customer_reviews"
  FOR ALL
  TO "authenticated"
  USING (( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role))
  WITH CHECK (( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role));

CREATE POLICY "Anyone may read published reviews" ON "public"."customer_reviews"
  FOR SELECT
  TO "anon", "authenticated"
  USING (((status = 'published'::text) AND (consent_publish = true)));

CREATE POLICY "Anyone may submit a pending review" ON "public"."customer_reviews"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (((status = 'pending'::text) AND (verified_purchase = false) AND (consent_publish = true)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."customer_reviews" TO "postgres", "service_role";

COMMENT ON TABLE "public"."customer_reviews" IS 'First-party customer review submissions. Public UI shows published rows only; verified_purchase is set only after internal order checks.';

REVOKE ALL ("consent_publish") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("consent_publish") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("created_at") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT SELECT ("created_at") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("display_name") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("display_name"), SELECT ("display_name") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("email") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("email") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("id") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT SELECT ("id") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("location") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("location"), SELECT ("location") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("order_ref") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("order_ref") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("product_type") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("product_type"), SELECT ("product_type") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("published_at") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT SELECT ("published_at") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("rating") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("rating"), SELECT ("rating") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("review") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT INSERT ("review"), SELECT ("review") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("verified_purchase") ON TABLE "public"."customer_reviews" FROM "anon";

GRANT SELECT ("verified_purchase") ON TABLE "public"."customer_reviews" TO "anon";

REVOKE ALL ("consent_publish") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("consent_publish") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("created_at") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("display_name") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("display_name"), SELECT ("display_name") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("email") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("email") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("location") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("location"), SELECT ("location") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("order_ref") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("order_ref") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("product_type") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("product_type"), SELECT ("product_type") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("published_at") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT SELECT ("published_at") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("rating") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("rating"), SELECT ("rating") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("review") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT INSERT ("review"), SELECT ("review") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ("verified_purchase") ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT SELECT ("verified_purchase") ON TABLE "public"."customer_reviews" TO "authenticated";

REVOKE ALL ON TABLE "public"."customer_reviews" FROM "authenticated";

GRANT DELETE, UPDATE ON TABLE "public"."customer_reviews" TO "authenticated";
