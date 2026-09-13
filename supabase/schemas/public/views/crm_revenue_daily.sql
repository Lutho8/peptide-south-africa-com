CREATE VIEW "public"."crm_revenue_daily" AS  SELECT date(created_at) AS day,
    count(*) AS orders,
    COALESCE(sum(order_total), (0)::numeric) AS revenue
   FROM public.psa_orders
  WHERE (((payment_status)::text = 'paid'::text) AND (created_at >= (now() - '60 days'::interval)))
  GROUP BY (date(created_at))
  ORDER BY (date(created_at));

GRANT SELECT ON TABLE "public"."crm_revenue_daily" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_revenue_daily" TO "postgres", "service_role";
