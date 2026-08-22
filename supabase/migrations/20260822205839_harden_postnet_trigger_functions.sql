-- Trigger-only functions must not be exposed through the Data API RPC surface.
REVOKE ALL ON FUNCTION public.sync_paid_web_order_to_crm() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_shipment_to_crm_order() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_paid_web_order_to_crm() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_shipment_to_crm_order() FROM anon, authenticated;
