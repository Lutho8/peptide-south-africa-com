
-- 1. Subscriptions: lock down user UPDATE policy
DROP POLICY IF EXISTS "Users update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users cancel own subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status IN ('active','cancelled','paused')
);

-- Trigger to prevent users from mutating sensitive columns
CREATE OR REPLACE FUNCTION public.protect_subscription_sensitive_cols()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role and admins full control
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.unit_price_eur IS DISTINCT FROM OLD.unit_price_eur
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

DROP TRIGGER IF EXISTS subscriptions_protect_sensitive ON public.subscriptions;
CREATE TRIGGER subscriptions_protect_sensitive
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_sensitive_cols();

-- Also lock down INSERT: users may not set stripe ids or pricing themselves
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users insert own subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND stripe_subscription_id IS NULL
  AND stripe_customer_id IS NULL
);

-- 2. Referral codes: split ALL policy, remove DELETE for users
DROP POLICY IF EXISTS "Users manage own code" ON public.referral_codes;
CREATE POLICY "Users insert own code"
ON public.referral_codes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_user_id
  AND redemptions = 0
  AND reward_zar <= 100
);
-- (SELECT for owners already exists via "Owners can view own code")
-- No UPDATE / DELETE for users — admins retain full control via existing admin policy.

-- 3. Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_loyalty_balance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_loyalty_balance(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.lookup_referral_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_referral_code(text) TO authenticated, service_role;

-- 4. Affiliate applications: tighten always-true INSERT policy
DROP POLICY IF EXISTS "Anyone can submit an affiliate application" ON public.affiliate_applications;
CREATE POLICY "Anyone can submit an affiliate application"
ON public.affiliate_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 200
  AND length(btrim(email)) BETWEEN 3 AND 320
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(coalesce(channel,'')) BETWEEN 1 AND 100
  AND length(coalesce(message,'')) <= 4000
  AND status = 'pending'
);
