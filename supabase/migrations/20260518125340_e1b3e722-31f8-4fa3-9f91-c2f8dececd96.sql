
CREATE TABLE public.seo_reindex_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  last_requested_at timestamptz,
  cycle_started_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_reindex_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view seo reindex log"
  ON public.seo_reindex_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert seo reindex log"
  ON public.seo_reindex_log FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update seo reindex log"
  ON public.seo_reindex_log FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete seo reindex log"
  ON public.seo_reindex_log FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_seo_reindex_log_updated_at
  BEFORE UPDATE ON public.seo_reindex_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.seo_reindex_log (url) VALUES
  ('/'),
  ('/shop'),
  ('/fat-loss-protocol'),
  ('/quiz'),
  ('/research'),
  ('/product/rt3-reta'),
  ('/product/ghk-cu-50mg'),
  ('/product/tesamorelin'),
  ('/product/tz2-tirz'),
  ('/product/mots-c'),
  ('/product/bpc-tb500-blend'),
  ('/product/glow70'),
  ('/product/klow80')
ON CONFLICT (url) DO NOTHING;
