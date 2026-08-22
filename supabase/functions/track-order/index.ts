import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Not found" }, 404);

  const body = await request.json().catch(() => ({}));
  const orderRef = String(body?.orderRef ?? "").trim().toUpperCase();
  if (!/^PSA-\d{6}-[A-F0-9]{8}$/.test(orderRef)) {
    return json({ error: "Order not found" }, 404);
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false, autoRefreshToken: false } },
  );

  const token = authHeader.slice("Bearer ".length);
  const { data: claims, error: claimsError } = await client.auth.getClaims(token);
  const userId = claims?.claims?.sub as string | undefined;
  if (claimsError || !userId) return json({ error: "Sign in required" }, 401);

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("id, public_ref, status, created_at, paid_at, shipping_method")
    .eq("public_ref", orderRef)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderError) {
    console.error("track-order lookup failed", orderError.message);
    return json({ error: "Tracking is temporarily unavailable" }, 503);
  }
  if (!order) return json({ error: "Order not found" }, 404);

  const { data: shipment } = await client
    .from("shipments")
    .select("id, status, courier, service, postnet_branch_name, tracking_number, picked_at, packed_at, dispatched_at, ready_for_collection_at, delivered_at")
    .eq("web_order_id", order.id)
    .maybeSingle();

  const { data: events } = shipment
    ? await client
      .from("fulfilment_events")
      .select("event, created_at")
      .eq("shipment_id", shipment.id)
      .order("created_at", { ascending: true })
    : { data: [] };

  return json({
    order: {
      reference: order.public_ref,
      paymentStatus: order.status,
      placedAt: order.created_at,
      paidAt: order.paid_at,
      deliveryMethod: order.shipping_method,
    },
    shipment: shipment ? {
      status: shipment.status,
      courier: shipment.courier,
      service: shipment.service,
      branch: shipment.postnet_branch_name,
      trackingNumber: shipment.tracking_number,
      pickedAt: shipment.picked_at,
      packedAt: shipment.packed_at,
      dispatchedAt: shipment.dispatched_at,
      readyForCollectionAt: shipment.ready_for_collection_at,
      deliveredAt: shipment.delivered_at,
      events: (events ?? []).map((event) => ({ status: event.event, at: event.created_at })),
    } : null,
  });
});
