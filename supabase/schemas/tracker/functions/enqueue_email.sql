CREATE OR REPLACE FUNCTION tracker.enqueue_email (
  queue_name text,
  payload    jsonb
)
  RETURNS bigint
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker', 'pgmq'
  AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."enqueue_email"(text, jsonb) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."enqueue_email"(text, jsonb) FROM PUBLIC;
