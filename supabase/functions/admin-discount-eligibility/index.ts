// supabase/functions/admin-discount-eligibility/index.ts
// Admin-only: looks up a user by email, returns PEPTIDESA10 eligibility breakdown.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const callerId = claims.claims.sub as string;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Verify caller is admin
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { email?: string };
  try { body = await req.json(); } catch { body = {}; }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return new Response(JSON.stringify({ error: "email required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Find user (paginate through users — Supabase admin has no getByEmail)
  let foundUser: { id: string; email: string | null; created_at: string } | null = null;
  let page = 1;
  const perPage = 200;
  for (let i = 0; i < 25 && !foundUser; i++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    foundUser = data.users.find((u) => (u.email ?? "").toLowerCase() === email) ?? null;
    if (data.users.length < perPage) break;
    page++;
  }

  if (!foundUser) {
    return new Response(JSON.stringify({
      found: false,
      eligible: false,
      reasons: ["No account exists with that email — discount only applies to signed-in users."],
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { count: orderCount, data: recent } = await admin
    .from("orders")
    .select("id, total, discount_code, created_at", { count: "exact" })
    .eq("user_id", foundUser.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const noPriorOrders = (orderCount ?? 0) === 0;
  const eligible = noPriorOrders;

  const reasons: string[] = [];
  reasons.push(`✅ Account found (created ${new Date(foundUser.created_at).toLocaleDateString()})`);
  reasons.push("✅ Discount auto-applies whenever this user is signed in");
  if (noPriorOrders) {
    reasons.push("✅ No prior orders — first-order discount is available");
  } else {
    reasons.push(`❌ Already has ${orderCount} order(s) — first-order discount is exhausted`);
  }

  return new Response(JSON.stringify({
    found: true,
    user: { id: foundUser.id, email: foundUser.email, created_at: foundUser.created_at },
    order_count: orderCount ?? 0,
    eligible,
    code: "PEPTIDESA10",
    reasons,
    recent_orders: recent ?? [],
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
