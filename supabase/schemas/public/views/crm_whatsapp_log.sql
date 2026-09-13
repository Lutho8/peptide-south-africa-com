CREATE VIEW "public"."crm_whatsapp_log" AS  SELECT w.id,
    w.customer_phone,
    w.customer_id,
    c.email,
    c.consent_whatsapp,
    c.phone_opt_out,
    w.template_name,
    w.message_type,
    w.sent_at,
    w.delivered_at,
    w.read_at,
    w.failed,
    w.fail_reason
   FROM (public.psa_whatsapp_sends w
     LEFT JOIN public.psa_customers c ON ((c.id = w.customer_id)));

GRANT SELECT ON TABLE "public"."crm_whatsapp_log" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_whatsapp_log" TO "postgres", "service_role";
