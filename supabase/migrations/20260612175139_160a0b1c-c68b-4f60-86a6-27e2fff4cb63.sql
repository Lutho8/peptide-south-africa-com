-- 1) Replace permissive referral_codes SELECT with a narrow RPC
DROP POLICY IF EXISTS "Anyone can lookup codes" ON public.referral_codes;
REVOKE SELECT ON public.referral_codes FROM anon;

-- Owner can still read their own row
CREATE POLICY "Owners can view own code"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id);

-- Admins can view all codes
CREATE POLICY "Admins view all codes"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public lookup function: returns only id + reward, never owner_user_id
CREATE OR REPLACE FUNCTION public.lookup_referral_code(_code TEXT)
RETURNS TABLE(id UUID, reward_zar INT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, reward_zar FROM public.referral_codes WHERE code = upper(_code) LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_referral_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_referral_code(TEXT) TO anon, authenticated;

-- 2) Lock down loyalty balance function: enforce caller identity
CREATE OR REPLACE FUNCTION public.get_loyalty_balance(_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() <> _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN (SELECT COALESCE(SUM(delta_zar), 0)::NUMERIC FROM public.loyalty_credits WHERE user_id = _user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_loyalty_balance(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_loyalty_balance(UUID) TO authenticated;