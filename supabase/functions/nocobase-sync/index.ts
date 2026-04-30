// supabase/functions/nocobase-sync/index.ts
// Pushes lead/order/quiz/cart events to a Nocobase CRM collection.
// Gracefully no-ops when secrets are not configured yet.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COLLECTION_BY_ACTION: Record<string, string> = {
  "lead.upsert": "leads",
  "order.created": "orders",
  "quiz.completed": "quiz_responses",
  "cart.abandoned": "cart_events",
};

async function logEvent(supabaseUrl: string, serviceKey: string, row: Record<string, unknown>) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/integration_logs`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.error("integration_logs insert failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const NOCOBASE_BASE_URL = Deno.env.get("NOCOBASE_BASE_URL");
  const NOCOBASE_API_TOKEN = Deno.env.get("NOCOBASE_API_TOKEN");

  let body: { action?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const action = body.action ?? "";
  const collection = COLLECTION_BY_ACTION[action];
  if (!collection) {
    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload = body.payload ?? {};

  // Stamp lifecycle stage if not provided
  if (!("stage" in payload)) {
    if (action === "order.created") payload.stage = "first_purchase";
    else if (action === "quiz.completed") payload.stage = "quiz_completed";
    else if (action === "cart.abandoned") payload.stage = "cart_abandoner";
    else payload.stage = "subscriber";
  }

  // No Nocobase yet? log and return success so app flows are not blocked.
  if (!NOCOBASE_BASE_URL || !NOCOBASE_API_TOKEN) {
    await logEvent(SUPABASE_URL, SERVICE_KEY, {
      integration: "nocobase",
      action,
      status: "skipped_not_configured",
      payload,
    });
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = `${NOCOBASE_BASE_URL.replace(/\/$/, "")}/api/${collection}:create`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOCOBASE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: payload }),
    });
    const text = await res.text();
    if (!res.ok) {
      await logEvent(SUPABASE_URL, SERVICE_KEY, {
        integration: "nocobase",
        action,
        status: "error",
        payload,
        error: `HTTP ${res.status}: ${text.slice(0, 500)}`,
      });
      return new Response(JSON.stringify({ ok: false, error: `Nocobase ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await logEvent(SUPABASE_URL, SERVICE_KEY, {
      integration: "nocobase",
      action,
      status: "ok",
      payload,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await logEvent(SUPABASE_URL, SERVICE_KEY, {
      integration: "nocobase",
      action,
      status: "exception",
      payload,
      error: message,
    });
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
