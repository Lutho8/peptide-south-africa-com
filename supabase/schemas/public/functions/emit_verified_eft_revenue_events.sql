CREATE OR REPLACE FUNCTION public.emit_verified_eft_revenue_events()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  settled_user_id uuid;
begin
  if old.payment_status = 'awaiting_eft' and new.payment_status = 'complete' then
    select user_id into settled_user_id from public.orders where id = new.order_id;
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
$function$;

GRANT EXECUTE ON FUNCTION "public"."emit_verified_eft_revenue_events"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
