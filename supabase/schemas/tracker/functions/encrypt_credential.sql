CREATE OR REPLACE FUNCTION tracker.encrypt_credential (
  plain_text     text,
  encryption_key text
)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(plain_text, encryption_key),
    'base64'
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."encrypt_credential"(text, text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."encrypt_credential"(text, text) FROM PUBLIC;
