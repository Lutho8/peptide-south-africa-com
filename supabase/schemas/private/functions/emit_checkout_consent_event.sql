CREATE OR REPLACE FUNCTION private.emit_checkout_consent_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.analytics_events (
    event, event_version, source, session_id, user_id, order_id, props
  ) values (
    'checkout_consent_accepted', '1.0', 'database', 'server:' || new.order_id::text,
    new.user_id, new.order_id,
    jsonb_build_object(
      'order_id', new.order_id,
      'policy_version', new.policy_version,
      'report_scope_version', new.report_scope_version,
      'marketing_consent', new.marketing_consent
    )
  ) on conflict do nothing;

  if new.marketing_consent then
    insert into public.analytics_events (
      event, event_version, source, session_id, user_id, order_id, props
    ) values (
      'marketing_consent_granted', '1.0', 'database', 'server:' || new.order_id::text,
      new.user_id, new.order_id,
      jsonb_build_object('order_id', new.order_id, 'policy_version', new.policy_version)
    ) on conflict do nothing;
  end if;
  return new;
end;
$function$;

GRANT EXECUTE ON FUNCTION "private"."emit_checkout_consent_event"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "private"."emit_checkout_consent_event"() FROM PUBLIC;
