CREATE VIEW "public"."crm_kpis" AS  SELECT ( SELECT count(*) AS count
           FROM public.psa_customers) AS total_customers,
    ( SELECT count(*) AS count
           FROM public.crm_customer_lifecycle
          WHERE (crm_customer_lifecycle.lifecycle_stage = 'prospect'::text)) AS prospects,
    ( SELECT count(*) AS count
           FROM public.crm_customer_lifecycle
          WHERE (crm_customer_lifecycle.lifecycle_stage = 'active_subscriber'::text)) AS active_subscribers,
    ( SELECT count(*) AS count
           FROM public.crm_customer_lifecycle
          WHERE (crm_customer_lifecycle.lifecycle_stage = 'active'::text)) AS active_customers,
    ( SELECT count(*) AS count
           FROM public.crm_customer_lifecycle
          WHERE (crm_customer_lifecycle.lifecycle_stage = 'at_risk'::text)) AS at_risk_customers,
    ( SELECT count(*) AS count
           FROM public.crm_customer_lifecycle
          WHERE (crm_customer_lifecycle.lifecycle_stage = 'churned'::text)) AS churned_customers,
    ( SELECT COALESCE(sum(psa_orders.order_total), (0)::numeric) AS "coalesce"
           FROM public.psa_orders
          WHERE (((psa_orders.payment_status)::text = 'paid'::text) AND (psa_orders.created_at >= (now() - '30 days'::interval)))) AS revenue_30d,
    ( SELECT count(*) AS count
           FROM public.psa_orders
          WHERE (((psa_orders.payment_status)::text = 'paid'::text) AND (psa_orders.created_at >= (now() - '30 days'::interval)))) AS orders_30d,
    ( SELECT count(*) AS count
           FROM public.psa_subscriptions
          WHERE ((psa_subscriptions.status)::text = 'active'::text)) AS active_subscriptions,
    ( SELECT count(*) AS count
           FROM public.psa_cart_abandons
          WHERE ((psa_cart_abandons.abandoned_at >= (now() - '7 days'::interval)) AND (psa_cart_abandons.recovered_at IS NULL))) AS abandoned_carts_7d,
    ( SELECT count(*) AS count
           FROM public.reorder_reminders
          WHERE ((reorder_reminders.sent_at IS NULL) AND (reorder_reminders.due_at <= (now() + '3 days'::interval)))) AS followups_due,
    ( SELECT count(*) AS count
           FROM public.psa_customers
          WHERE (psa_customers.consent_whatsapp AND (NOT COALESCE(psa_customers.phone_opt_out, false)))) AS whatsapp_opted_in;

GRANT SELECT ON TABLE "public"."crm_kpis" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_kpis" TO "postgres", "service_role";
