-- Bridge initial deployed V2 to consent-bound strict 30-day attribution.
alter table public.partner_order_attributions add column if not exists click_id uuid;
drop function if exists public.freeze_partner_attribution(uuid,text,text,text,text,text,bigint,text);
revoke all on function public.submit_partner_application_v2(jsonb) from public,anon,authenticated;
grant execute on function public.submit_partner_application_v2(jsonb) to service_role;
create or replace function public.freeze_partner_attribution(
  p_order_id uuid, p_programme_key text, p_referral_code text, p_campaign_key text,
  p_method text, p_storefront text, p_commissionable_value_cents bigint, p_policy_version text, p_click_id uuid default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_programme public.partner_programmes; v_enrolment public.partner_enrolments; v_policy public.partner_policies; v_campaign uuid; v_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  select * into v_programme from public.partner_programmes where programme_key=p_programme_key and storefront=p_storefront;
  if v_programme.id is null then raise exception 'programme/storefront mismatch'; end if;
  select * into v_policy from public.partner_policies where programme_id=v_programme.id and active;
  if v_policy.id is null or v_policy.policy_version<>p_policy_version then raise exception 'inactive or invalid policy'; end if;
  select * into v_enrolment from public.partner_enrolments where programme_id=v_programme.id and upper(referral_code)=upper(btrim(p_referral_code)) and status='approved';
  if v_enrolment.id is null then raise exception 'invalid partner code'; end if;
  if not exists(select 1 from public.partner_agreement_acceptances where enrolment_id=v_enrolment.id and terms_version=v_policy.policy_version) then raise exception 'Current agreement required'; end if;
  if p_campaign_key is not null then select id into v_campaign from public.partner_campaigns where enrolment_id=v_enrolment.id and campaign_key=p_campaign_key and active; if v_campaign is null then raise exception 'Invalid campaign'; end if; end if;
  if p_method in ('referral_click','qr') and not exists(select 1 from public.partner_referral_clicks c where c.id=p_click_id and c.enrolment_id=v_enrolment.id and c.programme_id=v_programme.id and c.created_at<=now() and c.expires_at>now() and c.created_at>now()-interval '30 days' and c.method=p_method and c.campaign_key is not distinct from p_campaign_key) then raise exception 'Expired or invalid click'; end if;
  insert into public.partner_order_attributions(order_id,programme_id,enrolment_id,campaign_id,storefront,click_id,attribution_method,commissionable_value_cents,commission_rate_bps,policy_version)
  values(p_order_id,v_programme.id,v_enrolment.id,v_campaign,p_storefront,p_click_id,p_method,p_commissionable_value_cents,coalesce(v_enrolment.commission_rate_bps,v_policy.commission_rate_bps),p_policy_version)
  on conflict(order_id) do nothing returning id into v_id;
  if v_id is null then select id into v_id from public.partner_order_attributions where order_id=p_order_id; end if;
  return v_id;
end $$;
revoke all on function public.freeze_partner_attribution(uuid,text,text,text,text,text,bigint,text,uuid) from public, anon, authenticated;
grant execute on function public.freeze_partner_attribution(uuid,text,text,text,text,text,bigint,text,uuid) to service_role;

create or replace function public.record_verified_partner_commission()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_attr public.partner_order_attributions; v_programme public.partner_programmes; v_amount bigint;
begin
  if old.payment_status='awaiting_eft' and new.payment_status='complete' and new.payment_method='eft_capitec' then
    select * into v_attr from public.partner_order_attributions where order_id=new.order_id::uuid;
    if v_attr.id is not null then
      select * into v_programme from public.partner_programmes where id=v_attr.programme_id;
      if v_programme.financial_activation then
        v_amount := round(v_attr.commissionable_value_cents * v_attr.commission_rate_bps / 10000.0);
        insert into public.partner_commission_ledger(programme_id,enrolment_id,order_id,attribution_id,event_type,status,amount_cents,source_event_key,policy_version,rate_bps)
        values(v_attr.programme_id,v_attr.enrolment_id,v_attr.order_id,v_attr.id,'commission','pending_validation',v_amount,'cleared-payment:'||v_attr.order_id,v_attr.policy_version,v_attr.commission_rate_bps)
        on conflict(source_event_key) do nothing;
      end if;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.record_verified_partner_commission() from public, anon, authenticated;
grant execute on function public.record_verified_partner_commission() to service_role;

drop trigger if exists record_verified_partner_commission on public.psa_orders;
create trigger record_verified_partner_commission after update of payment_status on public.psa_orders
for each row execute function public.record_verified_partner_commission();

