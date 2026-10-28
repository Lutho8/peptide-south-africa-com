-- Pets-native enrolment and programme-specific policy configuration. No Pets policy,
-- rate, discount, tier or financial activation is approved by this migration.
alter table public.partner_policies drop constraint partner_policies_commission_rate_bps_check;
alter table public.partner_policies add check (commission_rate_bps between 0 and 10000);
alter table public.partner_policies drop constraint partner_policies_validation_days_check;
alter table public.partner_policies add check (validation_days between 0 and 365);
alter table public.partner_policies drop constraint partner_policies_minimum_payout_cents_check;
alter table public.partner_policies add check (minimum_payout_cents between 1 and 1000000000);
-- The founder's 30-day maximum remains enforced by policy and click constraints.
alter table public.partner_policies add column tier_rules jsonb not null default '[]'::jsonb check(jsonb_typeof(tier_rules)='array');
alter table public.partner_applications_v2 drop constraint partner_applications_v2_partner_types_check;
alter table public.partner_applications_v2 add check ((partner_types <@ array['facility','creator']::text[] and cardinality(partner_types) between 1 and 2) or partner_types=array['pet_business']::text[]);
alter table public.partner_enrolments drop constraint partner_enrolments_partner_types_check;
alter table public.partner_enrolments add check ((partner_types <@ array['facility','creator']::text[] and cardinality(partner_types) between 1 and 2) or partner_types=array['pet_business']::text[]);
alter table public.partner_order_attributions add column validation_days integer not null default 14 check(validation_days between 0 and 365);
alter table public.partner_order_attributions add column minimum_payout_cents bigint not null default 50000 check(minimum_payout_cents>0);

create or replace function public.guard_partner_policy()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.active and new.approved_at is null then raise exception 'Active policy requires explicit approval'; end if;
 if exists(select 1 from public.partner_programmes where id=new.programme_id and programme_key in ('wellness_b2b','pets_b2b')) and
  (new.attribution_window_days<>30 or new.customer_discount_bps<>0 or new.commission_rate_bps<>2000 or new.validation_days<>14 or new.minimum_payout_cents<>50000 or new.tier_rules<>'[]'::jsonb) then raise exception 'Partner commercial rules must match the approved founding policy'; end if;
 if new.tier_rules<>'[]'::jsonb then raise exception 'Automatic tier progression is not enabled; separately reviewed policy version required'; end if;
 return new;
end $$;
revoke all on function public.guard_partner_policy() from public,anon,authenticated;
create trigger partner_policy_guard before insert or update on public.partner_policies for each row execute function public.guard_partner_policy();

create table public.partner_product_eligibility (
 programme_id uuid not null references public.partner_programmes(id), product_slug text not null,
 eligible boolean not null default false, approved_at timestamptz, policy_version text not null,
 primary key(programme_id,product_slug,policy_version),
 foreign key(programme_id,policy_version) references public.partner_policies(programme_id,policy_version),
 check(not eligible or approved_at is not null),
 check(product_slug ~ '^pets-[a-z0-9-]+$' and product_slug not in ('pets-mobility-collagen','pets-bac-water'))
);
alter table public.partner_product_eligibility enable row level security;
revoke all on public.partner_product_eligibility from public,anon,authenticated;
grant all on public.partner_product_eligibility to service_role;

create or replace function public.guard_pets_financial_activation()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.programme_key='pets_b2b' and new.financial_activation and not exists(
  select 1 from public.partner_policies p where p.programme_id=new.id and p.active and p.approved_at is not null
  and exists(select 1 from public.partner_product_eligibility e where e.programme_id=p.programme_id and e.policy_version=p.policy_version and e.eligible and e.approved_at is not null)
 ) then raise exception 'Approved Pets policy and product eligibility required before activation'; end if;
 return new;
end $$;
revoke all on function public.guard_pets_financial_activation() from public,anon,authenticated;
create trigger pets_financial_activation_guard before insert or update on public.partner_programmes for each row execute function public.guard_pets_financial_activation();

