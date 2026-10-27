import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { capturePartnerAttribution } from "@/lib/partnerAttribution";
export default function PartnerReferralConsent() {
  const { search, pathname } = useLocation();
  const referral = capturePartnerAttribution(search);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { try { localStorage.removeItem("psa_partner_attribution_v1"); } catch { /* Storage is optional. */ } }, []);
  async function decide(allow: boolean) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/partner-attribution", { method: allow ? "POST" : "DELETE", headers: { "Content-Type": "application/json" }, body: allow ? JSON.stringify({ ...referral, consent: true }) : undefined });
      if (!response.ok) throw new Error("Unable to update referral tracking. Please retry or use a partner code at checkout.");
      setDismissed(search);
    } catch (e) { setError(e instanceof Error ? e.message : "Please retry."); }
    finally { setBusy(false); }
  }
  if (dismissed === search) return null;
  if (!referral) return pathname === "/privacy" ? <aside className="container py-4"><button disabled={busy} className="underline" onClick={() => void decide(false)}>Remove partner referral cookie and withdraw tracking consent</button>{error && <p role="alert">{error}</p>}</aside> : null;
  return <aside aria-label="Partner referral tracking" className="border-b bg-[#E8F7F5] px-4 py-4 text-[#082B57]"><div className="container"><p>Allow a referral cookie for partner {referral.code}? It lasts at most 30 days. You can decline and enter their code at checkout instead.</p><div className="mt-2 flex gap-4"><button disabled={busy} onClick={() => void decide(true)} className="rounded bg-[#082B57] px-4 py-2 text-white">Allow referral cookie</button><button disabled={busy} onClick={() => void decide(false)} className="underline">Decline / remove referral cookie</button></div>{error && <p role="alert">{error}</p>}</div></aside>;
}
