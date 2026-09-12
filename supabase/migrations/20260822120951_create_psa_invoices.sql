-- Invoicing & receipts for the CRM studio.
CREATE SEQUENCE IF NOT EXISTS psa_invoice_number_seq START 1;

CREATE TABLE IF NOT EXISTS psa_invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  invoice_number  text NOT NULL UNIQUE,     -- INV-0001 / RCP-0001
  doc_type        text NOT NULL DEFAULT 'invoice',  -- invoice | receipt
  order_id        text,                     -- linked psa_orders.order_id when generated from an order
  customer_email  text NOT NULL,
  customer_name   text,
  customer_phone  text,
  line_items      jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{name, sku?, qty, price}]
  subtotal        numeric(12,2) NOT NULL,
  vat_rate        numeric(5,4) NOT NULL DEFAULT 0,     -- 0.15 when VAT applies
  vat_amount      numeric(12,2) NOT NULL DEFAULT 0,
  total           numeric(12,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'ZAR',
  status          text NOT NULL DEFAULT 'draft',       -- draft | sent | paid | void
  issued_at       timestamptz,
  due_at          timestamptz,
  paid_at         timestamptz,
  notes           text
);
ALTER TABLE psa_invoices ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS psa_invoices_status_idx ON psa_invoices (status, created_at DESC);
CREATE INDEX IF NOT EXISTS psa_invoices_email_idx ON psa_invoices (customer_email);;
