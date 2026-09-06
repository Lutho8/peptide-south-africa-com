// Underscore-prefixed per Vercel convention: not deployed as its own route,
// only imported by sibling functions in api/.
export type MetaCapiUserData = {
  email?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
};

export type MetaCapiEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData: MetaCapiUserData;
};

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Forwards a conversion event to Meta's Conversions API, mirroring the
 * browser Pixel. Sharing the same event_id as the corresponding fbq() call
 * lets Meta deduplicate the two signals into a single conversion, so this is
 * additive coverage (survives ad blockers / ITP) rather than double counting.
 * Never throws: a Meta outage or missing config must not break checkout or
 * any caller's request flow.
 */
export async function sendMetaCapiEvent(event: MetaCapiEvent): Promise<void> {
  const pixelId = process.env.VITE_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  try {
    const userData: Record<string, unknown> = {};
    if (event.userData.email) userData.em = [await sha256Hex(event.userData.email)];
    if (event.userData.fbp) userData.fbp = event.userData.fbp;
    if (event.userData.fbc) userData.fbc = event.userData.fbc;
    if (event.userData.clientIpAddress) userData.client_ip_address = event.userData.clientIpAddress;
    if (event.userData.clientUserAgent) userData.client_user_agent = event.userData.clientUserAgent;

    const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
    await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          event_name: event.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event.eventId,
          event_source_url: event.eventSourceUrl,
          action_source: "website",
          user_data: userData,
          custom_data: event.customData,
        }],
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      }),
    });
  } catch {
    // Best-effort signal only.
  }
}
