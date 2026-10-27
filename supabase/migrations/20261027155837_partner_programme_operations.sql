-- Operational APIs: service-only review and money movements; owner-only agreements and campaigns.
alter table public.partner_policies add column terms_sha256 text;
update public.partner_policies set terms_sha256='45b6ed75d96f6361ce1f99c4cdae473a27783c80971eaf8f62e2ca5a0725e160' where terms_sha256 is null;
alter table public.partner_policies alter column terms_sha256 set not null;
create table public.partner_referral_clicks (
 id uuid primary key default gen_random_uuid(), programme_id uuid not null references public.partner_programmes,
 enrolment_id uuid not null references public.partner_enrolments, referral_code text not null,
 campaign_key text, method text not null check(method in ('referral_click','qr')),
 created_at timestamptz not null default now(), expires_at timestamptz not null,
 check(expires_at<=created_at+interval '30 days' and expires_at>created_at)
);
alter table public.partner_referral_clicks enable row level security;
revoke all on public.partner_referral_clicks from public,anon,authenticated;
grant all on public.partner_referral_clicks to service_role;
create table public.partner_operation_events (
 id uuid primary key default gen_random_uuid(), enrolment_id uuid references public.partner_enrolments,
 action text not null, source_key text not null unique, detail jsonb not null default '{}', created_at timestamptz not null default now()
);
alter table public.partner_operation_events enable row level security;
revoke all on public.partner_operation_events from public,anon,authenticated;
grant all on public.partner_operation_events to service_role;
alter table public.partner_commission_ledger add column statement_id uuid references public.partner_payout_statements;

create or replace function public.approve_partner_application(p_application_id uuid,p_auth_user_id uuid,p_referral_code text,p_professional_clearance boolean default false)
returns uuid language plpgsql security definer set search_path='' as $$
declare a public.partner_applications_v2; acc uuid; enr uuid;
begin
 select * into a from public.partner_applications_v2 where id=p_application_id for update;
 if a.id is null or a.status not in ('submitted','under_review','approved') then raise exception 'Application cannot be approved'; end if;
 if a.enquiry_only then raise exception 'Education/enquiry-only applications cannot earn commissions'; end if;
 if a.regulated_professional and not p_professional_clearance then raise exception 'Professional clearance required'; end if;
 if p_referral_code !~ '^[A-Z0-9_-]{3,80}$' then raise exception 'Invalid code'; end if;
 if not exists(select 1 from auth.users where id=p_auth_user_id and lower(email)=lower(a.email) and email_confirmed_at is not null) then raise exception 'Verified applicant account required'; end if;
 select id into enr from public.partner_enrolments where application_id=a.id;
 if enr is not null then return enr; end if;
 insert into public.partner_accounts(auth_user_id,holder_kind,public_name) values(p_auth_user_id,case when 'facility'=any(a.partner_types) then 'organisation' else 'individual' end,coalesce(a.facility_name,a.creator_name,a.contact_name)) on conflict(auth_user_id) do update set updated_at=now() returning id into acc;
 insert into public.partner_enrolments(programme_id,partner_account_id,application_id,status,partner_types,referral_code,commission_rate_bps,validation_days,approved_at)
 values(a.programme_id,acc,a.id,'approved',a.partner_types,p_referral_code,2000,14,now()) returning id into enr;
 update public.partner_applications_v2 set status='approved',professional_review_status=case when regulated_professional then 'approved' else 'not_applicable' end,updated_at=now() where id=a.id;
 insert into public.partner_operation_events(enrolment_id,action,source_key) values(enr,'application_approved','approve:'||a.id);
 return enr;
