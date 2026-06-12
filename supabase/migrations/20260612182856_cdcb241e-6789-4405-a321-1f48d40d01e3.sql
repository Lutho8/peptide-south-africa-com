
-- Pin subscription self-insert to safe defaults (no custom discount/price).
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users insert own subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND stripe_subscription_id IS NULL
  AND stripe_customer_id IS NULL
  AND discount_pct = 12
  AND unit_price_eur IS NULL
);

-- Pin referral self-insert reward to the canonical 150 ZAR value.
DROP POLICY IF EXISTS "Users insert own code" ON public.referral_codes;
CREATE POLICY "Users insert own code"
ON public.referral_codes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_user_id
  AND redemptions = 0
  AND reward_zar = 150
);
