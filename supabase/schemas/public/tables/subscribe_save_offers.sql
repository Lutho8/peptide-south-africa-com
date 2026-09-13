CREATE TABLE "public"."subscribe_save_offers" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "product_slug"   text                     NOT NULL,
  "interval_weeks" integer                  NOT NULL DEFAULT 8,
  "discount_pct"   numeric                  NOT NULL DEFAULT 0.10,
  "active"         boolean                  NOT NULL DEFAULT true,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "subscribe_save_offers_pkey" PRIMARY KEY (id),
  CONSTRAINT "subscribe_save_offers_product_slug_key" UNIQUE (product_slug)
);

ALTER TABLE "public"."subscribe_save_offers"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_subscribe_save_offers_updated_at
  BEFORE UPDATE ON public.subscribe_save_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins manage offers" ON "public"."subscribe_save_offers"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Public read offers" ON "public"."subscribe_save_offers"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((active = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscribe_save_offers" TO "anon", "authenticated", "postgres", "service_role";
