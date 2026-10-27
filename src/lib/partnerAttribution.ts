export type PartnerAttribution = { code: string; campaign: string | null; method: "referral_click" | "qr" };
/** URL candidate only. Consented tracking is persisted by the server. */
export function capturePartnerAttribution(search = typeof window === "undefined" ? "" : window.location.search): PartnerAttribution | null {
  const params = new URLSearchParams(search), raw = params.get("partner");
  if (!raw || !/^[A-Za-z0-9_-]{3,80}$/.test(raw)) return null;
  const campaign = params.get("campaign");
  if (campaign && !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(campaign)) return null;
  return { code: raw.toUpperCase(), campaign, method: params.get("via") === "qr" ? "qr" : "referral_click" };
}
