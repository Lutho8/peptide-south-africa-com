CREATE TABLE "public"."community_members" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"              text                     NOT NULL,
  "phone_e164"        text                     NOT NULL,
  "phone_country"     text,
  "interest"          text                     NOT NULL,
  "source"            text                     NOT NULL DEFAULT 'community-page'::text,
  "consent_marketing" boolean                  NOT NULL DEFAULT false,
  "ip_hash"           text,
  "bsp_status"        text                     NOT NULL DEFAULT 'pending'::text,
  "bsp_last_error"    text,
  "joined_group_at"   timestamp with time zone,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "community_members_phone_e164_key" UNIQUE (phone_e164),
  CONSTRAINT "community_members_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."community_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_community_members_updated_at
  BEFORE UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can read community members" ON "public"."community_members"
  FOR SELECT
  TO "authenticated"
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."community_members" TO "anon", "authenticated", "postgres", "service_role";
