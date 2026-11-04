alter table public.orders alter column user_id drop not null;
alter table public.checkout_consents alter column user_id drop not null;
create or replace function public.enrich_customer_on_order_paid() returns trigger language plpgsql security definer set search_path to 'public' as $f$
begin
 if new.user_id is not null and new.status = 'paid' and old.status is distinct from 'paid' then
  insert into public.customer_profiles (user_id,first_order_at,last_order_at,order_count,lifetime_value_zar) values(new.user_id,new.paid_at,new.paid_at,1,new.total)
  on conflict(user_id) do update set first_order_at=coalesce(public.customer_profiles.first_order_at,excluded.first_order_at),last_order_at=excluded.last_order_at,order_count=public.customer_profiles.order_count+1,lifetime_value_zar=public.customer_profiles.lifetime_value_zar+new.total,updated_at=now();
  insert into public.retention_events(user_id,event,meta) values(new.user_id,'order_paid',jsonb_build_object('order_id',new.id,'total',new.total,'provider',new.payment_provider));
 end if;
 return new;
end $f$;
create or replace function public.settle_eft_order_atomic(p_order_id uuid,p_deposit_id uuid) returns boolean language plpgsql security invoker set search_path='' as $f$
declare d public.bank_deposits%rowtype; p public.psa_orders%rowtype; n integer;
begin
 select * into d from public.bank_deposits where id=p_deposit_id for update;
 if not found or d.status <> 'unmatched' then return false; end if;
 select * into p from public.psa_orders where order_id=p_order_id::text for update;
 if not found or p.payment_status <> 'awaiting_eft' or p.payment_reference is null or d.reference is null or upper(regexp_replace(d.reference,'\s','','g')) <> upper(regexp_replace(p.payment_reference,'\s','','g')) or abs(d.amount-p.order_total) >= 0.01 then return false; end if;
 update public.orders set status='paid',paid_at=now() where id=p_order_id and status='pending';
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Storefront order cannot be settled'; end if;
 update public.psa_orders set payment_status='complete',payment_settled_at=now() where id=p.id and payment_status='awaiting_eft';
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Payment order cannot be settled'; end if;
 update public.bank_deposits set status='matched',matched_order_id=p_order_id::text where id=p_deposit_id and status='unmatched';
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Deposit cannot be settled'; end if;
 return true;
end $f$;
revoke all on function public.settle_eft_order_atomic(uuid,uuid) from public,anon,authenticated;
grant execute on function public.settle_eft_order_atomic(uuid,uuid) to service_role;
create or replace function public.emit_verified_eft_revenue_events() returns trigger language plpgsql security definer set search_path='public' as $f$
declare settled_user_id uuid;
begin
 if old.payment_status = 'awaiting_eft' and new.payment_status = 'complete' then
  if new.order_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
   select user_id into settled_user_id from public.orders where id=new.order_id::uuid;
  end if;
  insert into public.analytics_events(event,session_id,user_id,props) values
  ('bank_deposit_verified','server:' || new.order_id,settled_user_id,jsonb_build_object('order_id',new.order_id,'server_confirmed_amount_zar',new.order_total,'currency','ZAR','verification','matching_bank_deposit')),
  ('payin_completed','server:' || new.order_id,settled_user_id,jsonb_build_object('order_id',new.order_id,'server_confirmed_amount_zar',new.order_total,'currency','ZAR','verification','matching_bank_deposit')) on conflict do nothing;
 end if;
 return new;
end $f$;
revoke execute on function public.emit_verified_eft_revenue_events() from public,anon,authenticated;
