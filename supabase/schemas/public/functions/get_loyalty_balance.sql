CREATE OR REPLACE FUNCTION public.get_loyalty_balance (
  _user_id uuid
)
  RETURNS numeric
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() <> _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN (SELECT COALESCE(SUM(delta_zar), 0)::NUMERIC FROM public.loyalty_credits WHERE user_id = _user_id);
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."get_loyalty_balance"(uuid) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."get_loyalty_balance"(uuid) FROM PUBLIC;
