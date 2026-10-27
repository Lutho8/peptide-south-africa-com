-- Wellness, Fitness & Creator Partner Programme v2.
-- Additive schema: legacy affiliate_applications, psa_ambassadors, links,
-- balances and accepted agreements remain untouched.

create table if not exists public.partner_programmes (
  id uuid primary key default gen_random_uuid(),
  programme_key text not null unique check (programme_key in ('wellness_b2b', 'pets_b2b')),
  name text not null,
  storefront text not null unique,
  accepting_applications boolean not null default false,
  financial_activation boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.partner_programmes (programme_key, name, storefront, accepting_applications, financial_activation)
values
  ('wellness_b2b', 'Wellness, Fitness & Creator Partner Programme', 'main', true, false),
  ('pets_b2b', 'Peptides4Pets Partner Programme', 'pets', false, false)
on conflict (programme_key) do update set
  name = excluded.name,
  storefront = excluded.storefront;

create table if not exists public.partner_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  holder_kind text not null check (holder_kind in ('individual', 'organisation')),
  public_name text not null check (char_length(btrim(public_name)) between 2 and 160),
  legal_name text,
  legacy_ambassador_id integer unique references public.psa_ambassadors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_applications_v2 (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.partner_programmes(id) on delete restrict,
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','rejected','suspended')),
  partner_types text[] not null check (partner_types <@ array['facility','creator']::text[] and cardinality(partner_types) between 1 and 2),
  regulated_professional boolean not null default false,
  professional_review_status text not null default 'not_applicable' check (professional_review_status in ('not_applicable','required','approved','rejected')),
  contact_name text not null,
  email text not null,
  phone text,
  facility_name text,
  facility_type text,
  location text,
  creator_name text,
  profile_links text[],
  content_niche text,
  promotion_approach text,
  audience_size text,
  audience_geography text,
  media_kit_url text,
  website_url text,
  enquiry_only boolean not null default false,
  application_terms_version text not null,
  application_terms_accepted_at timestamptz not null,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not regulated_professional or professional_review_status <> 'not_applicable')
);
create unique index if not exists partner_applications_v2_active_email_idx
  on public.partner_applications_v2 (programme_id, lower(email))
  where status in ('submitted','under_review','approved');

create table if not exists public.partner_enrolments (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.partner_programmes(id) on delete restrict,
  partner_account_id uuid not null references public.partner_accounts(id) on delete restrict,
  application_id uuid unique references public.partner_applications_v2(id) on delete set null,
  status text not null default 'under_review' check (status in ('under_review','approved','rejected','suspended')),
  partner_types text[] not null check (partner_types <@ array['facility','creator']::text[] and cardinality(partner_types) between 1 and 2),
  referral_code text not null,
  tier_key text,
  commission_rate_bps integer check (commission_rate_bps between 0 and 10000),
  validation_days integer,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programme_id, partner_account_id),
  unique (programme_id, referral_code)
);

create table if not exists public.partner_agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.partner_enrolments(id) on delete restrict,
  terms_version text not null,
  accepted_by_user_id uuid references auth.users(id) on delete set null,
  accepted_at timestamptz not null default now(),
  terms_sha256 text not null check (terms_sha256 ~ '^[0-9a-f]{64}$'),
  unique (enrolment_id, terms_version)
);

