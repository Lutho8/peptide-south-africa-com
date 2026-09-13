CREATE TABLE "public"."analytics_events" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "event"         text                     NOT NULL,
  "session_id"    text                     NOT NULL,
  "user_id"       uuid,
  "props"         jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "event_version" text                     NOT NULL DEFAULT '1.0'::text,
  "source"        text                     NOT NULL DEFAULT 'storefront'::text,
  "order_id"      uuid,
  CONSTRAINT "analytics_events_event_check"
    CHECK
    ((event = ANY (ARRAY['book_consult_clicked'::text, 'consultation_started'::text, 'consultation_qualified'::text, 'program_selected'::text, 'checkout_started'::text,
    'eft_instructions_shown'::text,
    'bank_deposit_verified'::text,
    'payin_completed'::text,
    'portal_viewed'::text,
    'portal_orders_viewed'::text,
    'portal_tracker_opened'::text,
    'portal_coa_opened'::text,
    'reorder_started'::text,
    'checkout_consent_accepted'::text,
    'marketing_consent_granted'::text,
    'order_created'::text, 'payment_pending'::text, 'payment_confirmed'::text, 'order_packed'::text, 'order_dispatched'::text, 'order_delivered'::text]))),
  CONSTRAINT "analytics_events_event_version_check" CHECK (((length(event_version) >= 1) AND (length(event_version) <= 40))),
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "analytics_events_props_check" CHECK ((octet_length((props)::text) <= 8192)),
  CONSTRAINT "analytics_events_session_id_check" CHECK (((length(session_id) >= 1) AND (length(session_id) <= 200))),
  CONSTRAINT "analytics_events_source_check" CHECK (((length(source) >= 1) AND (length(source) <= 80))),
  CONSTRAINT "analytics_events_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL
);

ALTER TABLE "public"."analytics_events"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX analytics_events_event_created_idx ON public.analytics_events USING btree (EVENT, created_at DESC);

CREATE INDEX analytics_events_order_created_idx ON public.analytics_events USING btree (order_id, created_at)
  WHERE (order_id IS NOT NULL);

CREATE UNIQUE INDEX analytics_events_order_milestone_once_idx ON public.analytics_events USING btree (EVENT, order_id)
  WHERE ((order_id IS
    NOT NULL) AND
    (EVENT = ANY (ARRAY['order_created'::text, 'payment_pending'::text, 'payment_confirmed'::text, 'order_packed'::text, 'order_dispatched'::text, 'order_delivered'::text,
    'checkout_consent_accepted'::text, 'marketing_consent_granted'::text])));

CREATE UNIQUE INDEX analytics_events_settlement_once_idx ON public.analytics_events USING btree (EVENT, ((props ->> 'order_id'::text)))
  WHERE (EVENT = ANY (ARRAY['bank_deposit_verified'::text, 'payin_completed'::text]));

CREATE INDEX analytics_events_user_created_idx ON public.analytics_events USING btree (user_id, created_at DESC)
  WHERE (user_id IS NOT NULL);

CREATE POLICY "analytics_events_admin_select" ON "public"."analytics_events"
  FOR SELECT
  TO "authenticated"
  USING (( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role));

CREATE POLICY "analytics_events_insert_anon" ON "public"."analytics_events"
  FOR INSERT
  TO "anon"
  WITH
    CHECK
    (((event = ANY (ARRAY['book_consult_clicked'::text, 'consultation_started'::text, 'consultation_qualified'::text, 'program_selected'::text, 'checkout_started'::text])) AND
    (user_id IS NULL) AND (order_id IS NULL) AND ((length(session_id) >= 1) AND (length(session_id) <= 200)) AND ((length(event_version) >= 1) AND (length(event_version) <= 40))
    AND ((length(source) >= 1) AND (length(source) <= 80)) AND (octet_length((props)::text) <= 8192)));

CREATE POLICY "analytics_events_insert_authenticated" ON "public"."analytics_events"
  FOR INSERT
  TO "authenticated"
  WITH
    CHECK
    (((event = ANY (ARRAY['book_consult_clicked'::text, 'consultation_started'::text, 'consultation_qualified'::text, 'program_selected'::text, 'checkout_started'::text,
    'eft_instructions_shown'::text,
    'portal_viewed'::text,
    'portal_orders_viewed'::text,
    'portal_tracker_opened'::text,
    'portal_coa_opened'::text, 'reorder_started'::text])) AND ((user_id IS NULL) OR (user_id = ( SELECT auth.uid() AS uid))) AND ((order_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = analytics_events.order_id) AND (orders.user_id = ( SELECT auth.uid() AS uid)))))) AND ((length(session_id) >= 1) AND (length(session_id) <= 200)) AND
    ((length(event_version) >= 1) AND (length(event_version) <= 40)) AND ((length(source) >= 1) AND (length(source) <= 80)) AND (octet_length((props)::text) <= 8192)));

CREATE POLICY "analytics_events_insert" ON "public"."analytics_events"
  FOR INSERT
  TO "anon", "authenticated"
  WITH
    CHECK
    (((event = ANY (ARRAY['book_consult_clicked'::text, 'consultation_started'::text, 'consultation_qualified'::text, 'program_selected'::text, 'checkout_started'::text,
    'eft_instructions_shown'::text])) AND ((user_id IS NULL) OR (user_id = ( SELECT auth.uid() AS uid))) AND ((length(session_id) >= 1) AND (length(session_id) <= 200)) AND
    (octet_length((props)::text) <= 8192)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."analytics_events" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."analytics_events" FROM "anon";

GRANT INSERT ON TABLE "public"."analytics_events" TO "anon";

REVOKE ALL ON TABLE "public"."analytics_events" FROM "authenticated";

GRANT INSERT ON TABLE "public"."analytics_events" TO "authenticated";
