// Deno counterpart of api/_shared/metaCapi.ts. Duplicated rather than shared
// because Vercel Edge (npm-style relative import) and Supabase Edge (Deno,
// Deno.env) are separate runtimes with no common module boundary in this repo
// — the same split already exists for pricing.ts (api vs supabase/functions).
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
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Forwards a conversion event to Meta's Conversions API. This is the only
 * caller in the codebase allowed to send eventName: 'Purchase' — it is
 * invoked from eft-reconcile exactly when a bank deposit settles an order,
 * which is the founder-level definition of a confirmed purchase.
 * Never throws: a Meta outage or missing config must not break reconciliation.
 */
export async function sendMetaCapiEvent(event: MetaCapiEvent): Promise<void> {
  const pixelId = Deno.env.get('META_PIXEL_ID');
  const accessToken = Deno.env.get('META_CAPI_ACCESS_TOKEN');
  if (!pixelId || !accessToken) return;

  try {
    const userData: Record<string, unknown> = {};
    if (event.userData.email) userData.em = [await sha256Hex(event.userData.email)];
    if (event.userData.fbp) userData.fbp = event.userData.fbp;
    if (event.userData.fbc) userData.fbc = event.userData.fbc;
    if (event.userData.clientIpAddress) userData.client_ip_address = event.userData.clientIpAddress;
    if (event.userData.clientUserAgent) userData.client_user_agent = event.userData.clientUserAgent;

    const testEventCode = Deno.env.get('META_CAPI_TEST_EVENT_CODE');
    await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: event.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event.eventId,
          event_source_url: event.eventSourceUrl,
          action_source: 'website',
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
