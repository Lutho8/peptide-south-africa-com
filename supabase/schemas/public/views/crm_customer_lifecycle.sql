CREATE VIEW "public"."crm_customer_lifecycle" AS  SELECT id AS customer_id,
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
    COALESCE(ltv, (0)::numeric) AS ltv,
    COALESCE(order_count, 0) AS order_count,
    last_order_date,
    first_order_date,
    subscription_status,
    subscription_plan,
    segment,
    persona_tag,
    lead_score,
    created_at,
        CASE
            WHEN (COALESCE(order_count, 0) = 0) THEN 'prospect'::text
            WHEN (((subscription_status)::text = 'active'::text) AND (last_order_date >= (now() - '60 days'::interval))) THEN 'active_subscriber'::text
            WHEN (last_order_date >= (now() - '45 days'::interval)) THEN 'active'::text
            WHEN (last_order_date >= (now() - '90 days'::interval)) THEN 'at_risk'::text
            ELSE 'churned'::text
        END AS lifecycle_stage
   FROM public.psa_customers c;

GRANT SELECT ON TABLE "public"."crm_customer_lifecycle" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_customer_lifecycle" TO "postgres", "service_role";
