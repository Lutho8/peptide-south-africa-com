// supabase/functions/nocobase-abandoned-cart/index.ts
// Hourly sweep: find cart_snapshots not notified, older than 24h, with items, and push to Nocobase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    // Skip if user has placed an order since cart updated
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", snap.user_id)
      .gte("created_at", snap.updated_at);
    if ((count ?? 0) > 0) continue;

    // Get user email
    const { data: userRes } = await supabase.auth.admin.getUserById(snap.user_id);
    const email = userRes?.user?.email ?? null;

    await supabase.functions.invoke("nocobase-sync", {
      body: {
        action: "cart.abandoned",
        payload: {
          user_id: snap.user_id,
          email,
          items,
          subtotal: snap.subtotal,
          updated_at: snap.updated_at,
        },
      },
    });

    await supabase
      .from("cart_snapshots")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", snap.id);

    pushed++;
  }

  return new Response(JSON.stringify({ ok: true, pushed }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
