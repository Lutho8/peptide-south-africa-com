CREATE TABLE "public"."product_batches" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "product_slug"     text                     NOT NULL,
  "variant_label"    text,
  "lot_number"       text                     NOT NULL,
  "hplc_purity"      numeric(5,2),
  "mass_spec_passed" boolean                  DEFAULT true,
  "endotoxin_eu_mg"  numeric(8,3),
  "lab_name"         text                     NOT NULL DEFAULT 'Janoshik Analytical'::text,
  "test_date"        date                     NOT NULL,
  "coa_pdf_url"      text,
  "manufactured_at"  date,
  "expires_at"       date,
  "notes"            text,
  "is_published"     boolean                  NOT NULL DEFAULT true,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "product_batches_lot_number_key" UNIQUE (lot_number),
  CONSTRAINT "product_batches_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."product_batches"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_batches_lot ON public.product_batches USING btree (lot_number);

CREATE INDEX idx_batches_product_slug ON public.product_batches USING btree (product_slug);

CREATE TRIGGER update_product_batches_updated_at
  BEFORE UPDATE ON public.product_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can manage batches" ON "public"."product_batches"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can read published batches" ON "public"."product_batches"
  FOR SELECT
  TO PUBLIC
  USING ((is_published = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."product_batches" TO "anon", "authenticated", "postgres", "service_role";
