CREATE TABLE "public"."user_roles" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_roles_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."user_roles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_roles"
  ADD COLUMN "role" public.app_role NOT NULL;

ALTER TABLE "public"."user_roles"
  ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE (user_id, ROLE);

CREATE POLICY "Admins manage roles" ON "public"."user_roles"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view own roles" ON "public"."user_roles"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_roles" TO "anon", "authenticated", "postgres", "service_role";
