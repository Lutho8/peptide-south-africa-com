CREATE VIEW "public"."crm_at_risk_customers" AS  SELECT customer_id,
    email,
    phone,
    first_name,
    last_name,
    city,
    province,
    consent_email,
    consent_whatsapp,
    email_unsubscribed,
    phone_opt_out,
    ltv,
    order_count,
    last_order_date,
    first_order_date,
    subscription_status,
    subscription_plan,
    segment,
    persona_tag,
    lead_score,
    created_at,
    lifecycle_stage
   FROM public.crm_customer_lifecycle
  WHERE (lifecycle_stage = 'at_risk'::text);

GRANT SELECT ON TABLE "public"."crm_at_risk_customers" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_at_risk_customers" TO "postgres", "service_role";
