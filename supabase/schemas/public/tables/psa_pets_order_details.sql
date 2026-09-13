CREATE TABLE "public"."psa_pets_order_details" (
  "order_id"    uuid                     NOT NULL,
  "user_id"     uuid                     NOT NULL,
  "pet_name"    text                     NOT NULL,
  "pet_species" text                     NOT NULL,
  "storefront"  text                     NOT NULL DEFAULT 'pets.peptide-south-africa.com'::text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "psa_pets_order_details_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT "psa_pets_order_details_pet_name_check" CHECK (((char_length(btrim(pet_name)) >= 1) AND (char_length(btrim(pet_name)) <= 120))),
  CONSTRAINT "psa_pets_order_details_pet_species_check" CHECK ((pet_species = ANY (ARRAY['dog'::text, 'cat'::text, 'horse'::text]))),
  CONSTRAINT "psa_pets_order_details_pkey" PRIMARY KEY (order_id),
  CONSTRAINT "psa_pets_order_details_storefront_check" CHECK ((storefront = 'pets.peptide-south-africa.com'::text)),
  CONSTRAINT "psa_pets_order_details_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT
);

ALTER TABLE "public"."psa_pets_order_details"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX psa_pets_order_details_user_created_idx ON public.psa_pets_order_details USING btree (user_id, created_at DESC);

CREATE POLICY "psa_pets_order_details_owner_or_admin_select" ON "public"."psa_pets_order_details"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_pets_order_details" TO "postgres", "service_role";

COMMENT ON TABLE "public"."psa_pets_order_details" IS 'Pets-specific order metadata kept separate from human-store customer data.';

REVOKE ALL ON TABLE "public"."psa_pets_order_details" FROM "authenticated";

GRANT SELECT ON TABLE "public"."psa_pets_order_details" TO "authenticated";
