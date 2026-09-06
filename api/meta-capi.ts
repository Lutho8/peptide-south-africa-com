import { sendMetaCapiEvent } from "./_shared/metaCapi";

export const config = { runtime: "edge" };

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

/**
 * Client-fired relay for Conversions API coverage of browser-only events
 * (Lead, InitiateCheckout). Purchase is sent authoritatively from
 * api/eft-create-order.ts instead, since that endpoint already holds the
 * server-confirmed order amount and email.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

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

  await sendMetaCapiEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : undefined,
    customData: typeof body.customData === "object" && body.customData !== null
      ? body.customData as Record<string, unknown>
      : undefined,
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
