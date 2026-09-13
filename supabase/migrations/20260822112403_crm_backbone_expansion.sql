-- CRM backbone expansion: fulfillment, disputes/chargebacks, leads, customer segmentation.
-- Additive only — no existing columns or data modified.

-- 1. Fulfillment fields on psa_orders
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'unfulfilled';
-- unfulfilled | packed | shipped | delivered | returned
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS courier text;
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS packed_at timestamptz;
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE psa_orders ADD COLUMN IF NOT EXISTS customer_type text NOT NULL DEFAULT 'b2c';
-- b2c | b2b

CREATE INDEX IF NOT EXISTS psa_orders_fulfillment_idx ON psa_orders (fulfillment_status, created_at DESC);

-- 2. Disputes / chargebacks / refunds / returns
CREATE TABLE IF NOT EXISTS psa_disputes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  order_id    text,
  customer_email text,
  type        text NOT NULL,          -- chargeback | refund | return
  amount      numeric(12,2),
  reason      text,
  status      text NOT NULL DEFAULT 'open',  -- open | won | lost | resolved
  resolved_at timestamptz,
  notes       text
);
ALTER TABLE psa_disputes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS psa_disputes_status_idx ON psa_disputes (status, created_at DESC);

-- 3. Leads & nurturing funnel
CREATE TABLE IF NOT EXISTS psa_leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  email       text NOT NULL,
  name        text,
  phone       text,
  source      text,                   -- quiz | newsletter | instagram | whatsapp | referral | b2b_enquiry | ...
  customer_type text NOT NULL DEFAULT 'b2c',
  stage       text NOT NULL DEFAULT 'new',  -- new | engaged | quiz_completed | consult_booked | customer | lost
  converted_order_id text,
  notes       text,
  UNIQUE (email)
);
ALTER TABLE psa_leads ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS psa_leads_stage_idx ON psa_leads (stage, created_at DESC);

-- 4. Product/SKU sales view (derived from psa_orders.line_items jsonb)
CREATE OR REPLACE VIEW psa_sku_sales AS
SELECT
  item->>'name'  AS product_name,
  item->>'sku'   AS sku,
  COUNT(*)       AS units_ordered,
  SUM(COALESCE((item->>'qty')::int, 1))   AS total_qty,
  SUM(COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'qty')::int, 1)) AS revenue
FROM psa_orders,
     LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(line_items) = 'array' THEN line_items ELSE '[]'::jsonb END) AS item
WHERE payment_status = 'complete'
GROUP BY 1, 2
ORDER BY revenue DESC;;
