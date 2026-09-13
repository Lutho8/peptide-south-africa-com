CREATE TABLE "public"."psa_pets_waitlist" (
  "id"                                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "ticket_code"                       text                     NOT NULL,
  "owner_name"                        text                     NOT NULL,
  "email"                             text                     NOT NULL,
  "whatsapp"                          text,
  "pet_type"                          text,
  "pet_breed"                         text,
  "pet_age"                           integer,
  "city"                              text,
  "products"                          jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "primary_concern"                   text,
  "referral_code"                     text,
  "referred_by"                       text,
  "source"                            text                     NOT NULL DEFAULT 'pets-landing'::text,
  "locale"                            text                     NOT NULL DEFAULT 'en'::text,
  "consent_popia"                     boolean                  NOT NULL DEFAULT false,
  "utm"                               jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "quiz_answers"                      jsonb,
  "created_at"                        timestamp with time zone NOT NULL DEFAULT now(),
  "queue_number"                      bigint                   NOT NULL DEFAULT nextval('public.psa_pets_waitlist_queue_seq'::regclass),
  "research_information_acknowledged" boolean                  NOT NULL DEFAULT false,
  "marketing_consent"                 boolean                  NOT NULL DEFAULT false,
  "consent_version"                   text,
  "consent_accepted_at"               timestamp with time zone,
  CONSTRAINT "psa_pets_waitlist_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_pets_waitlist_ticket_code_key" UNIQUE (ticket_code)
);

ALTER TABLE "public"."psa_pets_waitlist"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_pets_waitlist_queue_seq" OWNED BY "public"."psa_pets_waitlist"."queue_number";

ALTER TABLE "public"."psa_pets_waitlist"
  ADD COLUMN "email_normalized" text GENERATED ALWAYS AS (lower(btrim(email))) STORED;

CREATE UNIQUE INDEX psa_pets_waitlist_email_normalized_key ON public.psa_pets_waitlist USING btree (email_normalized);

CREATE UNIQUE INDEX psa_pets_waitlist_email_pet_idx ON public.psa_pets_waitlist USING btree (lower(email), COALESCE(pet_breed, ''::text), COALESCE(pet_type, ''::text));

CREATE POLICY "pets_waitlist_no_direct_access" ON "public"."psa_pets_waitlist"
  AS RESTRICTIVE
  FOR ALL
  TO "anon", "authenticated"
  USING (false)
  WITH CHECK (false);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_pets_waitlist" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."psa_pets_waitlist" FROM "anon";

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_pets_waitlist" TO "anon";

REVOKE ALL ON TABLE "public"."psa_pets_waitlist" FROM "authenticated";

GRANT DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_pets_waitlist" TO "authenticated";
