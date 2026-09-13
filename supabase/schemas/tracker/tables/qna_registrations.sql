CREATE TABLE "tracker"."qna_registrations" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "full_name"             text                     NOT NULL,
  "email"                 text                     NOT NULL,
  "phone"                 text,
  "experience_level"      text                     NOT NULL DEFAULT 'beginner'::text,
  "topics_of_interest"    text[],
  "session_month"         text                     NOT NULL,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "first_name"            text,
  "last_name"             text,
  "whatsapp_country_code" text                     DEFAULT '+49'::text,
  "whatsapp_number"       text,
  "email_consent"         boolean                  NOT NULL DEFAULT false,
  "whatsapp_consent"      boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "qna_registrations_email_session_month_key" UNIQUE (email, session_month),
  CONSTRAINT "qna_registrations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."qna_registrations"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON "tracker"."qna_registrations"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

CREATE POLICY "public_insert" ON "tracker"."qna_registrations"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

GRANT INSERT ON TABLE "tracker"."qna_registrations" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."qna_registrations" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."qna_registrations" TO "postgres", "service_role";
