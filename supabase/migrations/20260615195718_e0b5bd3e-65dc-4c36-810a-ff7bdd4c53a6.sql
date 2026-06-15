
-- 1. customer_profiles
CREATE TABLE public.customer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_e164 TEXT,
  whatsapp_optin BOOLEAN NOT NULL DEFAULT false,
  marketing_optin BOOLEAN NOT NULL DEFAULT false,
  province TEXT,
  birth_year INT,
  goals TEXT[] NOT NULL DEFAULT '{}',
  acquisition_source TEXT,
  first_order_at TIMESTAMPTZ,
  last_order_at TIMESTAMPTZ,
  order_count INT NOT NULL DEFAULT 0,
  lifetime_value_zar NUMERIC NOT NULL DEFAULT 0,
  preferred_protocol TEXT,
  gp_consult_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.customer_profiles TO authenticated;
GRANT ALL ON public.customer_profiles TO service_role;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.customer_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.customer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.customer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all profiles" ON public.customer_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Protect sensitive computed fields from being set by users themselves
CREATE OR REPLACE FUNCTION public.protect_customer_profile_cols()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.lifetime_value_zar := OLD.lifetime_value_zar;
    NEW.order_count := OLD.order_count;
    NEW.first_order_at := OLD.first_order_at;
    NEW.last_order_at := OLD.last_order_at;
    NEW.notes := OLD.notes;
    NEW.gp_consult_status := OLD.gp_consult_status;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_protect_customer_profile BEFORE INSERT OR UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.protect_customer_profile_cols();

-- 2. customer_tags
CREATE TABLE public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tag)
);
GRANT SELECT, INSERT, DELETE ON public.customer_tags TO authenticated;
GRANT ALL ON public.customer_tags TO service_role;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage tags" ON public.customer_tags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. retention_events
CREATE TABLE public.retention_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_retention_events_user_time ON public.retention_events(user_id, occurred_at DESC);
CREATE INDEX idx_retention_events_event ON public.retention_events(event, occurred_at DESC);
GRANT SELECT ON public.retention_events TO authenticated;
GRANT ALL ON public.retention_events TO service_role;
ALTER TABLE public.retention_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own events" ON public.retention_events FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4. email_outbox
CREATE TABLE public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  send_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued',
  attempt_count INT NOT NULL DEFAULT 0,
  error TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_outbox_ready ON public.email_outbox(send_at) WHERE status = 'queued';
GRANT ALL ON public.email_outbox TO service_role;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view outbox" ON public.email_outbox FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_email_outbox_updated_at BEFORE UPDATE ON public.email_outbox FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. subscribe_save_offers
CREATE TABLE public.subscribe_save_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL UNIQUE,
  interval_weeks INT NOT NULL DEFAULT 8,
  discount_pct NUMERIC NOT NULL DEFAULT 0.10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscribe_save_offers TO anon, authenticated;
GRANT ALL ON public.subscribe_save_offers TO service_role;
ALTER TABLE public.subscribe_save_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read offers" ON public.subscribe_save_offers FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage offers" ON public.subscribe_save_offers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_subscribe_save_offers_updated_at BEFORE UPDATE ON public.subscribe_save_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. payment_attempts
CREATE TABLE public.payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  external_id TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_attempts_order ON public.payment_attempts(order_id, created_at DESC);
GRANT SELECT ON public.payment_attempts TO authenticated;
GRANT ALL ON public.payment_attempts TO service_role;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order attempts" ON public.payment_attempts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- 7. Extend reorder_reminders
ALTER TABLE public.reorder_reminders
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'reorder_d0',
  ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0;

-- 8. Extend orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'payfast';

-- 9. Auto-enrich customer_profiles on order paid
CREATE OR REPLACE FUNCTION public.enrich_customer_on_order_paid()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    INSERT INTO public.customer_profiles (user_id, first_order_at, last_order_at, order_count, lifetime_value_zar)
    VALUES (NEW.user_id, NEW.paid_at, NEW.paid_at, 1, NEW.total)
    ON CONFLICT (user_id) DO UPDATE SET
      first_order_at = COALESCE(public.customer_profiles.first_order_at, EXCLUDED.first_order_at),
      last_order_at = EXCLUDED.last_order_at,
      order_count = public.customer_profiles.order_count + 1,
      lifetime_value_zar = public.customer_profiles.lifetime_value_zar + NEW.total,
      updated_at = now();

    INSERT INTO public.retention_events (user_id, event, meta)
    VALUES (NEW.user_id, 'order_paid', jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'provider', NEW.payment_provider));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_enrich_customer_on_order_paid ON public.orders;
CREATE TRIGGER trg_enrich_customer_on_order_paid AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.enrich_customer_on_order_paid();

-- 10. Backfill customer_profiles for existing users
INSERT INTO public.customer_profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 11. Seed subscribe_save offers for current SKUs (10% off, 8-week cadence)
INSERT INTO public.subscribe_save_offers (product_slug, interval_weeks, discount_pct, active) VALUES
  ('retatrutide', 8, 0.10, true),
  ('tirzepatide', 8, 0.10, true),
  ('semaglutide', 8, 0.10, true),
  ('bpc-157', 6, 0.10, true),
  ('ghk-cu', 8, 0.10, true),
  ('mots-c', 8, 0.10, true),
  ('tesamorelin', 8, 0.10, true),
  ('glow', 8, 0.10, true),
  ('klow', 8, 0.10, true)
ON CONFLICT (product_slug) DO NOTHING;
