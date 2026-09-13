CREATE VIEW "public"."crm_abandoned_carts" AS  SELECT a.id,
    a.email,
    c.phone,
    c.first_name,
    a.cart_items,
    a.cart_subtotal,
    a.abandoned_at,
    a.status,
    a.discount_code_applied,
    a.discount_pct,
    a.recovery_email_1_sent_at,
    a.recovery_whatsapp_sent_at,
    (a.recovered_at IS NOT NULL) AS recovered,
    a.recovered_at,
    a.recovered_order_id,
    a.source_site
   FROM (public.psa_cart_abandons a
     LEFT JOIN public.psa_customers c ON ((c.user_id = a.user_id)));

GRANT SELECT ON TABLE "public"."crm_abandoned_carts" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_abandoned_carts" TO "postgres", "service_role";
