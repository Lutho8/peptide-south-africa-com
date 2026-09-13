CREATE TABLE "public"."psa_leads" (
  "id"                     integer                  NOT NULL DEFAULT nextval('public.psa_leads_id_seq'::regclass),
  "email"                  text                     NOT NULL,
  "user_id"                uuid,
  "source_site"            text                     NOT NULL DEFAULT 'peptide-south-africa.com'::text,
  "stage"                  text                     NOT NULL DEFAULT 'visitor'::text,
  "persona_tag"            text,
  "lead_score"             integer                  DEFAULT 0,
  "first_touch_at"         timestamp with time zone,
  "last_touch_at"          timestamp with time zone,
  "converted_at"           timestamp with time zone,
  "nurture_sequence_step"  integer                  DEFAULT 0,
  "last_nurture_email_at"  timestamp with time zone,
  "next_nurture_email_at"  timestamp with time zone,
  "nurture_emails_sent"    integer                  DEFAULT 0,
  "nurture_emails_opened"  integer                  DEFAULT 0,
  "nurture_emails_clicked" integer                  DEFAULT 0,
  "consent_email"          boolean                  DEFAULT false,
  "consent_whatsapp"       boolean                  DEFAULT false,
  "consent_sms"            boolean                  DEFAULT false,
  "utm_source"             text,
  "utm_medium"             text,
  "utm_campaign"           text,
  "landing_page"           text,
  "referrer"               text,
  "first_name"             text,
  "last_name"              text,
  "phone"                  text,
  "city"                   text,
  "province"               text,
  "notes"                  text,
  "created_at"             timestamp with time zone DEFAULT now(),
  "updated_at"             timestamp with time zone DEFAULT now(),
  CONSTRAINT "psa_leads_email_key" UNIQUE (email),
  CONSTRAINT "psa_leads_persona_tag_check"
    CHECK
    (((persona_tag IS NULL) OR (persona_tag = ANY (ARRAY['biohacker'::text, 'anti_aging_seeker'::text, 'weight_loss_seeker'::text, 'athlete'::text, 'executive'::text,
    'beginner'::text, 'health_conscious'::text, 'medical_professional'::text, 'fitness_enthusiast'::text, 'longevity_pioneer'::text, 'unknown'::text])))),
  CONSTRAINT "psa_leads_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_leads_stage_check"
    CHECK
    ((stage = ANY (ARRAY['subscriber'::text, 'visitor'::text, 'lead'::text, 'qualified_lead'::text, 'prospect'::text, 'trial'::text, 'customer'::text, 'first_time_buyer'::text,
    'repeat_buyer'::text, 'loyal'::text, 'vip'::text, 'champion'::text, 'churned'::text]))),
  CONSTRAINT "psa_leads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE "public"."psa_leads"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_leads_id_seq" OWNED BY "public"."psa_leads"."id";

CREATE INDEX idx_psa_leads_email ON public.psa_leads USING btree (email);

CREATE INDEX idx_psa_leads_next_nurture ON public.psa_leads USING btree (next_nurture_email_at)
  WHERE (next_nurture_email_at IS NOT NULL);

CREATE INDEX idx_psa_leads_persona ON public.psa_leads USING btree (persona_tag);

CREATE INDEX idx_psa_leads_source_site ON public.psa_leads USING btree (source_site);

CREATE INDEX idx_psa_leads_stage ON public.psa_leads USING btree (stage);

CREATE INDEX idx_psa_leads_user_id ON public.psa_leads USING btree (user_id);

CREATE INDEX psa_leads_stage_idx ON public.psa_leads USING btree (stage, created_at DESC);

CREATE TRIGGER psa_leads_updated_at
  BEFORE UPDATE ON public.psa_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.psa_update_timestamp();

CREATE POLICY "Allow anonymous lead capture" ON "public"."psa_leads"
  FOR INSERT
  TO "anon"
  WITH CHECK ((email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text));

CREATE POLICY "Users can view own lead" ON "public"."psa_leads"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_leads" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_leads" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_leads" TO "postgres", "service_role";
