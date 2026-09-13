CREATE TABLE "public"."b2b_accounts" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "company"      text                     NOT NULL,
  "contact_name" text,
  "email"        text,
  "phone"        text,
  "account_type" text                     NOT NULL DEFAULT 'clinic'::text,
  "terms"        text                     NOT NULL DEFAULT 'prepaid'::text,
  "discount_pct" numeric(4,1)             NOT NULL DEFAULT 0,
  "status"       text                     NOT NULL DEFAULT 'prospect'::text,
  "notes"        text,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "b2b_accounts_account_type_check" CHECK ((account_type = ANY (ARRAY['clinic'::text, 'gym'::text, 'reseller'::text, 'practitioner'::text, 'other'::text]))),
  CONSTRAINT "b2b_accounts_pkey" PRIMARY KEY (id),
  CONSTRAINT "b2b_accounts_status_check" CHECK ((status = ANY (ARRAY['prospect'::text, 'active'::text, 'paused'::text, 'closed'::text]))),
  CONSTRAINT "b2b_accounts_terms_check" CHECK ((terms = ANY (ARRAY['prepaid'::text, 'net7'::text, 'net14'::text, 'net30'::text])))
);

ALTER TABLE "public"."b2b_accounts"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER t_b2b_upd
  BEFORE UPDATE ON public.b2b_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_ops();

CREATE POLICY "auth_full_b2b" ON "public"."b2b_accounts"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."b2b_accounts" TO "anon", "authenticated", "postgres", "service_role";
