CREATE TABLE "public"."payment_attempts" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "order_id"    uuid                     NOT NULL,
  "provider"    text                     NOT NULL,
  "status"      text                     NOT NULL,
  "external_id" text,
  "raw"         jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "payment_attempts_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT "payment_attempts_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."payment_attempts"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_payment_attempts_order ON public.payment_attempts USING btree (order_id, created_at DESC);

CREATE POLICY "Users view own order attempts" ON "public"."payment_attempts"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = payment_attempts.order_id) AND ((o.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment_attempts" TO "anon", "authenticated", "postgres", "service_role";
