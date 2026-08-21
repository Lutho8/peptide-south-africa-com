-- Internal CRM views contain customer PII and must never be exposed through
-- the public Data API roles. Queue RPCs are service-only infrastructure.
REVOKE ALL PRIVILEGES ON
  public.unified_customer,
  public.crm_customer_lifecycle,
  public.crm_kpis,
  public.crm_revenue_daily,
  public.crm_followups,
  public.crm_at_risk_customers,
  public.crm_abandoned_carts,
  public.crm_whatsapp_log
FROM anon, authenticated;

GRANT SELECT ON
  public.crm_customer_lifecycle,
  public.crm_kpis,
  public.crm_revenue_daily,
  public.crm_followups,
  public.crm_at_risk_customers,
  public.crm_abandoned_carts,
  public.crm_whatsapp_log
TO crm_reader;

GRANT SELECT ON
  public.unified_customer,
  public.crm_customer_lifecycle,
  public.crm_kpis,
  public.crm_revenue_daily,
  public.crm_followups,
  public.crm_at_risk_customers,
  public.crm_abandoned_carts,
  public.crm_whatsapp_log
TO service_role;

REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
