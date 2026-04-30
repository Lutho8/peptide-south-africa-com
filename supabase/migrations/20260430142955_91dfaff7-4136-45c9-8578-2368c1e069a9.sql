-- Product FAQs
CREATE TABLE public.product_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  product_slug TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views published faqs" ON public.product_faqs FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert faqs" ON public.product_faqs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update faqs" ON public.product_faqs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete faqs" ON public.product_faqs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON public.product_faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed global FAQs
INSERT INTO public.product_faqs (question, answer, scope, display_order) VALUES
  ('How fast do you ship within South Africa?', 'Same-day dispatch on orders before 14:00 SAST. Courier delivery 1–3 business days nationwide via The Courier Guy.', 'global', 1),
  ('Are your peptides third-party lab tested?', 'Yes. Every batch is tested for purity (≥99%) and endotoxins by an independent ISO-accredited lab. COAs are available on request.', 'global', 2),
  ('Is my payment and personal information secure?', 'All payments are processed via PCI-compliant gateways. Your data is encrypted in transit and at rest, and we are POPIA compliant.', 'global', 3),
  ('Do I need a prescription?', 'Our peptides are sold strictly for research purposes. Clinical programs are prescribed by partner GPs after assessment.', 'global', 4),
  ('What is your return policy?', 'Unopened, sealed products can be returned within 14 days. Opened vials cannot be returned for safety reasons.', 'global', 5);

-- Cart snapshots for abandoned cart
CREATE TABLE public.cart_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cart_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart snapshot" ON public.cart_snapshots FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all cart snapshots" ON public.cart_snapshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_cart_snap_updated BEFORE UPDATE ON public.cart_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Integration logs
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view integration logs" ON public.integration_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_integration_logs_created ON public.integration_logs (created_at DESC);