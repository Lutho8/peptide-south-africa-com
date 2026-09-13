CREATE OR REPLACE FUNCTION tracker.decrypt_credential (
  encrypted_text text,
  encryption_key text
)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'tracker'
  AS $function$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    encryption_key
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL; -- Return NULL if decryption fails
END;
$function$;

GRANT EXECUTE ON FUNCTION "tracker"."decrypt_credential"(text, text) TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "tracker"."decrypt_credential"(text, text) FROM PUBLIC;
