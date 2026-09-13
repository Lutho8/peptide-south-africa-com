CREATE OR REPLACE FUNCTION public.move_to_dlq (
  source_queue text,
  dlq_name     text,
  message_id   bigint,
  payload      jsonb
)
  RETURNS bigint
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pgmq'
  AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN PERFORM pgmq.create(dlq_name); EXCEPTION WHEN OTHERS THEN NULL; END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN PERFORM pgmq.delete(source_queue, message_id); EXCEPTION WHEN undefined_table THEN NULL; END;
  RETURN new_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."move_to_dlq"(text, text, bigint, jsonb) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."move_to_dlq"(text, text, bigint, jsonb) FROM PUBLIC;
