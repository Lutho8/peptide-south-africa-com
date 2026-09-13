CREATE TABLE "tracker"."commerce_events" (
  "id"               bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "event_name"       text                     NOT NULL,
  "placement"        text                     NOT NULL,
  "destination_host" text                     NOT NULL,
  "destination_path" text                     NOT NULL,
  "user_id"          uuid,
  "lead_id"          uuid,
  "session_id"       text,
  "page_url"         text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "commerce_events_destination_host_check" CHECK (((char_length(destination_host) >= 1) AND (char_length(destination_host) <= 255))),
  CONSTRAINT "commerce_events_destination_path_check" CHECK (((char_length(destination_path) >= 1) AND (char_length(destination_path) <= 500))),
  CONSTRAINT "commerce_events_event_name_check" CHECK ((event_name = 'buy_peptides_cta_clicked'::text)),
  CONSTRAINT "commerce_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "commerce_events_placement_check" CHECK (((char_length(placement) >= 1) AND (char_length(placement) <= 80))),
  CONSTRAINT "commerce_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "commerce_events_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES tracker.crm_leads(id) ON DELETE SET NULL
);

ALTER TABLE "tracker"."commerce_events"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX commerce_events_created_idx ON tracker.commerce_events USING btree (created_at DESC);

CREATE INDEX commerce_events_lead_created_idx ON tracker.commerce_events USING btree (lead_id, created_at DESC)
  WHERE (lead_id IS NOT NULL);

CREATE INDEX commerce_events_placement_created_idx ON tracker.commerce_events USING btree (placement, created_at DESC);

CREATE INDEX commerce_events_session_created_idx ON tracker.commerce_events USING btree (session_id, created_at DESC)
  WHERE (session_id IS NOT NULL);

CREATE INDEX commerce_events_user_created_idx ON tracker.commerce_events USING btree (user_id, created_at DESC)
  WHERE (user_id IS NOT NULL);

CREATE POLICY "commerce_events_admin_select" ON "tracker"."commerce_events"
  FOR SELECT
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

GRANT SELECT ON TABLE "tracker"."commerce_events" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."commerce_events" TO "postgres", "service_role";
