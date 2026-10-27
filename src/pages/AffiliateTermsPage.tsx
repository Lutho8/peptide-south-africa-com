import SEO from "@/components/SEO";
import { PARTNER_POLICY_VERSION, PARTNER_TERMS } from "@/lib/partnerPolicy";
export default function AffiliateTermsPage() {
  return <><SEO title="Partner Programme Terms" description="Versioned terms for Peptide South Africa partners." path="/affiliate/terms" /><article className="container max-w-3xl px-4 py-16"><h1 className="text-3xl font-bold">Partner programme terms</h1><p className="mt-3">Application terms: wellness-partner-application-v2.0-2026-10-27</p><p>Commercial policy: {PARTNER_POLICY_VERSION}</p><div className="mt-6 space-y-5">{PARTNER_TERMS.split("\n\n").map((paragraph, i) => <p key={i} className="whitespace-pre-line leading-relaxed">{paragraph}</p>)}</div></article></>;
}
