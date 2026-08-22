-- PostNet fulfilment integrated into the existing first-party Supabase CRM.
-- `orders` remains the checkout source; `psa_orders`, `shipments`, and
-- `fulfilment_events` remain the single operational CRM workflow.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS public_ref text,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS order_items jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.orders
SET public_ref = 'PSA-' || to_char(created_at AT TIME ZONE 'Africa/Johannesburg', 'YYMMDD') || '-' ||
  upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE public_ref IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN public_ref SET DEFAULT (
    'PSA-' || to_char(current_timestamp AT TIME ZONE 'Africa/Johannesburg', 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  ALTER COLUMN public_ref SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_ref ON public.orders (public_ref);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON public.orders (lower(customer_email)) WHERE customer_email IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_shipping_address_object') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_shipping_address_object
      CHECK (jsonb_typeof(shipping_address) = 'object');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_items_array') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_order_items_array
      CHECK (jsonb_typeof(order_items) = 'array');
  END IF;
END $$;

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS web_order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS psa_order_id integer REFERENCES public.psa_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service text NOT NULL DEFAULT 'postnet_to_door',
  ADD COLUMN IF NOT EXISTS postnet_branch_name text,
  ADD COLUMN IF NOT EXISTS packing_profile text NOT NULL DEFAULT 'insulated',
  ADD COLUMN IF NOT EXISTS packing_checklist jsonb NOT NULL DEFAULT jsonb_build_object(
    'items_verified', false, 'batch_verified', false,
    'insulation_added', false, 'cold_pack_added', false,
    'tamper_seal_applied', false, 'insert_added', false, 'final_check', false
  ),
  ADD COLUMN IF NOT EXISTS tamper_seal_number text,
  ADD COLUMN IF NOT EXISTS packing_notes text,
  ADD COLUMN IF NOT EXISTS packed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS picked_at timestamptz,
  ADD COLUMN IF NOT EXISTS packed_at timestamptz,
  ADD COLUMN IF NOT EXISTS dispatched_at timestamptz,
  ADD COLUMN IF NOT EXISTS ready_for_collection_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_web_order_id
  ON public.shipments (web_order_id) WHERE web_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_psa_order_id
  ON public.shipments (psa_order_id) WHERE psa_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_postnet_queue ON public.shipments (status, created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number
  ON public.shipments (tracking_number) WHERE tracking_number IS NOT NULL;

ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_status_check;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_status_check CHECK (
  status IN ('pending_pick', 'picking', 'packed', 'dispatched', 'in_transit',
    'out_for_delivery', 'ready_for_collection', 'delivered', 'exception',
    'returned', 'cancelled')
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_service_check') THEN
    ALTER TABLE public.shipments ADD CONSTRAINT shipments_service_check CHECK (
      service IN ('postnet_to_door', 'postnet_to_postnet', 'cape_town_local', 'paxi_accessories')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_packing_profile_check') THEN
    ALTER TABLE public.shipments ADD CONSTRAINT shipments_packing_profile_check CHECK (
      packing_profile IN ('insulated', 'ambient_accessories')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_packing_checklist_object') THEN
    ALTER TABLE public.shipments ADD CONSTRAINT shipments_packing_checklist_object CHECK (
      jsonb_typeof(packing_checklist) = 'object'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.shipment_batch_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  variant_label text,
  lot_number text NOT NULL,
  expires_at date,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  product_batch_id uuid REFERENCES public.product_batches(id) ON DELETE SET NULL,
  allocated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (shipment_id, product_slug, variant_label, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_shipment_batch_allocations_shipment
  ON public.shipment_batch_allocations (shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_batch_allocations_product_batch
  ON public.shipment_batch_allocations (product_batch_id) WHERE product_batch_id IS NOT NULL;

ALTER TABLE public.shipment_batch_allocations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipment_batch_allocations TO authenticated;
GRANT ALL ON public.shipment_batch_allocations TO service_role;
DROP POLICY IF EXISTS admins_manage_shipment_batch_allocations ON public.shipment_batch_allocations;
CREATE POLICY admins_manage_shipment_batch_allocations
  ON public.shipment_batch_allocations FOR ALL TO authenticated
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT public.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE OR REPLACE FUNCTION public.sync_paid_web_order_to_crm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  crm_order_id integer;
  crm_shipment_id uuid;
  requested_service text;
  only_accessories boolean;
BEGIN
  IF NEW.status <> 'paid' THEN RETURN NEW; END IF;

  requested_service := CASE NEW.shipping_method
    WHEN 'postnet_to_postnet' THEN 'postnet_to_postnet'
    WHEN 'cape_town_local' THEN 'cape_town_local'
    WHEN 'paxi_accessories' THEN 'paxi_accessories'
    ELSE 'postnet_to_door'
  END;
  only_accessories := jsonb_array_length(NEW.order_items) > 0 AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(NEW.order_items) item
    WHERE COALESCE((item ->> 'is_accessory')::boolean, false) = false
  );

  INSERT INTO public.psa_orders (
    order_id, customer_email, customer_phone, order_total, order_shipping,
    order_status, payment_status, payment_method, payment_reference,
    payment_settled_at, line_items, shipping_address, source, user_id,
    unified_order_id, fulfillment_status, customer_type
  ) VALUES (
    NEW.public_ref, NEW.customer_email, NEW.customer_phone, NEW.total, NEW.shipping_cost,
    'processing', 'paid', NEW.payment_provider, NEW.payfast_pf_payment_id,
    NEW.paid_at AT TIME ZONE 'Africa/Johannesburg', NEW.order_items, NEW.shipping_address,
    'peptide-south-africa.com', NEW.user_id, NEW.id, 'unfulfilled', 'b2c'
  )
  ON CONFLICT (order_id) DO UPDATE SET
    customer_email = EXCLUDED.customer_email, customer_phone = EXCLUDED.customer_phone,
    order_total = EXCLUDED.order_total, order_shipping = EXCLUDED.order_shipping,
    order_status = EXCLUDED.order_status, payment_status = EXCLUDED.payment_status,
    payment_method = EXCLUDED.payment_method, payment_reference = EXCLUDED.payment_reference,
    payment_settled_at = EXCLUDED.payment_settled_at, line_items = EXCLUDED.line_items,
    shipping_address = EXCLUDED.shipping_address, user_id = EXCLUDED.user_id,
    unified_order_id = EXCLUDED.unified_order_id, updated_at = now()
  RETURNING id INTO crm_order_id;

  INSERT INTO public.shipments (
    order_ref, channel, courier, status, cold_chain, address_city,
    address_province, web_order_id, psa_order_id, service,
    postnet_branch_name, packing_profile
  ) VALUES (
    NEW.public_ref, 'b2c', CASE WHEN requested_service = 'paxi_accessories' THEN 'PAXI' ELSE 'PostNet' END,
    'pending_pick', NOT only_accessories, NEW.shipping_address ->> 'city',
    NEW.shipping_address ->> 'province', NEW.id, crm_order_id, requested_service,
    NULLIF(NEW.shipping_address ->> 'postnet_branch', ''),
    CASE WHEN only_accessories THEN 'ambient_accessories' ELSE 'insulated' END
  )
  ON CONFLICT (web_order_id) WHERE web_order_id IS NOT NULL DO UPDATE SET
    order_ref = EXCLUDED.order_ref, psa_order_id = EXCLUDED.psa_order_id,
    address_city = EXCLUDED.address_city, address_province = EXCLUDED.address_province,
    service = EXCLUDED.service, postnet_branch_name = EXCLUDED.postnet_branch_name,
    packing_profile = EXCLUDED.packing_profile, updated_at = now()
  RETURNING id INTO crm_shipment_id;

  INSERT INTO public.fulfilment_events (shipment_id, event, note, logged_by)
  SELECT crm_shipment_id, 'payment_confirmed', 'Paid website order synced into CRM and packing queue', 'system'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.fulfilment_events
    WHERE shipment_id = crm_shipment_id AND event = 'payment_confirmed'
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_paid_web_order_to_crm() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_paid_web_order_to_crm() FROM anon, authenticated;
DROP TRIGGER IF EXISTS trg_sync_paid_web_order_to_crm ON public.orders;
CREATE TRIGGER trg_sync_paid_web_order_to_crm
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_paid_web_order_to_crm();

CREATE OR REPLACE FUNCTION public.touch_postnet_shipment()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'picking' AND OLD.status IS DISTINCT FROM 'picking' THEN
    NEW.picked_at := COALESCE(NEW.picked_at, now());
  ELSIF NEW.status = 'packed' AND OLD.status IS DISTINCT FROM 'packed' THEN
    NEW.packed_at := COALESCE(NEW.packed_at, now());
  ELSIF NEW.status = 'dispatched' AND OLD.status IS DISTINCT FROM 'dispatched' THEN
    NEW.dispatched_at := COALESCE(NEW.dispatched_at, now());
    NEW.ship_date := COALESCE(NEW.ship_date, current_date);
  ELSIF NEW.status = 'ready_for_collection' AND OLD.status IS DISTINCT FROM 'ready_for_collection' THEN
    NEW.ready_for_collection_at := COALESCE(NEW.ready_for_collection_at, now());
  ELSIF NEW.status = 'delivered' AND OLD.status IS DISTINCT FROM 'delivered' THEN
    NEW.delivered_at := COALESCE(NEW.delivered_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_postnet_shipment ON public.shipments;
CREATE TRIGGER trg_touch_postnet_shipment
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.touch_postnet_shipment();

CREATE OR REPLACE FUNCTION public.sync_shipment_to_crm_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.psa_order_id IS NOT NULL THEN
    UPDATE public.psa_orders SET
      fulfillment_status = NEW.status, courier = NEW.courier,
      tracking_number = NEW.tracking_number, packed_at = NEW.packed_at,
      shipped_at = NEW.dispatched_at, delivered_at = NEW.delivered_at,
      order_status = CASE
        WHEN NEW.status = 'delivered' THEN 'completed'
        WHEN NEW.status IN ('cancelled', 'returned') THEN NEW.status
        ELSE 'processing'
      END,
      updated_at = now()
    WHERE id = NEW.psa_order_id;
  END IF;
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.fulfilment_events (shipment_id, event, note, logged_by)
    VALUES (NEW.id, NEW.status, NEW.packing_notes, COALESCE((SELECT auth.uid())::text, 'system'));
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_shipment_to_crm_order() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_shipment_to_crm_order() FROM anon, authenticated;
DROP TRIGGER IF EXISTS trg_sync_shipment_to_crm_order ON public.shipments;
CREATE TRIGGER trg_sync_shipment_to_crm_order
  AFTER UPDATE OF status, tracking_number, courier ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.sync_shipment_to_crm_order();

-- Existing paid orders are intentionally not rewritten automatically. A staff
-- member can re-save a specific paid order if it needs to enter the new queue.
