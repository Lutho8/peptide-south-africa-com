CREATE OR REPLACE FUNCTION public.psa_sync_customer_to_lead()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
DECLARE
  mapped_stage TEXT;
  normalized_persona TEXT;
BEGIN
  -- Map customer stage to lead stage
  mapped_stage := CASE NEW.subscription_status
    WHEN 'active' THEN 'customer'
    WHEN 'cancelled' THEN 'churned'
    ELSE 'lead'
  END;

  -- Normalize persona_tag to lowercase to match constraint
  normalized_persona := COALESCE(LOWER(NULLIF(NEW.persona_tag, '')), 'unknown');

  -- Ensure valid persona_tag value
  IF normalized_persona NOT IN (
    'biohacker', 'anti_aging_seeker', 'weight_loss_seeker', 'athlete',
    'executive', 'beginner', 'health_conscious', 'medical_professional',
    'fitness_enthusiast', 'longevity_pioneer', 'unknown'
  ) THEN
    normalized_persona := 'unknown';
  END IF;

  INSERT INTO psa_leads (
    email, user_id, source_site, stage, persona_tag,
    first_name, last_name, phone, city, province,
    consent_email, consent_whatsapp, consent_sms,
    lead_score, created_at, updated_at
  )
  VALUES (
    NEW.email, NEW.user_id,
    COALESCE(NEW.first_order_source, 'peptide-south-africa.com'),
    mapped_stage, normalized_persona,
    NEW.first_name, NEW.last_name, NEW.phone, NEW.city, NEW.province,
    COALESCE(NEW.consent_email, FALSE),
    COALESCE(NEW.consent_whatsapp, FALSE),
    COALESCE(NEW.consent_sms, FALSE),
    COALESCE(NEW.lead_score, 0),
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    stage = CASE
      WHEN psa_leads.stage IN ('churned') AND EXCLUDED.stage IN ('customer','vip','loyal') THEN EXCLUDED.stage
      WHEN psa_leads.stage = 'churned' THEN 'churned'
      WHEN EXCLUDED.stage = 'vip' THEN 'vip'
      WHEN EXCLUDED.stage = 'champion' THEN 'champion'
      ELSE EXCLUDED.stage
    END,
    persona_tag = EXCLUDED.persona_tag,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    consent_email = EXCLUDED.consent_email,
    consent_whatsapp = EXCLUDED.consent_whatsapp,
    consent_sms = EXCLUDED.consent_sms,
    lead_score = GREATEST(psa_leads.lead_score, EXCLUDED.lead_score),
    updated_at = NOW();

  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."psa_sync_customer_to_lead"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
