CREATE TABLE "public"."psa_events" (
  "id"                      integer                     NOT NULL DEFAULT nextval('public.psa_events_id_seq'::regclass),
  "event_id"                character varying(100)      NOT NULL,
  "event_name"              character varying(255),
  "event_type"              character varying(50),
  "city"                    character varying(100),
  "venue"                   character varying(255),
  "event_date"              timestamp without time zone,
  "start_time"              timestamp without time zone,
  "end_time"                timestamp without time zone,
  "max_attendees"           integer,
  "registered_count"        integer                     DEFAULT 0,
  "attended_count"          integer                     DEFAULT 0,
  "gp_present"              boolean                     DEFAULT false,
  "gp_name"                 character varying(100),
  "cost_per_attendee"       numeric(10,2),
  "total_cost"              numeric(10,2),
  "revenue_generated"       numeric(10,2)               DEFAULT 0.00,
  "status"                  character varying(50),
  "registration_url"        character varying(500),
  "whatsapp_group_link"     character varying(500),
  "follow_up_email_sent"    boolean                     DEFAULT false,
  "follow_up_whatsapp_sent" boolean                     DEFAULT false,
  "post_event_survey_sent"  boolean                     DEFAULT false,
  "notes"                   text,
  "created_at"              timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"              timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_events_event_id_key" UNIQUE (event_id),
  CONSTRAINT "psa_events_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_events"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_events_id_seq" OWNED BY "public"."psa_events"."id";

CREATE INDEX idx_psa_events_city ON public.psa_events USING btree (city);

CREATE INDEX idx_psa_events_date ON public.psa_events USING btree (event_date DESC);

CREATE INDEX idx_psa_events_status ON public.psa_events USING btree (status);

CREATE INDEX idx_psa_events_type ON public.psa_events USING btree (event_type);

CREATE POLICY "Public read events" ON "public"."psa_events"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_events" TO "anon", "authenticated", "postgres", "service_role";
