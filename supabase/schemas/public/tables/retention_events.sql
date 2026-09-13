CREATE TABLE "public"."retention_events" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "event"       text                     NOT NULL,
  "meta"        jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "occurred_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "retention_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "retention_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."retention_events"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_retention_events_event ON public.retention_events USING btree (EVENT, occurred_at DESC);

CREATE INDEX idx_retention_events_user_time ON public.retention_events USING btree (user_id, occurred_at DESC);

CREATE POLICY "Users view own events" ON "public"."retention_events"
  FOR SELECT
  TO "authenticated"
  USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."retention_events" TO "anon", "authenticated", "postgres", "service_role";
