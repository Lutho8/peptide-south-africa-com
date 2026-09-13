CREATE TABLE "public"."product_faqs" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "question"      text                     NOT NULL,
  "answer"        text                     NOT NULL,
  "scope"         text                     NOT NULL DEFAULT 'global'::text,
  "product_slug"  text,
  "display_order" integer                  NOT NULL DEFAULT 0,
  "is_published"  boolean                  NOT NULL DEFAULT true,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "product_faqs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."product_faqs"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_faqs_updated
  BEFORE UPDATE ON public.product_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins delete faqs" ON "public"."product_faqs"
  FOR DELETE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins insert faqs" ON "public"."product_faqs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update faqs" ON "public"."product_faqs"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone views published faqs" ON "public"."product_faqs"
  FOR SELECT
  TO PUBLIC
  USING (((is_published = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."product_faqs" TO "anon", "authenticated", "postgres", "service_role";
