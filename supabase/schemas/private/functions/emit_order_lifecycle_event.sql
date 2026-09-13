CREATE OR REPLACE FUNCTION private.emit_order_lifecycle_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  lifecycle_event text;
begin
  if tg_op = 'INSERT' then
    insert into public.analytics_events (
      event, event_version, source, session_id, user_id, order_id, props
    ) values (
      'order_created', '1.0', 'database', 'server:' || new.id::text,
      new.user_id, new.id,
      jsonb_build_object('order_id', new.id, 'status', new.status, 'amount_zar', new.total, 'currency', new.currency)
    ) on conflict do nothing;

    if new.status = 'pending' then
      insert into public.analytics_events (
        event, event_version, source, session_id, user_id, order_id, props
      ) values (
        'payment_pending', '1.0', 'database', 'server:' || new.id::text,
        new.user_id, new.id,
        jsonb_build_object('order_id', new.id, 'payment_provider', new.payment_provider)
      ) on conflict do nothing;
    end if;
    return new;
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  lifecycle_event := case lower(new.status)
    when 'paid' then 'payment_confirmed'
    when 'processing' then 'order_packed'
    when 'packed' then 'order_packed'
    when 'shipped' then 'order_dispatched'
    when 'dispatched' then 'order_dispatched'
    when 'delivered' then 'order_delivered'
    else null
  end;

  if lifecycle_event is not null then
    insert into public.analytics_events (
      event, event_version, source, session_id, user_id, order_id, props
    ) values (
      lifecycle_event, '1.0', 'database', 'server:' || new.id::text,
      new.user_id, new.id,
      jsonb_build_object('order_id', new.id, 'from_status', old.status, 'to_status', new.status)
    ) on conflict do nothing;
  end if;
  return new;
end;
$function$;

GRANT EXECUTE ON FUNCTION "private"."emit_order_lifecycle_event"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "private"."emit_order_lifecycle_event"() FROM PUBLIC;
