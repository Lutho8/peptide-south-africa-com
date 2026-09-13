CREATE TABLE "public"."testimonials" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"          text                     NOT NULL,
  "location"      text,
  "quote"         text                     NOT NULL,
  "rating"        integer                  NOT NULL DEFAULT 5,
  "photo_url"     text,
  "display_order" integer                  NOT NULL DEFAULT 0,
  "is_published"  boolean                  NOT NULL DEFAULT true,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "testimonials_pkey" PRIMARY KEY (id),
  CONSTRAINT "testimonials_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);

ALTER TABLE "public"."testimonials"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins delete testimonials" ON "public"."testimonials"
  FOR DELETE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins insert testimonials" ON "public"."testimonials"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update testimonials" ON "public"."testimonials"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can view published testimonials" ON "public"."testimonials"
  FOR SELECT
  TO PUBLIC
  USING (((is_published = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."testimonials" TO "anon", "authenticated", "postgres", "service_role";
