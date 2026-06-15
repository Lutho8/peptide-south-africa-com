// supabase/functions/nocobase-sync/index.ts
// Pushes lead/order/quiz/cart events to a Nocobase CRM collection.
// Gracefully no-ops when secrets are not configured yet.
//
// Authorization model:
//   - Requires a valid Supabase JWT (verify_jwt = true in config).
//   - `order.created` and `cart.abandoned` are server-only events. They are
//     only accepted from callers that are an admin OR present the shared
//     NOCOBASE_INTERNAL_SECRET header. This prevents authenticated end-users
//     from pushing fake orders/abandoned-cart events for other customers.
//   - For `lead.upsert` and `quiz.completed`, the caller's identity from the
//     JWT is force-stamped onto the payload (user_id + email) so an
//     authenticated user can only ever push their own lead/quiz data.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const COLLECTION_BY_ACTION: Record<string, string> = {
  "lead.upsert": "leads",
  "order.created": "orders",
  "quiz.completed": "quiz_responses",
  "cart.abandoned": "cart_events",
};

const SERVER_ONLY_ACTIONS = new Set(["order.created", "cart.abandoned"]);

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const NOCOBASE_BASE_URL = Deno.env.get("NOCOBASE_BASE_URL");
  const NOCOBASE_API_TOKEN = Deno.env.get("NOCOBASE_API_TOKEN");
  const INTERNAL_SECRET = Deno.env.get("NOCOBASE_INTERNAL_SECRET");

  // Identify caller from JWT.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.replace("Bearer ", "");
  const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
  if (claimsErr || !claims?.claims) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  const callerId = claims.claims.sub as string;
  const callerEmail = (claims.claims.email as string | undefined) ?? null;

  // Check admin role (used to allow privileged server-only actions).
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: isAdminRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();
  const isAdmin = !!isAdminRow;

  const presentedSecret = req.headers.get("x-internal-secret") ?? "";
  const hasInternalSecret = !!INTERNAL_SECRET && presentedSecret === INTERNAL_SECRET;
  const isPrivileged = isAdmin || hasInternalSecret;

  let body: { action?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const action = body.action ?? "";
  const collection = COLLECTION_BY_ACTION[action];
  if (!collection) {
    return jsonResponse({ error: "Unknown action" }, 400);
  }

  // Server-only events: only admins or callers with the internal secret may
  // push order/cart events. End-users cannot inject fake CRM records.
  if (SERVER_ONLY_ACTIONS.has(action) && !isPrivileged) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const payload: Record<string, unknown> = { ...(body.payload ?? {}) };

  // For non-privileged callers, force the payload identity to the caller's
  // own JWT identity. This stops an authenticated user from submitting a
  // lead/quiz record under someone else's email or user_id.
  if (!isPrivileged) {
    payload.user_id = callerId;
    if (callerEmail) {
      payload.email = callerEmail;
    } else {
      // No email claim on the JWT — keep caller-supplied email but strip any
      // user_id spoofing attempt above.
    }
  }

  // Stamp lifecycle stage only when caller didn't provide one (don't override).
  if (!("stage" in payload) || !payload.stage) {
    if (action === "order.created") payload.stage = "customer";
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
    return jsonResponse({ ok: true, skipped: true });
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
      return jsonResponse({ ok: false, error: `Nocobase ${res.status}` }, 502);
    }
    await logEvent(SUPABASE_URL, SERVICE_KEY, {
      integration: "nocobase",
      action,
      status: "ok",
      payload,
    });
    return jsonResponse({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("nocobase-sync error:", message);
    await logEvent(SUPABASE_URL, SERVICE_KEY, {
      integration: "nocobase",
      action,
      status: "exception",
      payload,
      error: message,
    });
    return jsonResponse({ ok: false, error: "Internal server error" }, 500);
  }
});
