CREATE OR REPLACE FUNCTION public.enforce_cart_user_id()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."enforce_cart_user_id"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."enforce_cart_user_id"() FROM PUBLIC;
