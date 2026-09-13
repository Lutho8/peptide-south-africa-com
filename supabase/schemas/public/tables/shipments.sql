CREATE TABLE "public"."shipments" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "order_ref"               text                     NOT NULL,
  "customer_id"             integer,
  "b2b_account_id"          uuid,
  "channel"                 text                     NOT NULL DEFAULT 'b2c'::text,
  "courier"                 text,
  "tracking_number"         text,
  "status"                  text                     NOT NULL DEFAULT 'pending_pick'::text,
  "cold_chain"              boolean                  NOT NULL DEFAULT true,
  "ship_date"               date,
  "promised_date"           date,
  "delivered_at"            timestamp with time zone,
  "courier_cost"            numeric(10,2),
  "packaging_cost"          numeric(10,2),
  "weight_kg"               numeric(6,2),
  "address_city"            text,
  "address_province"        text,
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "web_order_id"            uuid,
  "psa_order_id"            integer,
  "service"                 text                     NOT NULL DEFAULT 'postnet_to_door'::text,
  "postnet_branch_name"     text,
  "packing_profile"         text                     NOT NULL DEFAULT 'insulated'::text,
  "packing_checklist"       jsonb
    NOT NULL DEFAULT
    jsonb_build_object('items_verified', false, 'batch_verified', false, 'insulation_added', false, 'cold_pack_added', false, 'tamper_seal_applied', false, 'insert_added', false,
    'final_check', false),
  "tamper_seal_number"      text,
  "packing_notes"           text,
  "packed_by"               uuid,
  "picked_at"               timestamp with time zone,
  "packed_at"               timestamp with time zone,
  "dispatched_at"           timestamp with time zone,
  "ready_for_collection_at" timestamp with time zone,
  CONSTRAINT "shipments_b2b_account_id_fkey" FOREIGN KEY (b2b_account_id) REFERENCES public.b2b_accounts(id) ON DELETE SET NULL,
  CONSTRAINT "shipments_channel_check" CHECK ((channel = ANY (ARRAY['b2c'::text, 'b2b'::text, 'd2c'::text]))),
  CONSTRAINT "shipments_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.psa_customers(id) ON DELETE SET NULL,
  CONSTRAINT "shipments_packed_by_fkey" FOREIGN KEY (packed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "shipments_packing_checklist_object" CHECK ((jsonb_typeof(packing_checklist) = 'object'::text)),
  CONSTRAINT "shipments_packing_profile_check" CHECK ((packing_profile = ANY (ARRAY['insulated'::text, 'ambient_accessories'::text]))),
  CONSTRAINT "shipments_pkey" PRIMARY KEY (id),
  CONSTRAINT "shipments_psa_order_id_fkey" FOREIGN KEY (psa_order_id) REFERENCES public.psa_orders(id) ON DELETE SET NULL,
  CONSTRAINT "shipments_service_check" CHECK ((service = ANY (ARRAY['postnet_to_door'::text, 'postnet_to_postnet'::text, 'cape_town_local'::text, 'paxi_accessories'::text]))),
  CONSTRAINT "shipments_status_check"
    CHECK
    ((status = ANY (ARRAY['pending_pick'::text, 'picking'::text, 'packed'::text, 'dispatched'::text, 'in_transit'::text, 'out_for_delivery'::text, 'ready_for_collection'::text,
    'delivered'::text, 'exception'::text, 'returned'::text, 'cancelled'::text]))),
  CONSTRAINT "shipments_web_order_id_fkey" FOREIGN KEY (web_order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

ALTER TABLE "public"."shipments"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shipments_order ON public.shipments USING btree (order_ref);

CREATE INDEX idx_shipments_postnet_queue ON public.shipments USING btree (status, created_at);

CREATE INDEX idx_shipments_psa_order_id ON public.shipments USING btree (psa_order_id)
  WHERE (psa_order_id IS NOT NULL);

CREATE INDEX idx_shipments_status ON public.shipments USING btree (status)
  WHERE (status <> ALL (ARRAY['delivered'::text, 'returned'::text]));

CREATE INDEX idx_shipments_tracking_number ON public.shipments USING btree (tracking_number)
  WHERE (tracking_number IS NOT NULL);

CREATE UNIQUE INDEX idx_shipments_web_order_id ON public.shipments USING btree (web_order_id)
  WHERE (web_order_id IS NOT NULL);

CREATE TRIGGER shipments_pack_ready_gate
  BEFORE INSERT OR UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.assert_shipment_pack_ready();

CREATE TRIGGER t_shipments_upd
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_ops();

CREATE TRIGGER trg_sync_shipment_to_crm_order
  AFTER UPDATE OF status, tracking_number, courier ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_shipment_to_crm_order();

CREATE TRIGGER trg_touch_postnet_shipment
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_postnet_shipment();

CREATE POLICY "shipments_owner_or_admin_select" ON "public"."shipments"
  FOR SELECT
  TO "authenticated"
  USING ((public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) OR (EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = shipments.web_order_id) AND (orders.user_id = ( SELECT auth.uid() AS uid)))))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."shipments" TO "postgres", "service_role";

REVOKE ALL ("courier") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("courier") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("created_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("created_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("delivered_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("delivered_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("dispatched_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("dispatched_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("order_ref") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("order_ref") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("packed_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("packed_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("picked_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("picked_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("postnet_branch_name") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("postnet_branch_name") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("promised_date") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("promised_date") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("ready_for_collection_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("ready_for_collection_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("service") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("service") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("status") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("status") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("tracking_number") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("tracking_number") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("updated_at") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("updated_at") ON TABLE "public"."shipments" TO "authenticated";

REVOKE ALL ("web_order_id") ON TABLE "public"."shipments" FROM "authenticated";

GRANT SELECT ("web_order_id") ON TABLE "public"."shipments" TO "authenticated";
