CREATE OR REPLACE FUNCTION public.get_unified_customer (
  p_email text
)
  RETURNS TABLE (
    email                 text,
    user_id               uuid,
    first_name            text,
    last_name             text,
    phone                 text,
    city                  text,
    province              text,
    lifetime_value        numeric,
    order_count           integer,
    lead_stage            text,
    lead_score            integer,
    consent_email         boolean,
    consent_whatsapp      boolean,
    subscription_status   text,
    ambassador_tier       text,
    next_nurture_email_at timestamp with time zone
  )
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
  RETURN QUERY
  SELECT
    u.email, u.user_id, u.first_name, u.last_name, u.phone,
    u.city, u.province, u.lifetime_value, u.order_count,
    u.lead_stage, u.lead_score, u.consent_email, u.consent_whatsapp,
    u.subscription_status, u.ambassador_tier, u.next_nurture_email_at
  FROM unified_customer u
  WHERE u.email = p_email;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."get_unified_customer"(text) TO PUBLIC, "authenticated", "postgres", "service_role";
