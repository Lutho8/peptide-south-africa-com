CREATE VIEW "public"."crm_followups" AS  SELECT r.id AS reminder_id,
    r.product_slug,
    r.variant_label,
    r.due_at,
    r.channel,
    r.template,
    r.attempt_count,
    c.email,
    c.phone,
    c.first_name,
    c.consent_whatsapp,
    c.consent_email
   FROM (public.reorder_reminders r
     LEFT JOIN public.psa_customers c ON ((c.user_id = r.user_id)))
  WHERE ((r.sent_at IS NULL) AND (r.due_at <= (now() + '3 days'::interval)));

GRANT SELECT ON TABLE "public"."crm_followups" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."crm_followups" TO "postgres", "service_role";
