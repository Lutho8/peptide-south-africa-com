CREATE TABLE "tracker"."user_roles" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_roles_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."user_roles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tracker"."user_roles"
  ADD COLUMN "role" tracker.app_role NOT NULL;

ALTER TABLE "tracker"."user_roles"
  ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE (user_id, ROLE);

CREATE POLICY "admin_all" ON "tracker"."user_roles"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

CREATE POLICY "owner_select" ON "tracker"."user_roles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."user_roles" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."user_roles" TO "postgres", "service_role";
