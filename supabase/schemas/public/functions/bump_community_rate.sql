CREATE OR REPLACE FUNCTION public.bump_community_rate (
  _ip_hash        text,
  _limit          integer DEFAULT 5,
  _window_minutes integer DEFAULT 60
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  cur_count integer;
  cur_start timestamptz;
BEGIN
  IF _ip_hash IS NULL OR length(_ip_hash) = 0 THEN
    RETURN true;
  END IF;
  INSERT INTO public.community_join_rate (ip_hash, window_start, count)
    VALUES (_ip_hash, now(), 1)
  ON CONFLICT (ip_hash) DO UPDATE
    SET count = CASE
      WHEN public.community_join_rate.window_start < now() - make_interval(mins => _window_minutes) THEN 1
      ELSE public.community_join_rate.count + 1
    END,
    window_start = CASE
      WHEN public.community_join_rate.window_start < now() - make_interval(mins => _window_minutes) THEN now()
      ELSE public.community_join_rate.window_start
    END
  RETURNING count INTO cur_count;
  RETURN cur_count <= _limit;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."bump_community_rate"(text, integer, integer) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."bump_community_rate"(text, integer, integer) FROM PUBLIC;
