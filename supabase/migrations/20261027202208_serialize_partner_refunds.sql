-- Serialize refunds with payout reservation and allow retry of unpaid cancelled statements.
create or replace function public.adjust_partner_refund(p_order_id uuid,p_refunded_eligible_cents bigint,p_source_event_key text)
returns bigint language plpgsql security definer set search_path='' as $$
declare a public.partner_order_attributions; l public.partner_commission_ledger; prior bigint; target bigint; delta bigint;
begin
 if p_refunded_eligible_cents is null or p_source_event_key is null or length(btrim(p_source_event_key))<3 then raise exception 'Verified refund amount and reference required'; end if;
 select * into a from public.partner_order_attributions where order_id=p_order_id for update;
 if a.id is null then return 0; end if;
 if exists(select 1 from public.partner_operation_events where source_key='refund:'||p_source_event_key) then return 0; end if;
 if p_refunded_eligible_cents<0 or p_refunded_eligible_cents>a.commissionable_value_cents then raise exception 'Refund exceeds eligible merchandise'; end if;
 select * into l from public.partner_commission_ledger where attribution_id=a.id and event_type='commission' for update;
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
 select id into result from public.partner_payout_statements where enrolment_id=e.id and period_start=p_period_start and period_end=p_period_end for update;
 if result is not null and exists(select 1 from public.partner_payout_statements where id=result and status in ('reserved','paid')) then return result; end if;
 perform public.release_partner_commissions();
 perform 1 from public.partner_commission_ledger where enrolment_id=e.id and status='available' for update;
 select coalesce(sum(amount_cents),0) into balance from public.partner_commission_ledger where enrolment_id=e.id and status='available';
 if balance<50000 then raise exception 'Available balance below R500; carry forward'; end if;
 if result is null then
 insert into public.partner_payout_statements(programme_id,enrolment_id,period_start,period_end,status,amount_cents) values(e.programme_id,e.id,p_period_start,p_period_end,'reserved',balance) returning id into result;
 else
 update public.partner_payout_statements set status='reserved',amount_cents=balance where id=result;
 end if;
 update public.partner_commission_ledger set status='reserved_for_payout',statement_id=result where enrolment_id=e.id and status='available';
 return result;
end $$;
revoke all on function public.prepare_partner_payout(uuid,date,date) from public,anon,authenticated;
grant execute on function public.prepare_partner_payout(uuid,date,date) to service_role;

