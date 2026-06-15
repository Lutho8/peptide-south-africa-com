
REVOKE EXECUTE ON FUNCTION public.protect_customer_profile_cols() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enrich_customer_on_order_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_orders_sensitive_cols() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_subscription_sensitive_cols() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_cart_user_id() FROM PUBLIC, anon, authenticated;
