-- psa_orders.order_id is legacy varchar while orders.id is uuid. Cast at the
-- trigger boundary so a confirmed EFT can emit its server-derived analytics.
create or replace function public.emit_verified_eft_revenue_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  settled_user_id uuid;
begin
  if old.payment_status = 'awaiting_eft' and new.payment_status = 'complete' then
    select user_id into settled_user_id
    from public.orders
    where id = new.order_id::uuid;

    insert into public.analytics_events (event, session_id, user_id, props)
    values
      ('bank_deposit_verified', 'server:' || new.order_id::text, settled_user_id,
        jsonb_build_object('order_id', new.order_id, 'server_confirmed_amount_zar', new.order_total, 'currency', 'ZAR', 'verification', 'matching_bank_deposit')),
      ('payin_completed', 'server:' || new.order_id::text, settled_user_id,
        jsonb_build_object('order_id', new.order_id, 'server_confirmed_amount_zar', new.order_total, 'currency', 'ZAR', 'verification', 'matching_bank_deposit'))
    on conflict do nothing;
  end if;
  return new;
end;
$$;
