CREATE TABLE "public"."psa_event_registrations" (
  "id"                   integer                  NOT NULL DEFAULT nextval('public.psa_event_registrations_id_seq'::regclass),
  "event_id"             integer,
  "email"                text                     NOT NULL,
  "user_id"              uuid,
  "first_name"           text,
  "last_name"            text,
  "phone"                text,
  "status"               text                     NOT NULL DEFAULT 'registered'::text,
  "payment_status"       text                     DEFAULT 'pending'::text,
  "payment_amount"       numeric(10,2),
  "payment_reference"    text,
  "source_site"          text                     NOT NULL DEFAULT 'capetownpeptideclub.co.za'::text,
  "utm_source"           text,
  "utm_medium"           text,
  "utm_campaign"         text,
  "dietary_requirements" text,
  "notes"                text,
  "checked_in_at"        timestamp with time zone,
  "created_at"           timestamp with time zone DEFAULT now(),
  "updated_at"           timestamp with time zone DEFAULT now(),
  CONSTRAINT "psa_event_registrations_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text, 'waived'::text]))),
  CONSTRAINT "psa_event_registrations_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_event_registrations_status_check" CHECK ((status = ANY (ARRAY['registered'::text, 'confirmed'::text, 'attended'::text, 'no_show'::text, 'cancelled'::text]))),
  CONSTRAINT "psa_event_registrations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "psa_event_registrations_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.psa_events(id) ON DELETE CASCADE
);

ALTER TABLE "public"."psa_event_registrations"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_event_registrations_id_seq" OWNED BY "public"."psa_event_registrations"."id";

CREATE INDEX idx_psa_event_registrations_email ON public.psa_event_registrations USING btree (email);

CREATE INDEX idx_psa_event_registrations_event ON public.psa_event_registrations USING btree (event_id);

CREATE INDEX idx_psa_event_registrations_status ON public.psa_event_registrations USING btree (status);

CREATE TRIGGER psa_event_registrations_updated_at
  BEFORE UPDATE ON public.psa_event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.psa_update_timestamp();

CREATE TRIGGER psa_event_to_lead_sync
  AFTER INSERT ON public.psa_event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.psa_sync_event_to_lead();

CREATE POLICY "Allow anonymous event registration" ON "public"."psa_event_registrations"
  FOR INSERT
  TO "anon"
  WITH CHECK ((email IS NOT NULL));

CREATE POLICY "Users can view own event registrations" ON "public"."psa_event_registrations"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_event_registrations" TO "anon", "authenticated", "postgres", "service_role";
