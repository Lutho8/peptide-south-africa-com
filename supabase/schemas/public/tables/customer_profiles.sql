CREATE TABLE "public"."customer_profiles" (
  "user_id"            uuid                     NOT NULL,
  "phone_e164"         text,
  "whatsapp_optin"     boolean                  NOT NULL DEFAULT false,
  "marketing_optin"    boolean                  NOT NULL DEFAULT false,
  "province"           text,
  "birth_year"         integer,
  "goals"              text[]                   NOT NULL DEFAULT '{}'::text[],
  "acquisition_source" text,
  "first_order_at"     timestamp with time zone,
  "last_order_at"      timestamp with time zone,
  "order_count"        integer                  NOT NULL DEFAULT 0,
  "lifetime_value_zar" numeric                  NOT NULL DEFAULT 0,
  "preferred_protocol" text,
  "gp_consult_status"  text,
  "notes"              text,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "email"              text,
  CONSTRAINT "customer_profiles_pkey" PRIMARY KEY (user_id),
  CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."customer_profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_customer_profiles_email ON public.customer_profiles USING btree (email);

CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_protect_customer_profile
  BEFORE INSERT OR UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_customer_profile_cols();

CREATE POLICY "Admins manage all profiles" ON "public"."customer_profiles"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can update own profile" ON "public"."customer_profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can view own profile" ON "public"."customer_profiles"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users insert own profile" ON "public"."customer_profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users update own profile" ON "public"."customer_profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users view own profile" ON "public"."customer_profiles"
  FOR SELECT
  TO "authenticated"
  USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."customer_profiles" TO "anon", "authenticated", "postgres", "service_role";
