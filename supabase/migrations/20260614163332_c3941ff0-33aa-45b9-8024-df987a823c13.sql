
REVOKE EXECUTE ON FUNCTION public.enforce_cart_user_id() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_orders_sensitive_cols() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_subscription_sensitive_cols() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
