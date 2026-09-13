CREATE TABLE "public"."cart_snapshots" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "items"          jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "subtotal"       numeric                  NOT NULL DEFAULT 0,
  "notified_at"    timestamp with time zone,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "cart_signature" text,
  "discount_pct"   numeric                  NOT NULL DEFAULT 0,
  CONSTRAINT "cart_snapshots_pkey" PRIMARY KEY (id),
  CONSTRAINT "cart_snapshots_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."cart_snapshots"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_cart_snapshots_notified_updated ON public.cart_snapshots USING btree (notified_at, updated_at);

CREATE INDEX idx_cart_snapshots_notified ON public.cart_snapshots USING btree (notified_at)
  WHERE (notified_at IS NULL);

CREATE TRIGGER cart_snapshots_enforce_user_id
  BEFORE INSERT OR UPDATE ON public.cart_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_cart_user_id();

CREATE TRIGGER trg_cart_snap_updated
  BEFORE UPDATE ON public.cart_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins view all cart snapshots" ON "public"."cart_snapshots"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view own cart snapshots" ON "public"."cart_snapshots"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "cart_snapshots_delete_own" ON "public"."cart_snapshots"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "cart_snapshots_insert_own" ON "public"."cart_snapshots"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "cart_snapshots_select_own" ON "public"."cart_snapshots"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "cart_snapshots_update_own" ON "public"."cart_snapshots"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cart_snapshots" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."cart_snapshots" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cart_snapshots" TO "postgres", "service_role";
