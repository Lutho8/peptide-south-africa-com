CREATE TABLE "public"."psa_pets_launch_box" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "email"                 text                     NOT NULL,
  "waitlist_id"           uuid,
  "items"                 jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "subtotal_zar"          numeric                  NOT NULL DEFAULT 0,
  "founding_discount_pct" numeric                  NOT NULL DEFAULT 20,
  "status"                text                     NOT NULL DEFAULT 'reserved'::text,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "psa_pets_launch_box_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_pets_launch_box_status_check" CHECK ((status = ANY (ARRAY['reserved'::text, 'converted'::text, 'expired'::text]))),
  CONSTRAINT "psa_pets_launch_box_waitlist_id_fkey" FOREIGN KEY (waitlist_id) REFERENCES public.psa_pets_waitlist(id) ON DELETE SET NULL
);

ALTER TABLE "public"."psa_pets_launch_box"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX psa_pets_launch_box_waitlist_id_idx ON public.psa_pets_launch_box USING btree (waitlist_id);

CREATE POLICY "pets_launchbox_insert" ON "public"."psa_pets_launch_box"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_pets_launch_box" TO "anon", "authenticated", "postgres", "service_role";
