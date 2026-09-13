CREATE OR REPLACE FUNCTION public.psa_sync_event_to_lead()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
  INSERT INTO psa_leads (email, source_site, stage, first_touch_at, consent_email)
  VALUES (NEW.email, 'capetownpeptideclub.co.za', 'event_attendee', NOW(), true)
  ON CONFLICT (email) DO UPDATE SET
    stage = CASE WHEN psa_leads.stage = 'visitor' THEN 'event_attendee' ELSE psa_leads.stage END,
    last_touch_at = NOW(),
    lead_score = LEAST(COALESCE(psa_leads.lead_score, 0) + 5, 100);
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."psa_sync_event_to_lead"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
