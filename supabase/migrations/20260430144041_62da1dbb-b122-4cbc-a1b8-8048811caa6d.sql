ALTER TABLE public.cart_snapshots
  ADD COLUMN IF NOT EXISTS cart_signature text,
  ADD COLUMN IF NOT EXISTS discount_pct numeric NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_cart_snapshots_notified_updated
  ON public.cart_snapshots (notified_at, updated_at);