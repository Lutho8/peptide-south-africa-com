ALTER TABLE psa_invoices ADD COLUMN IF NOT EXISTS payment_region text NOT NULL DEFAULT 'ZA';
ALTER TABLE psa_invoices ADD COLUMN IF NOT EXISTS seller_snapshot jsonb;;
