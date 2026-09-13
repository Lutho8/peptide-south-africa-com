CREATE TABLE "public"."seo_reindex_log" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "url"               text                     NOT NULL,
  "last_requested_at" timestamp with time zone,
  "cycle_started_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "notes"             text,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "seo_reindex_log_pkey" PRIMARY KEY (id),
  CONSTRAINT "seo_reindex_log_url_key" UNIQUE (url)
);

ALTER TABLE "public"."seo_reindex_log"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_seo_reindex_log_updated_at
  BEFORE UPDATE ON public.seo_reindex_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins delete seo reindex log" ON "public"."seo_reindex_log"
  FOR DELETE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins insert seo reindex log" ON "public"."seo_reindex_log"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update seo reindex log" ON "public"."seo_reindex_log"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins view seo reindex log" ON "public"."seo_reindex_log"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."seo_reindex_log" TO "anon", "authenticated", "postgres", "service_role";