create or replace function public.enforce_partner_programme_identity()
returns trigger language plpgsql set search_path='' as $$
declare k text;
begin
 select programme_key into k from public.partner_programmes where id=new.programme_id;
 if (k='pets_b2b') is distinct from (new.partner_types=array['pet_business']::text[]) then raise exception 'Partner type/programme mismatch'; end if;
 return new;
end $$;
revoke all on function public.enforce_partner_programme_identity() from public,anon,authenticated;
create trigger partner_application_programme_identity before insert or update on public.partner_applications_v2 for each row execute function public.enforce_partner_programme_identity();
create trigger partner_enrolment_programme_identity before insert or update on public.partner_enrolments for each row execute function public.enforce_partner_programme_identity();

create or replace function public.submit_pets_partner_application(payload jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare prog uuid; result uuid; em text; business text;
begin
 select id into prog from public.partner_programmes where programme_key='pets_b2b' and accepting_applications;
 if prog is null then raise exception 'Applications are not currently open'; end if;
 em:=lower(btrim(coalesce(payload->>'email',''))); business:=btrim(coalesce(payload->>'facility_name',payload->>'business_name',''));
 if em !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(em)>320 or length(business) not between 2 and 160 or length(btrim(coalesce(payload->>'contact_name',''))) not between 2 and 160 then raise exception 'Invalid application'; end if;
 if coalesce(payload->>'website','')<>'' or coalesce((payload->>'terms_accepted')::boolean,false) is not true then raise exception 'Application acknowledgement required'; end if;
 if coalesce(payload->>'facility_type',payload->>'business_type','') not in ('pet_groomer','dog_spa','mobile_groomer','other_pet_business') then raise exception 'Invalid pet business type'; end if;
 insert into public.partner_applications_v2(programme_id,partner_types,regulated_professional,professional_review_status,contact_name,email,facility_name,facility_type,location,website_url,promotion_approach,application_terms_version,application_terms_accepted_at,marketing_consent,marketing_consent_at)
 values(prog,array['pet_business'],coalesce((payload->>'regulated_professional')::boolean,false),case when coalesce((payload->>'regulated_professional')::boolean,false) then 'required' else 'not_applicable' end,btrim(payload->>'contact_name'),em,business,coalesce(payload->>'facility_type',payload->>'business_type'),left(btrim(payload->>'location'),160),left(btrim(payload->>'website_url'),500),left(btrim(payload->>'promotion_approach'),1000),'pets-partner-application-v1-2026-10-28',now(),coalesce((payload->>'marketing_consent')::boolean,false),case when coalesce((payload->>'marketing_consent')::boolean,false) then now() end) returning id into result;
 return result;
end $$;
revoke all on function public.submit_pets_partner_application(jsonb) from public,anon,authenticated;
grant execute on function public.submit_pets_partner_application(jsonb) to service_role;
-- Application intake and financial activation remain disabled pending launch review.
create or replace function public.approve_partner_application(p_application_id uuid,p_auth_user_id uuid,p_referral_code text,p_professional_clearance boolean default false)
returns uuid language plpgsql security definer set search_path='' as $$
declare a public.partner_applications_v2; acc uuid; enr uuid;
begin
 select * into a from public.partner_applications_v2 where id=p_application_id for update;
 if a.id is null or a.status not in ('submitted','under_review','approved') then raise exception 'Application cannot be approved'; end if;
 if a.enquiry_only then raise exception 'Education/enquiry-only applications cannot earn commissions'; end if;
 if a.regulated_professional and not p_professional_clearance then raise exception 'Professional clearance required'; end if;
 if p_referral_code !~ '^[A-Z0-9_-]{3,80}$' then raise exception 'Invalid code'; end if;
 if exists(select 1 from public.partner_programmes where id=a.programme_id and programme_key='pets_b2b') and p_referral_code !~ '^PETS-[A-Z0-9_-]{3,70}$' then raise exception 'Pets code must begin PETS- and contain at least three suffix characters'; end if;
 if not exists(select 1 from auth.users where id=p_auth_user_id and lower(email)=lower(a.email) and email_confirmed_at is not null) then raise exception 'Verified applicant account required'; end if;
 select id into enr from public.partner_enrolments where application_id=a.id;
 if enr is not null then return enr; end if;
 insert into public.partner_accounts(auth_user_id,holder_kind,public_name) values(p_auth_user_id,case when 'facility'=any(a.partner_types) or 'pet_business'=any(a.partner_types) then 'organisation' else 'individual' end,coalesce(a.facility_name,a.creator_name,a.contact_name)) on conflict(auth_user_id) do update set updated_at=now() returning id into acc;
 insert into public.partner_enrolments(programme_id,partner_account_id,application_id,status,partner_types,referral_code,commission_rate_bps,validation_days,approved_at)
 values(a.programme_id,acc,a.id,'approved',a.partner_types,p_referral_code,null,null,now()) returning id into enr;
 update public.partner_applications_v2 set status='approved',professional_review_status=case when regulated_professional then 'approved' else 'not_applicable' end,updated_at=now() where id=a.id;
 insert into public.partner_operation_events(enrolment_id,action,source_key) values(enr,'application_approved','approve:'||a.id);
 return enr;
end $$;
create or replace function public.accept_partner_agreement(p_enrolment_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare p public.partner_policies; result uuid;
begin
 select pol.* into p from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id join public.partner_policies pol on pol.programme_id=e.programme_id and pol.active and pol.approved_at is not null where e.id=p_enrolment_id and a.auth_user_id=auth.uid() and e.status='approved';
 if p.id is null then raise exception 'Approved owned enrolment required'; end if;
 insert into public.partner_agreement_acceptances(enrolment_id,terms_version,accepted_by_user_id,terms_sha256) values(p_enrolment_id,p.policy_version,auth.uid(),p.terms_sha256)
 on conflict(enrolment_id,terms_version) do update set terms_version=excluded.terms_version returning id into result;
 return result;
end $$;
create or replace function public.freeze_partner_attribution(
  p_order_id uuid, p_programme_key text, p_referral_code text, p_campaign_key text,
  p_method text, p_storefront text, p_commissionable_value_cents bigint, p_policy_version text, p_click_id uuid default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_programme public.partner_programmes; v_enrolment public.partner_enrolments; v_policy public.partner_policies; v_campaign uuid; v_id uuid; v_base bigint; v_existing public.partner_order_attributions;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  select * into v_programme from public.partner_programmes where programme_key=p_programme_key and storefront=p_storefront;
  if v_programme.id is null then raise exception 'programme/storefront mismatch'; end if;
  perform 1 from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if exists(select 1 from public.psa_pets_order_details where order_id=p_order_id) is distinct from (p_storefront='pets') then raise exception 'Order/storefront mismatch'; end if;
  select * into v_policy from public.partner_policies where programme_id=v_programme.id and active and approved_at is not null;
  if v_policy.id is null or v_policy.policy_version<>p_policy_version then raise exception 'inactive or invalid policy'; end if;
  select * into v_enrolment from public.partner_enrolments where programme_id=v_programme.id and upper(referral_code)=upper(btrim(p_referral_code)) and status='approved';
  if v_enrolment.id is null then raise exception 'invalid partner code'; end if;
  if not exists(select 1 from public.partner_agreement_acceptances where enrolment_id=v_enrolment.id and terms_version=v_policy.policy_version and terms_sha256=v_policy.terms_sha256) then raise exception 'Current agreement required'; end if;
  if p_campaign_key is not null then select id into v_campaign from public.partner_campaigns where enrolment_id=v_enrolment.id and campaign_key=p_campaign_key and active; if v_campaign is null then raise exception 'Invalid campaign'; end if; end if;
  if p_method in ('referral_click','qr') and not exists(select 1 from public.partner_referral_clicks c where c.id=p_click_id and c.enrolment_id=v_enrolment.id and c.programme_id=v_programme.id and c.created_at<=now() and c.expires_at>now() and c.created_at>now()-interval '30 days' and c.method=p_method and c.campaign_key is not distinct from p_campaign_key) then raise exception 'Expired or invalid click'; end if;
  select * into v_existing from public.partner_order_attributions where order_id=p_order_id;
  if v_existing.id is not null then
   if v_existing.programme_id<>v_programme.id or v_existing.enrolment_id<>v_enrolment.id then raise exception 'Order attribution already frozen'; end if;
   return v_existing.id;
  end if;
  if p_storefront='pets' and exists(select 1 from public.psa_orders where order_id=p_order_id::text) then raise exception 'Attribution must precede payment instructions'; end if;
  v_base:=p_commissionable_value_cents;
  if p_storefront='pets' then
   select coalesce(sum(round((item->>'line_total')::numeric*100)),0)::bigint into v_base
   from public.orders o cross join lateral jsonb_array_elements(o.order_items) item
   join public.partner_product_eligibility elig on elig.product_slug=item->>'slug' and elig.programme_id=v_programme.id and elig.policy_version=v_policy.policy_version and elig.eligible and elig.approved_at is not null
   where o.id=p_order_id and item->>'storefront'='pets.peptide-south-africa.com';
   if v_base<=0 then raise exception 'No approved eligible Pets merchandise'; end if;
  end if;
  insert into public.partner_order_attributions(order_id,programme_id,enrolment_id,campaign_id,storefront,click_id,attribution_method,commissionable_value_cents,commission_rate_bps,policy_version,validation_days,minimum_payout_cents)
  values(p_order_id,v_programme.id,v_enrolment.id,v_campaign,p_storefront,p_click_id,p_method,v_base,v_policy.commission_rate_bps,p_policy_version,v_policy.validation_days,v_policy.minimum_payout_cents)
  on conflict(order_id) do nothing returning id into v_id;
  if v_id is null then select id into v_id from public.partner_order_attributions where order_id=p_order_id; end if;
  return v_id;
end $$;
create or replace function public.release_partner_commissions()
returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 update public.partner_commission_ledger l set status='available' where l.status='pending_validation' and exists (select 1 from public.partner_commission_ledger original where original.attribution_id=l.attribution_id and original.event_type='commission' and original.created_at<=now()-make_interval(days => (select a.validation_days from public.partner_order_attributions a where a.id=original.attribution_id)));
 get diagnostics n=row_count; return n;
end $$;
create or replace function public.prepare_partner_payout(p_enrolment_id uuid,p_period_start date,p_period_end date)
returns uuid language plpgsql security definer set search_path='' as $$
declare e public.partner_enrolments; result uuid; balance bigint; minimum bigint;
begin
 select * into e from public.partner_enrolments where id=p_enrolment_id for update;
 if e.id is null or e.status<>'approved' then raise exception 'Approved enrolment required'; end if;
 if p_period_start<>date_trunc('month',p_period_start)::date or p_period_end<>(p_period_start+interval '1 month'-interval '1 day')::date or p_period_end>=current_date then raise exception 'A completed calendar month is required'; end if;
 select id into result from public.partner_payout_statements where enrolment_id=e.id and period_start=p_period_start and period_end=p_period_end for update;
 if result is not null and exists(select 1 from public.partner_payout_statements where id=result and status in ('reserved','paid')) then return result; end if;
 perform public.release_partner_commissions();
 perform 1 from public.partner_commission_ledger where enrolment_id=e.id and status='available' for update;
 select coalesce(sum(amount_cents),0) into balance from public.partner_commission_ledger where enrolment_id=e.id and status='available';
 select minimum_payout_cents into minimum from public.partner_policies where programme_id=e.programme_id and active and approved_at is not null;
 if minimum is null then raise exception 'Approved programme payout policy required'; end if;
 if balance<minimum then raise exception 'Available balance below programme minimum; carry forward'; end if;
 if result is null then
 insert into public.partner_payout_statements(programme_id,enrolment_id,period_start,period_end,status,amount_cents) values(e.programme_id,e.id,p_period_start,p_period_end,'reserved',balance) returning id into result;
 else
 update public.partner_payout_statements set status='reserved',amount_cents=balance where id=result;
 end if;
 update public.partner_commission_ledger set status='reserved_for_payout',statement_id=result where enrolment_id=e.id and status='available';
 return result;
end $$;
