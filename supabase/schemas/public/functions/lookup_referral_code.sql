CREATE OR REPLACE FUNCTION public.lookup_referral_code (
  _code text
)
  RETURNS TABLE (
    id         uuid,
    reward_zar integer
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT id, reward_zar FROM public.referral_codes WHERE code = upper(_code) LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION "public"."lookup_referral_code"(text) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."lookup_referral_code"(text) FROM PUBLIC;
