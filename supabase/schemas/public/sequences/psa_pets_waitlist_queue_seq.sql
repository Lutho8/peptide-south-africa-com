CREATE SEQUENCE "public"."psa_pets_waitlist_queue_seq" AS bigint INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1 NO CYCLE;

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."psa_pets_waitlist_queue_seq" TO "anon", "authenticated", "postgres", "service_role";
