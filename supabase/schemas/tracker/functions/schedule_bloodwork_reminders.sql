CREATE OR REPLACE FUNCTION tracker.schedule_bloodwork_reminders()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
DECLARE
  anchor_ts TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    anchor_ts := COALESCE(NEW.report_date::timestamptz, NEW.uploaded_at, now());
    INSERT INTO tracker.bloodwork_reminders (user_id, lab_report_id, kind, due_at)
    VALUES
      (NEW.user_id, NEW.id, 'pre',      anchor_ts + INTERVAL '75 days'),
      (NEW.user_id, NEW.id, 'due',      anchor_ts + INTERVAL '90 days'),
      (NEW.user_id, NEW.id, 'overdue',  anchor_ts + INTERVAL '105 days')
    ON CONFLICT (lab_report_id, kind) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."schedule_bloodwork_reminders"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."schedule_bloodwork_reminders"() FROM PUBLIC;
