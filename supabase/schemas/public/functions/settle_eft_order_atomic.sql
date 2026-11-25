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
