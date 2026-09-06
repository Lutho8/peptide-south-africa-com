import { sendMetaCapiEvent } from "./_shared/metaCapi";
import { isRateLimited } from "./_shared/rateLimit";

export const config = { runtime: "edge" };

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

// Only these browser-observed events may cross this public, unauthenticated
// relay. Purchase is intentionally excluded: it is confirmed revenue, and the
// only code path allowed to emit it is the EFT payment-confirmation step
// (supabase/functions/eft-reconcile), which calls Meta directly and is not
// reachable from the public internet without the reconciliation secret.
const ALLOWED_EVENT_NAMES = new Set(["Lead", "InitiateCheckout"]);

const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isSameOriginRequest(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const candidate = request.headers.get("origin") ?? request.headers.get("referer");
  if (!candidate) return false;

  try {
    const candidateHost = new URL(candidate).host;
    return (
      candidateHost === host ||
      candidateHost === "peptide-south-africa.com" ||
      candidateHost === "www.peptide-south-africa.com"
    );
  } catch {
    return false;
  }
}

/**
 * Client-fired relay for Conversions API coverage of browser-only events
 * (Lead, InitiateCheckout). Purchase is sent authoritatively from the EFT
 * reconciliation step instead, once a bank deposit is actually confirmed —
 * never from this public endpoint.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!isSameOriginRequest(request)) {
    return json({ error: "Invalid origin" }, 403);
  }

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(clientIp, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
    return json({ error: "Too many requests" }, 429);
  }

  const body = await request.json().catch(() => null) as {
    eventName?: unknown;
    eventId?: unknown;
    eventSourceUrl?: unknown;
    email?: unknown;
    fbp?: unknown;
    fbc?: unknown;
    customData?: unknown;
  } | null;

  if (typeof body?.eventName !== "string" || typeof body?.eventId !== "string") {
    return json({ error: "Invalid event" }, 400);
  }

  if (!ALLOWED_EVENT_NAMES.has(body.eventName)) {
    return json({ error: "Event not allowed" }, 400);
  }

  const rawCustomData = typeof body.customData === "object" && body.customData !== null
    ? body.customData as Record<string, unknown>
    : undefined;
  // Lead/InitiateCheckout never carry confirmed revenue — strip any
  // value/currency the caller sent rather than trust it.
  let customData: Record<string, unknown> | undefined;
  if (rawCustomData) {
    const { value: _value, currency: _currency, ...rest } = rawCustomData;
    customData = Object.keys(rest).length > 0 ? rest : undefined;
  }

  await sendMetaCapiEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : undefined,
    customData,
    userData: {
      email: typeof body.email === "string" ? body.email : undefined,
      fbp: typeof body.fbp === "string" ? body.fbp : undefined,
      fbc: typeof body.fbc === "string" ? body.fbc : undefined,
      clientIpAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      clientUserAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  return json({ ok: true });
}
