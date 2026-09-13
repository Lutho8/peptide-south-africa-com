CREATE OR REPLACE FUNCTION tracker.delete_email (
  queue_name text,
  message_id bigint
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker', 'pgmq'
  AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."delete_email"(text, bigint) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."delete_email"(text, bigint) FROM PUBLIC;
