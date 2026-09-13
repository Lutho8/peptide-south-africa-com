CREATE OR REPLACE FUNCTION tracker.capture_crm_activity (
  p_email         text,
  p_first_name    text,
  p_last_name     text,
  p_phone         text,
  p_source        text,
  p_plan_interest text,
  p_activity_type text,
  p_score_delta   integer,
  p_activity_data jsonb,
  p_page_url      text,
  p_session_id    text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  v_lead tracker.crm_leads%rowtype;
  v_activity_id bigint;
  v_status text;
begin
  insert into tracker.crm_leads (
    email, first_name, last_name, phone, source, plan_interest,
    lead_status, lead_score, last_activity_at
  ) values (
    lower(trim(p_email)), nullif(trim(p_first_name), ''),
    nullif(trim(p_last_name), ''), nullif(trim(p_phone), ''), trim(p_source),
    p_plan_interest,
    case
      when p_activity_type = 'premium_click' or p_score_delta >= 60 then 'qualified'
      when p_score_delta >= 30 then 'nurturing'
      else 'new'
    end,
    least(100, greatest(0, p_score_delta)), now()
  )
  on conflict (email) do update set
    first_name = coalesce(tracker.crm_leads.first_name, excluded.first_name),
    last_name = coalesce(tracker.crm_leads.last_name, excluded.last_name),
    phone = coalesce(tracker.crm_leads.phone, excluded.phone),
    source = coalesce(nullif(excluded.source, ''), tracker.crm_leads.source),
    plan_interest = case
      when excluded.plan_interest = 'premium' then 'premium'
      when excluded.plan_interest = 'free' and tracker.crm_leads.plan_interest <> 'premium' then 'free'
      else tracker.crm_leads.plan_interest
    end,
    lead_score = least(100, tracker.crm_leads.lead_score + greatest(0, p_score_delta)),
    last_activity_at = now(),
    updated_at = now()
  returning * into v_lead;

  v_status := case
    when v_lead.lead_status = 'converted' then 'converted'
    when p_activity_type = 'premium_click' or v_lead.lead_score >= 60 then 'qualified'
    when v_lead.lead_score >= 30 then 'nurturing'
    else 'new'
  end;

  if v_status <> v_lead.lead_status then
    update tracker.crm_leads set lead_status = v_status, updated_at = now()
      where id = v_lead.id;
    v_lead.lead_status := v_status;
  end if;

  insert into tracker.crm_activities (
    lead_id, activity_type, activity_data, page_url, session_id
  ) values (
    v_lead.id, p_activity_type, p_activity_data, p_page_url, p_session_id
  ) returning id into v_activity_id;

  return jsonb_build_object(
    'lead_id', v_lead.id,
    'activity_id', v_activity_id,
    'lead_score', v_lead.lead_score,
    'lead_status', v_lead.lead_status
  );
end;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."capture_crm_activity"(text, text, text, text, text, text, text, integer, jsonb, text, text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."capture_crm_activity"(text, text, text, text, text, text, text, integer, jsonb, text, text) FROM PUBLIC;
