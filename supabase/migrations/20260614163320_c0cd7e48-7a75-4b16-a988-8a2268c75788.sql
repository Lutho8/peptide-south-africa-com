
-- ============ CART SNAPSHOTS ============
DROP POLICY IF EXISTS "Users manage own cart snapshot" ON public.cart_snapshots;

CREATE POLICY "cart_snapshots_select_own" ON public.cart_snapshots
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cart_snapshots_insert_own" ON public.cart_snapshots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_snapshots_update_own" ON public.cart_snapshots
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_snapshots_delete_own" ON public.cart_snapshots
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_cart_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cart_snapshots_enforce_user_id ON public.cart_snapshots;
CREATE TRIGGER cart_snapshots_enforce_user_id
  BEFORE INSERT OR UPDATE ON public.cart_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cart_user_id();

-- ============ ORDERS ============
-- Allow self-update for pending orders; trigger restricts which columns can change.
CREATE POLICY "orders_update_own_pending" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE OR REPLACE FUNCTION public.protect_orders_sensitive_cols()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses RLS entirely; this trigger guards authenticated paths.
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.total IS DISTINCT FROM OLD.total
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.payfast_token IS DISTINCT FROM OLD.payfast_token
     OR NEW.payfast_pf_payment_id IS DISTINCT FROM OLD.payfast_pf_payment_id
     OR NEW.shipping_cost IS DISTINCT FROM OLD.shipping_cost
     OR NEW.shipping_currency IS DISTINCT FROM OLD.shipping_currency
     OR NEW.free_shipping_applied IS DISTINCT FROM OLD.free_shipping_applied
     OR NEW.discount_code IS DISTINCT FROM OLD.discount_code
     OR NEW.order_description IS DISTINCT FROM OLD.order_description THEN
    RAISE EXCEPTION 'Not allowed to modify protected order fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_protect_sensitive_cols ON public.orders;
CREATE TRIGGER orders_protect_sensitive_cols
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_orders_sensitive_cols();

-- Re-confirm column grants exclude payfast_* (idempotent re-apply)
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT SELECT (id, user_id, total, discount_code, created_at, status, currency, order_description,
              paid_at, shipping_country, shipping_method, shipping_cost, shipping_currency,
              free_shipping_applied) ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO authenticated;
GRANT UPDATE (shipping_country, shipping_method) ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- ============ SUBSCRIPTIONS ============
-- Extend existing trigger to also protect the row id, and reject DELETE for customers.
CREATE OR REPLACE FUNCTION public.protect_subscription_sensitive_cols()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.payfast_subscription_id IS DISTINCT FROM OLD.payfast_subscription_id
     OR NEW.payfast_token IS DISTINCT FROM OLD.payfast_token
     OR NEW.unit_price_zar IS DISTINCT FROM OLD.unit_price_zar
     OR NEW.discount_pct IS DISTINCT FROM OLD.discount_pct
     OR NEW.interval_weeks IS DISTINCT FROM OLD.interval_weeks
     OR NEW.product_slug IS DISTINCT FROM OLD.product_slug
     OR NEW.variant_label IS DISTINCT FROM OLD.variant_label
     OR NEW.next_charge_at IS DISTINCT FROM OLD.next_charge_at
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify sensitive subscription fields';
  END IF;
  RETURN NEW;
END;
$$;

-- Re-confirm subscription column grants exclude payfast_* token/subscription id
REVOKE ALL ON public.subscriptions FROM anon, authenticated;
GRANT SELECT (id, user_id, product_slug, variant_label, interval_weeks, next_charge_at,
              status, discount_pct, created_at, updated_at, unit_price_zar)
  ON public.subscriptions TO authenticated;
GRANT INSERT ON public.subscriptions TO authenticated;
GRANT UPDATE (status) ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

-- Verification (run from authenticated session): should return 0 rows
-- SELECT count(*) FROM public.orders WHERE user_id <> auth.uid();
-- SELECT count(*) FROM public.subscriptions WHERE user_id <> auth.uid();
-- SELECT count(*) FROM public.cart_snapshots WHERE user_id <> auth.uid();
