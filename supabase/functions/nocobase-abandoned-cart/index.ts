// supabase/functions/nocobase-abandoned-cart/index.ts
// Hourly sweep: find cart_snapshots not yet notified, older than 24h, push to
// Nocobase exactly once per unique cart, with a personalized first-order
// discount if the user is still eligible.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRST_ORDER_CODE = "RIDETHETIDE10";
const FIRST_ORDER_PCT = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Scheduled job: require a pre-shared secret header to block unauthenticated
  // callers from triggering CRM sync / customer notifications at will.
  const expected = Deno.env.get("CRON_SECRET");
  const provided = req.headers.get("x-cron-secret");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: snaps, error } = await supabase
    .from("cart_snapshots")
    .select("*")
    .is("notified_at", null)
    .lt("updated_at", cutoff);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let pushed = 0;
  for (const snap of snaps ?? []) {
    const items = (snap.items as unknown[]) ?? [];
    if (!Array.isArray(items) || items.length === 0) continue;

    // Skip if user has placed an order since the snapshot was last touched.
    const { count: ordersSince } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", snap.user_id)
      .gte("created_at", snap.updated_at);
    if ((ordersSince ?? 0) > 0) {
      // Mark as notified so we never look at this cart again.
      await supabase
        .from("cart_snapshots")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", snap.id);
      continue;
    }

    // Eligibility: 10% off only for users with zero past orders.
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", snap.user_id);
    const eligible = (totalOrders ?? 0) === 0;
    const discountPct = eligible ? FIRST_ORDER_PCT : 0;
    const discountCode = eligible ? FIRST_ORDER_CODE : null;
    const subtotal = Number(snap.subtotal ?? 0);
    const projectedTotal = eligible ? subtotal * (1 - FIRST_ORDER_PCT / 100) : subtotal;

    // Get user email
    const { data: userRes } = await supabase.auth.admin.getUserById(snap.user_id);
    const email = userRes?.user?.email ?? null;

    const tags = ["cart", "abandoned_24h", eligible ? "discount_eligible" : "repeat_customer_recovery"];

    await supabase.functions.invoke("nocobase-sync", {
      body: {
        action: "cart.abandoned",
        payload: {
          user_id: snap.user_id,
          email,
          items,
          subtotal,
          discount_code: discountCode,
          discount_pct: discountPct,
          projected_total: projectedTotal,
          cart_signature: snap.cart_signature ?? null,
          stage: "cart_abandoner",
          tags,
          updated_at: snap.updated_at,
        },
      },
    });

    // Stamp once-per-cart so the same signature never fires twice. The frontend
    // resets notified_at when the cart contents actually change.
    await supabase
      .from("cart_snapshots")
      .update({ notified_at: new Date().toISOString(), discount_pct: discountPct })
      .eq("id", snap.id);

    pushed++;
  }

  return new Response(JSON.stringify({ ok: true, pushed }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
