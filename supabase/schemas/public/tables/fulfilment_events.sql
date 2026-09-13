CREATE TABLE "public"."fulfilment_events" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "shipment_id" uuid                     NOT NULL,
  "event"       text                     NOT NULL,
  "note"        text,
  "logged_by"   text                     NOT NULL DEFAULT 'agent'::text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "fulfilment_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "fulfilment_events_shipment_id_fkey" FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE
);

ALTER TABLE "public"."fulfilment_events"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_fulf_events_ship ON public.fulfilment_events USING btree (shipment_id, created_at DESC);

CREATE POLICY "fulfilment_events_owner_or_admin_select" ON "public"."fulfilment_events"
  FOR SELECT
  TO "authenticated"
  USING ((public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) OR (EXISTS ( SELECT 1
   FROM (public.shipments
     JOIN public.orders ON ((orders.id = shipments.web_order_id)))
  WHERE ((shipments.id = fulfilment_events.shipment_id) AND (orders.user_id = ( SELECT auth.uid() AS uid)))))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fulfilment_events" TO "postgres", "service_role";

REVOKE ALL ("created_at") ON TABLE "public"."fulfilment_events" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."fulfilment_events" TO "authenticated";

REVOKE ALL ("event") ON TABLE "public"."fulfilment_events" FROM "authenticated";

GRANT SELECT ("event") ON TABLE "public"."fulfilment_events" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."fulfilment_events" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."fulfilment_events" TO "authenticated";

REVOKE ALL ("shipment_id") ON TABLE "public"."fulfilment_events" FROM "authenticated";

GRANT SELECT ("shipment_id") ON TABLE "public"."fulfilment_events" TO "authenticated";
