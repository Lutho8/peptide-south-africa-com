CREATE TABLE "public"."referral_codes" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_user_id" uuid                     NOT NULL,
  "code"          text                     NOT NULL,
  "reward_zar"    integer                  NOT NULL DEFAULT 150,
  "redemptions"   integer                  NOT NULL DEFAULT 0,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "referral_codes_code_key" UNIQUE (code),
  CONSTRAINT "referral_codes_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "referral_codes_owner_user_id_key" UNIQUE (owner_user_id),
  CONSTRAINT "referral_codes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."referral_codes"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all codes" ON "public"."referral_codes"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Owners can view own code" ON "public"."referral_codes"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = owner_user_id));

CREATE POLICY "Users insert own code" ON "public"."referral_codes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((auth.uid() = owner_user_id) AND (redemptions = 0) AND (reward_zar = 150)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."referral_codes" TO "authenticated", "postgres", "service_role";

REVOKE ALL ON TABLE "public"."referral_codes" FROM "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."referral_codes" TO "anon";
