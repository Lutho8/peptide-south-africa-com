CREATE TABLE "public"."loyalty_credits" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "delta_zar"        numeric(10,2)            NOT NULL,
  "reason"           text                     NOT NULL,
  "related_order_id" uuid,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "loyalty_credits_pkey" PRIMARY KEY (id),
  CONSTRAINT "loyalty_credits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."loyalty_credits"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_credits_user ON public.loyalty_credits USING btree (user_id);

CREATE POLICY "Admins manage credits" ON "public"."loyalty_credits"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users view own credits" ON "public"."loyalty_credits"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."loyalty_credits" TO "anon", "authenticated", "postgres", "service_role";
