CREATE TABLE "public"."referral_redemptions" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "code_id"          uuid                     NOT NULL,
  "redeemer_user_id" uuid                     NOT NULL,
  "order_id"         uuid,
  "reward_zar"       integer                  NOT NULL,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "referral_redemptions_code_id_fkey" FOREIGN KEY (code_id) REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  CONSTRAINT "referral_redemptions_code_id_redeemer_user_id_key" UNIQUE (code_id, redeemer_user_id),
  CONSTRAINT "referral_redemptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "referral_redemptions_redeemer_user_id_fkey" FOREIGN KEY (redeemer_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."referral_redemptions"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage redemptions" ON "public"."referral_redemptions"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users view own redemptions" ON "public"."referral_redemptions"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = redeemer_user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."referral_redemptions" TO "anon", "authenticated", "postgres", "service_role";
