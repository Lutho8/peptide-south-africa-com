CREATE TABLE "public"."expenses" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "date"       date                     NOT NULL DEFAULT CURRENT_DATE,
  "category"   text                     NOT NULL,
  "amount"     numeric(10,2)            NOT NULL,
  "vendor"     text,
  "order_ref"  text,
  "note"       text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "expenses_category_check"
    CHECK
    ((category = ANY (ARRAY['cogs'::text, 'courier'::text, 'packaging'::text, 'payment_fees'::text, 'ads'::text, 'software'::text, 'tax_vat'::text, 'tax_income'::text,
    'rent'::text, 'other'::text]))),
  CONSTRAINT "expenses_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."expenses"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_expenses_cat ON public.expenses USING btree (category, date);

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);

CREATE POLICY "auth_full_expenses" ON "public"."expenses"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."expenses" TO "anon", "authenticated", "postgres", "service_role";
