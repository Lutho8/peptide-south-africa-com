CREATE TABLE "public"."psa_tracker_events" (
  "id"               integer                     NOT NULL DEFAULT nextval('public.psa_tracker_events_id_seq'::regclass),
  "tracker_event_id" character varying(100)      NOT NULL,
  "user_email"       character varying(255),
  "user_phone"       character varying(20),
  "customer_id"      integer,
  "event_type"       character varying(100),
  "protocol_id"      character varying(100),
  "protocol_name"    character varying(255),
  "completion_rate"  numeric(5,2),
  "quiz_score"       integer,
  "device"           character varying(50),
  "source"           character varying(100),
  "event_timestamp"  timestamp without time zone,
  "synced_at"        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_tracker_events_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id),
  CONSTRAINT "psa_tracker_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_tracker_events_tracker_event_id_key" UNIQUE (tracker_event_id)
);

ALTER TABLE "public"."psa_tracker_events"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_tracker_events_id_seq" OWNED BY "public"."psa_tracker_events"."id";

CREATE INDEX idx_psa_trk_customer ON public.psa_tracker_events USING btree (customer_id);

CREATE INDEX idx_psa_trk_protocol ON public.psa_tracker_events USING btree (protocol_id);

CREATE INDEX idx_psa_trk_timestamp ON public.psa_tracker_events USING btree (event_timestamp DESC);

CREATE INDEX idx_psa_trk_type ON public.psa_tracker_events USING btree (event_type);

CREATE INDEX idx_psa_trk_user ON public.psa_tracker_events USING btree (user_email);

CREATE POLICY "sr_psa_tracker_events" ON "public"."psa_tracker_events"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_tracker_events" TO "anon", "authenticated", "postgres", "service_role";
