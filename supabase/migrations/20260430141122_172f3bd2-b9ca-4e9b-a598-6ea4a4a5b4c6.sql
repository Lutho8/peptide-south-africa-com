
-- App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published testimonials" ON public.testimonials
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert testimonials" ON public.testimonials
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update testimonials" ON public.testimonials
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete testimonials" ON public.testimonials
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders (used for first-order discount eligibility)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- Storage bucket for testimonial photos
INSERT INTO storage.buckets (id, name, public) VALUES ('testimonial-photos', 'testimonial-photos', true);

CREATE POLICY "Public can view testimonial photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'testimonial-photos');
CREATE POLICY "Admins upload testimonial photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'testimonial-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update testimonial photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'testimonial-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete testimonial photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'testimonial-photos' AND public.has_role(auth.uid(), 'admin'));

-- Seed testimonials
INSERT INTO public.testimonials (name, location, quote, rating, photo_url, display_order) VALUES
  ('Sarah M.', 'Johannesburg', 'This changed everything for me. Down 12kg in 4 months and feeling stronger than ever.', 5, NULL, 1),
  ('Linda K.', 'Cape Town', 'COA included with every order. Finally a SA supplier I can actually trust.', 5, NULL, 2),
  ('Naledi T.', 'Pretoria', 'Discreet packaging, arrived in 2 days. Quality is exactly as advertised.', 5, NULL, 3),
  ('Sipho M.', 'Durban', 'BPC-157 helped my recovery faster than anything else I''ve tried. Amazing.', 5, NULL, 4),
  ('Adam R.', 'Stellenbosch', 'Lab-tested, transparent pricing, real support. This is the gold standard.', 5, NULL, 5);
