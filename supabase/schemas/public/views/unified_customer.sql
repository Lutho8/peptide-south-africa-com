CREATE VIEW "public"."unified_customer" AS  SELECT COALESCE(pc.email, (cp.email)::character varying) AS email,
    COALESCE(pc.user_id, cp.user_id) AS user_id,
    COALESCE(pc.first_name, (pr.first_name)::character varying) AS first_name,
    COALESCE(pc.last_name, (pr.last_name)::character varying) AS last_name,
    COALESCE(pc.phone, (cp.phone_e164)::character varying) AS phone,
    COALESCE(pc.city, (pr.city)::character varying) AS city,
    COALESCE(pc.province, (cp.province)::character varying, (pr.province)::character varying) AS province,
    COALESCE(pc.ltv, cp.lifetime_value_zar, (0)::numeric) AS lifetime_value,
    COALESCE(pc.order_count, cp.order_count, 0) AS order_count,
    COALESCE((pc.last_order_date)::timestamp with time zone, cp.last_order_at) AS last_order_date,
    COALESCE(pl.persona_tag, (pc.persona_tag)::text) AS persona_tag,
    COALESCE(pl.stage, 'visitor'::text) AS lead_stage,
    COALESCE(pl.lead_score, 0) AS lead_score,
    COALESCE(pl.nurture_sequence_step, 0) AS nurture_step,
    COALESCE(pl.next_nurture_email_at, pc.next_nurture_email_at) AS next_nurture_email_at,
    COALESCE(pc.consent_email, cp.marketing_optin, false) AS consent_email,
    COALESCE(pc.consent_whatsapp, cp.whatsapp_optin, false) AS consent_whatsapp,
    COALESCE(pc.consent_sms, false) AS consent_sms,
    pc.subscription_status,
    pc.subscription_plan,
    pc.subscription_next_billing_date,
    pc.ambassador_id,
    pc.ambassador_tier,
    pc.referral_code,
    pc.referral_credit_balance,
    COALESCE(pc.first_order_source, (cp.acquisition_source)::character varying) AS acquisition_source,
    pc.first_order_date,
    GREATEST((COALESCE(pc.updated_at, '1970-01-01 00:00:00'::timestamp without time zone))::timestamp with time zone, COALESCE(cp.updated_at, '1970-01-01 00:00:00+00'::timestamp with time zone)) AS updated_at
   FROM (((public.psa_customers pc
     LEFT JOIN public.customer_profiles cp ON (((pc.email)::text = cp.email)))
     LEFT JOIN public.psa_leads pl ON (((pc.email)::text = pl.email)))
     LEFT JOIN ( SELECT DISTINCT ON (psa_orders.user_id) psa_orders.user_id,
            (psa_orders.billing_address ->> 'first_name'::text) AS first_name,
            (psa_orders.billing_address ->> 'last_name'::text) AS last_name,
            (psa_orders.shipping_address ->> 'city'::text) AS city,
            (psa_orders.shipping_address ->> 'province'::text) AS province
           FROM public.psa_orders
          WHERE (psa_orders.user_id IS NOT NULL)
          ORDER BY psa_orders.user_id, psa_orders.created_at DESC) pr ON ((pc.user_id = pr.user_id)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."unified_customer" TO "postgres", "service_role";
