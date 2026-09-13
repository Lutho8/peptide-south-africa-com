CREATE TABLE "public"."customer_tags" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "tag"        text                     NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "customer_tags_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "customer_tags_pkey" PRIMARY KEY (id),
  CONSTRAINT "customer_tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "customer_tags_user_id_tag_key" UNIQUE (user_id, TAG)
);

ALTER TABLE "public"."customer_tags"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tags" ON "public"."customer_tags"
  FOR ALL
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."customer_tags" TO "anon", "authenticated", "postgres", "service_role";