end $$;
revoke all on function public.approve_partner_application(uuid,uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.approve_partner_application(uuid,uuid,text,boolean) to service_role;

create or replace function public.accept_partner_agreement(p_enrolment_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare p public.partner_policies; result uuid;
begin
 select pol.* into p from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id join public.partner_policies pol on pol.programme_id=e.programme_id and pol.active where e.id=p_enrolment_id and a.auth_user_id=auth.uid() and e.status='approved';
 if p.id is null then raise exception 'Approved owned enrolment required'; end if;
 insert into public.partner_agreement_acceptances(enrolment_id,terms_version,accepted_by_user_id,terms_sha256) values(p_enrolment_id,p.policy_version,auth.uid(),p.terms_sha256)
 on conflict(enrolment_id,terms_version) do update set terms_version=excluded.terms_version returning id into result;
 return result;
end $$;
revoke all on function public.accept_partner_agreement(uuid) from public,anon;
grant execute on function public.accept_partner_agreement(uuid) to authenticated;

create or replace function public.create_partner_campaign(p_enrolment_id uuid,p_campaign_key text,p_name text,p_channel text)
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not exists(select 1 from public.partner_enrolments e join public.partner_accounts a on a.id=e.partner_account_id where e.id=p_enrolment_id and e.status='approved' and a.auth_user_id=auth.uid()) then raise exception 'Approved owned enrolment required'; end if;
 insert into public.partner_campaigns(enrolment_id,campaign_key,name,channel) values(p_enrolment_id,p_campaign_key,p_name,p_channel) returning id into result;
 return result;
end $$;
revoke all on function public.create_partner_campaign(uuid,text,text,text) from public,anon;
grant execute on function public.create_partner_campaign(uuid,text,text,text) to authenticated;

create or replace function public.release_partner_commissions()
returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 update public.partner_commission_ledger l set status='available' where l.status='pending_validation' and exists (select 1 from public.partner_commission_ledger original where original.attribution_id=l.attribution_id and original.event_type='commission' and original.created_at<=now()-interval '14 days');
 get diagnostics n=row_count; return n;
end $$;
revoke all on function public.release_partner_commissions() from public,anon,authenticated;
grant execute on function public.release_partner_commissions() to service_role;

-- The caller supplies independently verified cumulative refunded eligible merchandise, never raw order total.
create or replace function public.adjust_partner_refund(p_order_id uuid,p_refunded_eligible_cents bigint,p_source_event_key text)
returns bigint language plpgsql security definer set search_path='' as $$
declare a public.partner_order_attributions; l public.partner_commission_ledger; prior bigint; target bigint; delta bigint;
begin
 select * into a from public.partner_order_attributions where order_id=p_order_id for update;
 if a.id is null then return 0; end if;
 if exists(select 1 from public.partner_operation_events where source_key='refund:'||p_source_event_key) then return 0; end if;
 if p_refunded_eligible_cents<0 or p_refunded_eligible_cents>a.commissionable_value_cents then raise exception 'Refund exceeds eligible merchandise'; end if;
 select * into l from public.partner_commission_ledger where attribution_id=a.id and event_type='commission';
 if l.id is null then return 0; end if;
 if l.status='reserved_for_payout' then raise exception 'Cancel reserved statement before refund adjustment'; end if;
 select coalesce(-sum(amount_cents),0) into prior from public.partner_commission_ledger where attribution_id=a.id and event_type in ('adjustment','reversal');
 target:=round(p_refunded_eligible_cents*a.commission_rate_bps/10000.0); delta:=target-prior;
 if delta<0 then raise exception 'Cumulative refunds cannot decrease'; end if;
 insert into public.partner_operation_events(enrolment_id,action,source_key,detail) values(a.enrolment_id,'refund_adjusted','refund:'||p_source_event_key,jsonb_build_object('order_id',p_order_id,'cumulative_eligible_cents',p_refunded_eligible_cents));
 if delta>0 then
 insert into public.partner_commission_ledger(programme_id,enrolment_id,order_id,attribution_id,event_type,status,amount_cents,source_event_key,policy_version,rate_bps)
 values(a.programme_id,a.enrolment_id,p_order_id,a.id,case when target=l.amount_cents then 'reversal' else 'adjustment' end,case when l.status='paid' then 'available' else l.status end,-delta,'refund:'||p_source_event_key,a.policy_version,a.commission_rate_bps);
 end if;
 return delta;
end $$;
revoke all on function public.adjust_partner_refund(uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.adjust_partner_refund(uuid,bigint,text) to service_role;

create or replace function public.prepare_partner_payout(p_enrolment_id uuid,p_period_start date,p_period_end date)
returns uuid language plpgsql security definer set search_path='' as $$
declare e public.partner_enrolments; result uuid; balance bigint;
begin
 select * into e from public.partner_enrolments where id=p_enrolment_id for update;
 if e.id is null or e.status<>'approved' then raise exception 'Approved enrolment required'; end if;
 if p_period_start<>date_trunc('month',p_period_start)::date or p_period_end<>(p_period_start+interval '1 month'-interval '1 day')::date or p_period_end>=current_date then raise exception 'A completed calendar month is required'; end if;
 select id into result from public.partner_payout_statements where enrolment_id=e.id and period_start=p_period_start and period_end=p_period_end;
 if result is not null then return result; end if;
 perform public.release_partner_commissions();
 perform 1 from public.partner_commission_ledger where enrolment_id=e.id and status='available' for update;
 select coalesce(sum(amount_cents),0) into balance from public.partner_commission_ledger where enrolment_id=e.id and status='available';
 if balance<50000 then raise exception 'Available balance below R500; carry forward'; end if;
 insert into public.partner_payout_statements(programme_id,enrolment_id,period_start,period_end,status,amount_cents) values(e.programme_id,e.id,p_period_start,p_period_end,'reserved',balance) returning id into result;
 update public.partner_commission_ledger set status='reserved_for_payout',statement_id=result where enrolment_id=e.id and status='available';
 return result;
end $$;
revoke all on function public.prepare_partner_payout(uuid,date,date) from public,anon,authenticated;
grant execute on function public.prepare_partner_payout(uuid,date,date) to service_role;

create or replace function public.confirm_partner_payout(p_statement_id uuid,p_external_reference text)
returns void language plpgsql security definer set search_path='' as $$
declare s public.partner_payout_statements;
begin
 select * into s from public.partner_payout_statements where id=p_statement_id for update;
 if s.status='paid' and s.external_reference=p_external_reference then return; end if;
 if s.id is null or s.status<>'reserved' or p_external_reference is null or length(btrim(p_external_reference))<3 then raise exception 'Reserved statement and verified EFT reference required'; end if;
 update public.partner_payout_statements set status='paid',paid_at=now(),external_reference=p_external_reference where id=s.id;
 update public.partner_commission_ledger set status='paid' where statement_id=s.id;
 insert into public.partner_operation_events(enrolment_id,action,source_key) values(s.enrolment_id,'payout_confirmed','payout:'||s.id);
end $$;
revoke all on function public.confirm_partner_payout(uuid,text) from public,anon,authenticated;
grant execute on function public.confirm_partner_payout(uuid,text) to service_role;

create or replace function public.cancel_partner_payout(p_statement_id uuid,p_failed boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare s public.partner_payout_statements;
begin
 select * into s from public.partner_payout_statements where id=p_statement_id for update;
 if s.status not in ('reserved','draft','eligible') then raise exception 'Only unpaid statements can be cancelled'; end if;
 update public.partner_payout_statements set status=case when p_failed then 'failed' else 'cancelled' end where id=s.id;
 update public.partner_commission_ledger set status='available',statement_id=null where statement_id=s.id;
end $$;
revoke all on function public.cancel_partner_payout(uuid,boolean) from public,anon,authenticated;
grant execute on function public.cancel_partner_payout(uuid,boolean) to service_role;
-- Snapshot edits are forbidden even to service callers; corrections use audited ledger events.
create or replace function public.protect_partner_attribution_snapshot()
returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Order attribution snapshots are immutable'; end $$;
revoke all on function public.protect_partner_attribution_snapshot() from public,anon,authenticated;
create trigger partner_attribution_immutable before update or delete on public.partner_order_attributions for each row execute function public.protect_partner_attribution_snapshot();
create or replace function public.audit_partner_ledger_status()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.amount_cents<>new.amount_cents or old.order_id<>new.order_id or old.enrolment_id<>new.enrolment_id or old.source_event_key<>new.source_event_key then raise exception 'Financial amounts and identity are immutable'; end if;
 if old.status<>new.status then
 insert into public.partner_operation_events(enrolment_id,action,source_key,detail) values(new.enrolment_id,'ledger_status_changed',gen_random_uuid()::text,jsonb_build_object('ledger_id',new.id,'from',old.status,'to',new.status,'statement_id',new.statement_id));
 end if; return new;
end $$;
revoke all on function public.audit_partner_ledger_status() from public,anon,authenticated;
create trigger partner_ledger_status_audit before update on public.partner_commission_ledger for each row execute function public.audit_partner_ledger_status();
