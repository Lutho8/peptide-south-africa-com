CREATE TABLE "tracker"."renpho_credentials" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                 uuid                     NOT NULL,
  "email_encrypted"         text                     NOT NULL,
  "password_hash_encrypted" text                     NOT NULL,
  "last_sync_at"            timestamp with time zone,
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "renpho_credentials_pkey" PRIMARY KEY (id),
  CONSTRAINT "renpho_credentials_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "renpho_credentials_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "tracker"."renpho_credentials"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_renpho_credentials_updated_at
  BEFORE UPDATE ON tracker.renpho_credentials
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."renpho_credentials"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."renpho_credentials"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."renpho_credentials"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."renpho_credentials"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."renpho_credentials" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."renpho_credentials" TO "postgres", "service_role";
