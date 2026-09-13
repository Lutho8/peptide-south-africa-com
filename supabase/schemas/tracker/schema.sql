CREATE SCHEMA "tracker";

GRANT USAGE ON SCHEMA "tracker" TO "anon", "authenticated";

GRANT CREATE, USAGE ON SCHEMA "tracker" TO "postgres";

GRANT USAGE ON SCHEMA "tracker" TO "service_role";

COMMENT ON SCHEMA "tracker" IS 'Peptide tracker app, migrated off Lovable Cloud on 2026-08-19.';
