import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Copy,
  Check,
  MessageCircle,
  Gift,
  Stethoscope,
  Package,
  Activity,
  ArrowRight,
} from "lucide-react";
import SEO from "@/components/SEO";
import { COPY } from "@/lib/copy";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";

function useReferralCode() {
  const [code, setCode] = useState("PSA-FRIEND");
  useEffect(() => {
    try {
      let c = localStorage.getItem("psa-ref-code");
      if (!c) {
        c = `PSA-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        localStorage.setItem("psa-ref-code", c);
      }
      setCode(c);
    } catch { /* storage unavailable — keep fallback */ }
  }, []);
  return code;
}

const NEXT_STEPS = [
  {
    icon: Stethoscope,
    title: "GP review",
    body: "An HPCSA-registered GP reviews your order before anything is dispatched. If it isn't right for you, you aren't charged.",
  },
  {
    icon: Package,
    title: "Cold-chain dispatch",
    body: "Validated insulated packaging ships Monday–Wednesday. Your batch COA travels in the box.",
  },
  {
    icon: Activity,
    title: "Track your protocol",
    body: "Doses and biomarkers sync to the PSA tracker app at peptide-south-africa.co.za.",
  },
];

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { market, lang } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  const code = useReferralCode();
  const [copied, setCopied] = useState(false);
  const refLink = `https://peptide-south-africa.com/?ref=${code}`;
  const shareText = `I've just started a physician-guided peptide protocol with Peptide South Africa — GP-reviewed, ≥99% lab-tested, COA in the box. My link gets you 10% off your first order: ${refLink}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const trackShare = () => {
    import("@/lib/nocobase")
      .then(({ captureLead }) => captureLead({ source: "order", extraTags: ["referral_shared"] }))
      .catch(() => {});
  };

  if (orderId) {
    return <Navigate to={`/order/${orderId}`} replace />;
  }

  return (
    <>
      <SEO
        title="Order Received"
        description="Thank you for your order."
        path={mp("/checkout/success")}
        lang={lang}
        alternates={buildAlternates("/checkout/success")}
        noindex
      />
      <div className="container flex flex-col items-center px-4 py-20 text-center md:py-28">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trust/10">
          <CheckCircle className="h-10 w-10 text-trust" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">{COPY.thank_you.en}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          {COPY.thank_you.de} · {COPY.thank_you.af}
        </p>

        {/* What happens next — retention framing from minute one */}
        <div className="mt-10 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
          {NEXT_STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </span>
              <p className="mt-3 font-display text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Refer-a-friend — the moment of maximum advocacy */}
        <div className="glow-border mt-8 w-full max-w-3xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 text-left shadow-glow sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-hero-gradient text-primary-foreground shadow-glow">
              <Gift className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">
                Give 10%, get R200 credit.
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Know someone with the same goals you had? Your link gives them 10% off their
                first order — and credits your account R200 when their protocol ships.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                  <span className="truncate font-mono text-sm text-foreground">{refLink}</span>
                </div>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                >
                  {copied ? <Check className="h-4 w-4 text-trust" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-trust px-5 py-3 text-sm font-semibold text-trust-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                </a>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Refer at scale?{" "}
                <Link to={mp("/affiliate")} className="font-semibold text-primary hover:underline">
                  Join the affiliate programme — 20–35% commission <ArrowRight className="inline h-3 w-3" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <Link to={mp("/shop")} className="mt-10 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
          {COPY.continue_shopping.en} · {COPY.continue_shopping.de}
        </Link>
      </div>
    </>
  );
}
