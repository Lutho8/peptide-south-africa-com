ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_currency text,
  ADD COLUMN IF NOT EXISTS free_shipping_applied boolean NOT NULL DEFAULT false;