create table if not exists public.partner_campaigns (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.partner_enrolments(id) on delete cascade,
  campaign_key text not null check (campaign_key ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  channel text not null check (channel in ('facility_qr','counter_card','handout','whatsapp','social_bio','instagram','tiktok','youtube','newsletter','website','other')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (enrolment_id, campaign_key)
);

create table if not exists public.partner_order_attributions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  programme_id uuid not null references public.partner_programmes(id) on delete restrict,
  enrolment_id uuid not null references public.partner_enrolments(id) on delete restrict,
  campaign_id uuid references public.partner_campaigns(id) on delete set null,
  storefront text not null check (storefront in ('main','pets')),
  attribution_method text not null check (attribution_method in ('entered_code','referral_click','qr')),
  commissionable_value_cents bigint not null check (commissionable_value_cents >= 0),
  commission_rate_bps integer not null check (commission_rate_bps between 0 and 10000),
  policy_version text not null,
  attributed_at timestamptz not null default now(),
  check (commissionable_value_cents <= 1000000000)
);

create table if not exists public.partner_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.partner_programmes(id) on delete restrict,
  enrolment_id uuid not null references public.partner_enrolments(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  attribution_id uuid not null references public.partner_order_attributions(id) on delete restrict,
  event_type text not null check (event_type in ('commission','release','reserve','payout','adjustment','reversal')),
  status text not null check (status in ('pending_validation','available','reserved_for_payout','paid','adjusted','reversed')),
  amount_cents bigint not null,
  source_event_key text not null unique,
  policy_version text not null,
  rate_bps integer not null,
  created_at timestamptz not null default now(),
  effective_at timestamptz not null default now(),
  note text,
  check ((event_type = 'commission' and amount_cents >= 0) or event_type <> 'commission')
);
create index if not exists partner_ledger_enrolment_created_idx on public.partner_commission_ledger (enrolment_id, created_at desc);
create index if not exists partner_attribution_campaign_idx on public.partner_order_attributions (campaign_id) where campaign_id is not null;

create table if not exists public.partner_payout_statements (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.partner_programmes(id) on delete restrict,
  enrolment_id uuid not null references public.partner_enrolments(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('draft','eligible','reserved','paid','failed','cancelled')),
  amount_cents bigint not null check (amount_cents >= 0),
  paid_at timestamptz,
  external_reference text,
  created_at timestamptz not null default now(),
  unique (enrolment_id, period_start, period_end)
);

alter table public.partner_programmes enable row level security;
alter table public.partner_accounts enable row level security;
alter table public.partner_applications_v2 enable row level security;
alter table public.partner_enrolments enable row level security;
alter table public.partner_agreement_acceptances enable row level security;
alter table public.partner_campaigns enable row level security;
alter table public.partner_order_attributions enable row level security;
alter table public.partner_commission_ledger enable row level security;
alter table public.partner_payout_statements enable row level security;

revoke all on table public.partner_programmes, public.partner_accounts, public.partner_applications_v2,
  public.partner_enrolments, public.partner_agreement_acceptances, public.partner_campaigns,
  public.partner_order_attributions, public.partner_commission_ledger, public.partner_payout_statements
from public, anon, authenticated;
grant select on table public.partner_programmes to anon, authenticated;
grant select on table public.partner_accounts, public.partner_enrolments, public.partner_agreement_acceptances,
  public.partner_campaigns, public.partner_order_attributions, public.partner_commission_ledger,
  public.partner_payout_statements to authenticated;
grant all on table public.partner_programmes, public.partner_accounts, public.partner_applications_v2,
  public.partner_enrolments, public.partner_agreement_acceptances, public.partner_campaigns,
  public.partner_order_attributions, public.partner_commission_ledger, public.partner_payout_statements to service_role;
grant all on table public.partner_accounts to service_role;
grant all on table public.partner_applications_v2 to service_role;
grant all on table public.partner_enrolments to service_role;
grant all on table public.partner_agreement_acceptances to service_role;
grant all on table public.partner_campaigns to service_role;
grant all on table public.partner_order_attributions to service_role;
grant all on table public.partner_commission_ledger to service_role;
grant all on table public.partner_payout_statements to service_role;

create policy partner_programmes_public_read on public.partner_programmes for select using (true);
create policy partner_accounts_owner_read on public.partner_accounts for select to authenticated using (auth_user_id = (select auth.uid()));
create policy partner_enrolments_owner_read on public.partner_enrolments for select to authenticated using (
  exists (select 1 from public.partner_accounts a where a.id = partner_enrolments.partner_account_id and a.auth_user_id = (select auth.uid()))
);
create policy partner_agreements_owner_read on public.partner_agreement_acceptances for select to authenticated using (
  exists (select 1 from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id where e.id=partner_agreement_acceptances.enrolment_id and a.auth_user_id=(select auth.uid()))
);
create policy partner_campaigns_owner_read on public.partner_campaigns for select to authenticated using (
  exists (select 1 from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id where e.id=partner_campaigns.enrolment_id and a.auth_user_id=(select auth.uid()))
);
create policy partner_attributions_owner_read on public.partner_order_attributions for select to authenticated using (
  exists (select 1 from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id where e.id=partner_order_attributions.enrolment_id and a.auth_user_id=(select auth.uid()))
);
create policy partner_ledger_owner_read on public.partner_commission_ledger for select to authenticated using (
  exists (select 1 from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id where e.id=partner_commission_ledger.enrolment_id and a.auth_user_id=(select auth.uid()))
);
create policy partner_payouts_owner_read on public.partner_payout_statements for select to authenticated using (
  exists (select 1 from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id where e.id=partner_payout_statements.enrolment_id and a.auth_user_id=(select auth.uid()))
);

create or replace function public.submit_partner_application_v2(payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_programme public.partner_programmes; v_id uuid; v_types text[]; v_email text;
begin
  select * into v_programme from public.partner_programmes where programme_key='wellness_b2b' and accepting_applications;
  if v_programme.id is null then raise exception 'Applications are not currently open'; end if;
  v_email := lower(btrim(payload->>'email'));
  v_types := array(select distinct jsonb_array_elements_text(coalesce(payload->'partner_types','[]'::jsonb)));
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or cardinality(v_types) not between 1 and 2 or not (v_types <@ array['facility','creator']::text[]) then raise exception 'Invalid application'; end if;
  if char_length(btrim(payload->>'contact_name')) not between 2 and 160 then raise exception 'Invalid application'; end if;
  if coalesce(payload->>'website','') <> '' then raise exception 'Invalid application'; end if; -- honeypot
  if exists (select 1 from public.partner_applications_v2 where programme_id=v_programme.id and lower(email)=v_email and status in ('submitted','under_review','approved')) then raise exception 'An active application already exists for this email'; end if;
  insert into public.partner_applications_v2 (
    programme_id, partner_types, regulated_professional, professional_review_status, contact_name, email, phone,
    facility_name, facility_type, location, creator_name, profile_links, content_niche, promotion_approach,
    audience_size, audience_geography, media_kit_url, website_url, enquiry_only,
    application_terms_version, application_terms_accepted_at, marketing_consent, marketing_consent_at
  ) values (
    v_programme.id, v_types, coalesce((payload->>'regulated_professional')::boolean,false),
    case when coalesce((payload->>'regulated_professional')::boolean,false) then 'required' else 'not_applicable' end,
    left(btrim(payload->>'contact_name'),160), v_email, nullif(left(btrim(payload->>'phone'),40),''),
    nullif(left(btrim(payload->>'facility_name'),160),''), nullif(left(btrim(payload->>'facility_type'),100),''), nullif(left(btrim(payload->>'location'),160),''),
    nullif(left(btrim(payload->>'creator_name'),160),''), array(select left(btrim(value),500) from jsonb_array_elements_text(coalesce(payload->'profile_links','[]'::jsonb)) where btrim(value)<>'' limit 8),
    nullif(left(btrim(payload->>'content_niche'),160),''), nullif(left(btrim(payload->>'promotion_approach'),1000),''),
    nullif(left(btrim(payload->>'audience_size'),80),''), nullif(left(btrim(payload->>'audience_geography'),160),''), nullif(left(btrim(payload->>'media_kit_url'),500),''), nullif(left(btrim(payload->>'website_url'),500),''),
    coalesce((payload->>'enquiry_only')::boolean,false), 'wellness-partner-application-v2.0-2026-10-27', now(),
    coalesce((payload->>'marketing_consent')::boolean,false), case when coalesce((payload->>'marketing_consent')::boolean,false) then now() end
  ) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_partner_application_v2(jsonb) from public;
grant execute on function public.submit_partner_application_v2(jsonb) to anon, authenticated, service_role;

create or replace function public.freeze_partner_attribution(
  p_order_id uuid, p_programme_key text, p_referral_code text, p_campaign_key text,
  p_method text, p_storefront text, p_commissionable_value_cents bigint, p_policy_version text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_programme public.partner_programmes; v_enrolment public.partner_enrolments; v_campaign uuid; v_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  select * into v_programme from public.partner_programmes where programme_key=p_programme_key and storefront=p_storefront;
  if v_programme.id is null then raise exception 'programme/storefront mismatch'; end if;
  select * into v_enrolment from public.partner_enrolments where programme_id=v_programme.id and upper(referral_code)=upper(btrim(p_referral_code)) and status='approved';
  if v_enrolment.id is null or v_enrolment.commission_rate_bps is null then raise exception 'invalid partner code'; end if;
  if p_campaign_key is not null then select id into v_campaign from public.partner_campaigns where enrolment_id=v_enrolment.id and campaign_key=p_campaign_key and active; end if;
  insert into public.partner_order_attributions(order_id,programme_id,enrolment_id,campaign_id,storefront,attribution_method,commissionable_value_cents,commission_rate_bps,policy_version)
  values(p_order_id,v_programme.id,v_enrolment.id,v_campaign,p_storefront,p_method,p_commissionable_value_cents,v_enrolment.commission_rate_bps,p_policy_version)
  on conflict(order_id) do nothing returning id into v_id;
  if v_id is null then select id into v_id from public.partner_order_attributions where order_id=p_order_id; end if;
  return v_id;
end $$;
revoke all on function public.freeze_partner_attribution(uuid,text,text,text,text,text,bigint,text) from public, anon, authenticated;
grant execute on function public.freeze_partner_attribution(uuid,text,text,text,text,text,bigint,text) to service_role;

create or replace function public.record_verified_partner_commission()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_attr public.partner_order_attributions; v_programme public.partner_programmes; v_amount bigint;
begin
  if old.payment_status is distinct from 'complete' and new.payment_status='complete' then
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

-- Legacy bridge: preserve existing ambassador identifiers, rates and codes without
-- inventing auth ownership or altering their financial records.
insert into public.partner_accounts(holder_kind, public_name, legal_name, legacy_ambassador_id)
select 'individual', coalesce(nullif(btrim(concat_ws(' ', first_name,last_name)),''), nullif(email,''), ambassador_id), null, id
from public.psa_ambassadors
on conflict(legacy_ambassador_id) do nothing;

insert into public.partner_enrolments(programme_id,partner_account_id,status,partner_types,referral_code,tier_key,commission_rate_bps,approved_at)
select p.id, a.id,
  case when lower(coalesce(l.status,'')) in ('active','approved') then 'approved' else 'suspended' end,
  array['creator']::text[], coalesce(nullif(l.referral_code,''),'LEGACY-'||l.id), l.tier,
  round(coalesce(l.commission_rate,20)*100)::integer,
  case when lower(coalesce(l.status,'')) in ('active','approved') then coalesce(l.created_at,now()) end
from public.psa_ambassadors l
join public.partner_accounts a on a.legacy_ambassador_id=l.id
join public.partner_programmes p on p.programme_key='wellness_b2b'
on conflict(programme_id,partner_account_id) do nothing;
