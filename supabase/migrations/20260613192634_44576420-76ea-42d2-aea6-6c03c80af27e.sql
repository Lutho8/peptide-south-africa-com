DROP TRIGGER IF EXISTS subscriptions_protect_sensitive ON public.subscriptions;
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS nowpayments_payment_id,
  ADD COLUMN IF NOT EXISTS payfast_pf_payment_id text,
  ADD COLUMN IF NOT EXISTS payfast_token text;

ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'ZAR';
UPDATE public.orders SET currency = 'ZAR' WHERE currency <> 'ZAR';

DROP INDEX IF EXISTS idx_orders_nowpayments_id;
CREATE INDEX IF NOT EXISTS idx_orders_payfast_pf_payment_id
  ON public.orders (payfast_pf_payment_id);

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_stripe_subscription_id_key;

ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS unit_price_eur,
  ADD COLUMN IF NOT EXISTS unit_price_zar numeric(10,2),
  ADD COLUMN IF NOT EXISTS payfast_token text,
  ADD COLUMN IF NOT EXISTS payfast_subscription_id text;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_payfast_token_key
  ON public.subscriptions (payfast_token)
  WHERE payfast_token IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_subscription_sensitive_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.payfast_subscription_id IS DISTINCT FROM OLD.payfast_subscription_id
     OR NEW.payfast_token IS DISTINCT FROM OLD.payfast_token
     OR NEW.unit_price_zar IS DISTINCT FROM OLD.unit_price_zar
     OR NEW.discount_pct IS DISTINCT FROM OLD.discount_pct
     OR NEW.interval_weeks IS DISTINCT FROM OLD.interval_weeks
     OR NEW.product_slug IS DISTINCT FROM OLD.product_slug
     OR NEW.variant_label IS DISTINCT FROM OLD.variant_label
     OR NEW.next_charge_at IS DISTINCT FROM OLD.next_charge_at
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify sensitive subscription fields';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_protect_sensitive
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_sensitive_cols();

CREATE POLICY "Users insert own subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND payfast_subscription_id IS NULL
  AND payfast_token IS NULL
  AND discount_pct = 12
  AND unit_price_zar IS NULL
);