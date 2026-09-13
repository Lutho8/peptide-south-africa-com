CREATE TABLE "public"."psa_invoices" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "invoice_number"  text                     NOT NULL,
  "doc_type"        text                     NOT NULL DEFAULT 'invoice'::text,
  "order_id"        text,
  "customer_email"  text                     NOT NULL,
  "customer_name"   text,
  "customer_phone"  text,
  "line_items"      jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "subtotal"        numeric(12,2)            NOT NULL,
  "vat_rate"        numeric(5,4)             NOT NULL DEFAULT 0,
  "vat_amount"      numeric(12,2)            NOT NULL DEFAULT 0,
  "total"           numeric(12,2)            NOT NULL,
  "currency"        text                     NOT NULL DEFAULT 'ZAR'::text,
  "status"          text                     NOT NULL DEFAULT 'draft'::text,
  "issued_at"       timestamp with time zone,
  "due_at"          timestamp with time zone,
  "paid_at"         timestamp with time zone,
  "notes"           text,
  "payment_region"  text                     NOT NULL DEFAULT 'ZA'::text,
  "seller_snapshot" jsonb,
  CONSTRAINT "psa_invoices_invoice_number_key" UNIQUE (invoice_number),
  CONSTRAINT "psa_invoices_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_invoices"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX psa_invoices_email_idx ON public.psa_invoices USING btree (customer_email);

CREATE INDEX psa_invoices_status_idx ON public.psa_invoices USING btree (status, created_at DESC);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_invoices" TO "anon", "authenticated", "postgres", "service_role";
