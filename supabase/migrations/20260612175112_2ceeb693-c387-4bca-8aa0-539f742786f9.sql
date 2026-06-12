-- W1: Product batches / Janoshik COA layer
CREATE TABLE public.product_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_slug TEXT NOT NULL,
  variant_label TEXT,
  lot_number TEXT NOT NULL UNIQUE,
  hplc_purity NUMERIC(5,2),
  mass_spec_passed BOOLEAN DEFAULT true,
  endotoxin_eu_mg NUMERIC(8,3),
  lab_name TEXT NOT NULL DEFAULT 'Janoshik Analytical',
  test_date DATE NOT NULL,
  coa_pdf_url TEXT,
  manufactured_at DATE,
  expires_at DATE,
  notes TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_batches TO anon, authenticated;
GRANT ALL ON public.product_batches TO service_role;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published batches"
  ON public.product_batches FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage batches"
  ON public.product_batches FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_batches_updated_at
  BEFORE UPDATE ON public.product_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_batches_product_slug ON public.product_batches(product_slug);
CREATE INDEX idx_batches_lot ON public.product_batches(lot_number);

-- Storage policies for coa-pdfs bucket (private; signed-URL access)
CREATE POLICY "Authenticated can read COA PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'coa-pdfs');

CREATE POLICY "Admins can upload COA PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'coa-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update COA PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'coa-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete COA PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'coa-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- W2: Subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  variant_label TEXT,
  interval_weeks INT NOT NULL DEFAULT 8 CHECK (interval_weeks IN (4, 8, 12)),
  next_charge_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','past_due')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  unit_price_eur NUMERIC(10,2),
  discount_pct INT NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all subscriptions"
  ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reorder reminders
CREATE TABLE public.reorder_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  variant_label TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  source_order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reorder_reminders TO authenticated;
GRANT ALL ON public.reorder_reminders TO service_role;
ALTER TABLE public.reorder_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reminders"
  ON public.reorder_reminders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage reminders"
  ON public.reorder_reminders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_reminders_due ON public.reorder_reminders(due_at) WHERE sent_at IS NULL;

-- Referrals
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  reward_zar INT NOT NULL DEFAULT 150,
  redemptions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referral_codes TO anon, authenticated;
GRANT INSERT, UPDATE ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can lookup codes"
  ON public.referral_codes FOR SELECT USING (true);
CREATE POLICY "Users manage own code"
  ON public.referral_codes FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE TABLE public.referral_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  redeemer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID,
  reward_zar INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (code_id, redeemer_user_id)
);

GRANT SELECT ON public.referral_redemptions TO authenticated;
GRANT ALL ON public.referral_redemptions TO service_role;
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own redemptions"
  ON public.referral_redemptions FOR SELECT TO authenticated
  USING (auth.uid() = redeemer_user_id);
CREATE POLICY "Admins manage redemptions"
  ON public.referral_redemptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Loyalty credits (ledger)
CREATE TABLE public.loyalty_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta_zar NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  related_order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.loyalty_credits TO authenticated;
GRANT ALL ON public.loyalty_credits TO service_role;
ALTER TABLE public.loyalty_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits"
  ON public.loyalty_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage credits"
  ON public.loyalty_credits FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_credits_user ON public.loyalty_credits(user_id);

-- Helper: get user loyalty balance
CREATE OR REPLACE FUNCTION public.get_loyalty_balance(_user_id UUID)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(delta_zar), 0)::NUMERIC FROM public.loyalty_credits WHERE user_id = _user_id;
$$;