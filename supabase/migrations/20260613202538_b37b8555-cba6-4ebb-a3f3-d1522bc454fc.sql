-- Orders: revoke broad SELECT, grant column-level SELECT excluding payfast tokens
REVOKE SELECT ON public.orders FROM authenticated, anon;
GRANT SELECT (
  id, user_id, status, created_at, paid_at,
  discount_code, currency, shipping_cost, shipping_method, shipping_country,
  shipping_currency, free_shipping_applied, order_description, total
) ON public.orders TO authenticated;

-- Subscriptions: revoke broad SELECT, grant column-level SELECT excluding payfast tokens
REVOKE SELECT ON public.subscriptions FROM authenticated, anon;
GRANT SELECT (
  id, user_id, product_slug, variant_label, interval_weeks,
  next_charge_at, status, discount_pct, created_at, updated_at, unit_price_zar
) ON public.subscriptions TO authenticated;

-- Service role retains ALL (granted previously); ensure it explicitly
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
