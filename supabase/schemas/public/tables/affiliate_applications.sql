CREATE TABLE "public"."affiliate_applications" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "name"          text                     NOT NULL,
  "email"         text                     NOT NULL,
  "channel"       text                     NOT NULL,
  "audience_size" text,
  "link"          text,
  "message"       text,
  "status"        text                     NOT NULL DEFAULT 'pending'::text,
  CONSTRAINT "affiliate_applications_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."affiliate_applications"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_affiliate_applications_updated_at
  BEFORE UPDATE ON public.affiliate_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can delete applications" ON "public"."affiliate_applications"
  FOR DELETE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update applications" ON "public"."affiliate_applications"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view all applications" ON "public"."affiliate_applications"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can submit an affiliate application" ON "public"."affiliate_applications"
  FOR INSERT
  TO "anon", "authenticated"
  WITH
    CHECK
    ((((length(btrim(name)) >= 1) AND (length(btrim(name)) <= 200)) AND ((length(btrim(email)) >= 3) AND (length(btrim(email)) <= 320)) AND (email ~
    '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text) AND ((length(COALESCE(channel, ''::text)) >= 1) AND (length(COALESCE(channel, ''::text)) <= 100)) AND
    (length(COALESCE(message, ''::text)) <= 4000) AND (status = 'pending'::text)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."affiliate_applications" TO "anon", "authenticated", "postgres", "service_role";
