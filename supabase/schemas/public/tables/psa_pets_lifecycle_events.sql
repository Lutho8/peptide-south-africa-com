CREATE TABLE "public"."psa_pets_lifecycle_events" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "event"         text                     NOT NULL,
  "event_version" text                     NOT NULL DEFAULT '1.0'::text,
  "source"        text                     NOT NULL DEFAULT 'pets_storefront'::text,
  "session_id"    text                     NOT NULL,
  "user_id"       uuid,
  "order_id"      uuid,
  "props"         jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "psa_pets_lifecycle_events_event_check"
    CHECK
    ((event = ANY (ARRAY['pets_catalog_viewed'::text, 'pets_research_navigator_started'::text, 'pets_research_navigator_completed'::text, 'pets_evidence_opened'::text,
    'pets_waitlist_started'::text,
    'pets_waitlist_joined'::text,
    'pets_collagen_added'::text,
    'pets_checkout_started'::text,
    'pets_checkout_consent_accepted'::text,
    'pets_marketing_consent_granted'::text,
    'pets_order_created'::text,
    'pets_eft_instructions_shown'::text, 'pets_portal_viewed'::text, 'pets_portal_orders_viewed'::text, 'pets_portal_reports_viewed'::text, 'pets_reorder_started'::text]))),
  CONSTRAINT "psa_pets_lifecycle_events_event_version_check" CHECK (((char_length(event_version) >= 1) AND (char_length(event_version) <= 40))),
  CONSTRAINT "psa_pets_lifecycle_events_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL,
  CONSTRAINT "psa_pets_lifecycle_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_pets_lifecycle_events_props_check" CHECK (((jsonb_typeof(props) = 'object'::text) AND (octet_length((props)::text) <= 8192))),
  CONSTRAINT "psa_pets_lifecycle_events_session_id_check" CHECK (((char_length(session_id) >= 1) AND (char_length(session_id) <= 200))),
  CONSTRAINT "psa_pets_lifecycle_events_source_check" CHECK (((char_length(source) >= 1) AND (char_length(source) <= 80))),
  CONSTRAINT "psa_pets_lifecycle_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE "public"."psa_pets_lifecycle_events"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX psa_pets_lifecycle_events_created_idx ON public.psa_pets_lifecycle_events USING btree (created_at DESC);

CREATE INDEX psa_pets_lifecycle_events_event_created_idx ON public.psa_pets_lifecycle_events USING btree (EVENT, created_at DESC);

CREATE INDEX psa_pets_lifecycle_events_order_idx ON public.psa_pets_lifecycle_events USING btree (order_id)
  WHERE (order_id IS NOT NULL);

CREATE INDEX psa_pets_lifecycle_events_user_created_idx ON public.psa_pets_lifecycle_events USING btree (user_id, created_at DESC)
  WHERE (user_id IS NOT NULL);

CREATE POLICY "psa_pets_lifecycle_events_anon_insert" ON "public"."psa_pets_lifecycle_events"
  FOR INSERT
  TO "anon"
  WITH
    CHECK
    (((event = ANY (ARRAY['pets_catalog_viewed'::text, 'pets_research_navigator_started'::text, 'pets_research_navigator_completed'::text, 'pets_evidence_opened'::text,
    'pets_waitlist_started'::text, 'pets_waitlist_joined'::text, 'pets_collagen_added'::text, 'pets_checkout_started'::text])) AND (user_id IS NULL) AND (order_id IS NULL)));

CREATE POLICY "psa_pets_lifecycle_events_authenticated_insert" ON "public"."psa_pets_lifecycle_events"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((((user_id IS NULL) OR (user_id = ( SELECT auth.uid() AS uid))) AND ((order_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = psa_pets_lifecycle_events.order_id) AND (orders.user_id = ( SELECT auth.uid() AS uid))))))));

CREATE POLICY "psa_pets_lifecycle_events_owner_or_admin_select" ON "public"."psa_pets_lifecycle_events"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_pets_lifecycle_events" TO "postgres", "service_role";

COMMENT ON TABLE "public"."psa_pets_lifecycle_events" IS 'First-party, Pets-only research-commerce lifecycle events.';

REVOKE ALL ON TABLE "public"."psa_pets_lifecycle_events" FROM "anon";

GRANT INSERT ON TABLE "public"."psa_pets_lifecycle_events" TO "anon";

REVOKE ALL ON TABLE "public"."psa_pets_lifecycle_events" FROM "authenticated";

GRANT INSERT, SELECT ON TABLE "public"."psa_pets_lifecycle_events" TO "authenticated";
