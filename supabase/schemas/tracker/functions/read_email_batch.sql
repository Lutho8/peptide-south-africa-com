CREATE OR REPLACE FUNCTION tracker.read_email_batch (
  queue_name text,
  batch_size integer,
  vt         integer
)
  RETURNS TABLE (
    msg_id  bigint,
    read_ct integer,
    message jsonb
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker', 'pgmq'
  AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."read_email_batch"(text, integer, integer) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."read_email_batch"(text, integer, integer) FROM PUBLIC;
