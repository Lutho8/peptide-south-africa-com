import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Landmark,
  Copy,
  Check,
  Smartphone,
  PenLine,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutStepper from "@/components/CheckoutStepper";
import { formatZAR } from "@/lib/price";
import { EFT_SESSION_KEY, type EftInstructionsState } from "@/lib/eftCheckout";
import { useAuth } from "@/hooks/useAuth";
import { buildWhatsAppUrl } from "@/lib/contact";
import { currentOffer, trackEvent } from "@/lib/analytics";

function useCopy(): [string | null, (key: string, value: string) => void] {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (key: string, value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
      })
      .catch(() => {});
  };
  return [copiedKey, copy];
}

function DetailRow({
  label,
  value,
  copyKey,
  copiedKey,
  onCopy,
  mono = true,
}: {
  label: string;
  value: string;
  copyKey?: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`truncate text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      {copyKey && (
        <button
          type="button"
          onClick={() => onCopy(copyKey, value)}
          aria-label={`Copy ${label}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.97]"
        >
          {copiedKey === copyKey ? (
            <><Check className="h-3.5 w-3.5 text-trust" /> Copied</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy</>
          )}
        </button>
      )}
    </div>
  );
}

export default function EftInstructionsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [copiedKey, copy] = useCopy();

  const data: EftInstructionsState | null = useMemo(() => {
    const fromRouter = (location.state ?? null) as EftInstructionsState | null;
    if (fromRouter?.paymentReference && fromRouter?.bank) return fromRouter;
    try {
      const raw = window.sessionStorage.getItem(EFT_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as EftInstructionsState;
      return parsed?.paymentReference && parsed?.bank ? parsed : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [data?.orderId]);

  useEffect(() => {
    if (data) {
      const offer = currentOffer();
      trackEvent({ event: "eft_instructions_shown", props: {
        order_id: data.orderId,
        server_confirmed_amount_zar: data.amount,
        ...(offer ? { offer_id: offer.offer_id, displayed_price_zar: offer.displayed_price_zar } : {}),
      } });
    }
  }, [data]);

  if (!data) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">No EFT order found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open the EFT instructions in your order email for your payment details. Use the secure link in that email to check your order status.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/track-order" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Track my order
          </Link>
          <Link to="/shop" className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const { bank, paymentReference, amount } = data;
  const supportUrl = buildWhatsAppUrl(
    `Hi PSA, I need help with an EFT for order reference ${paymentReference}.`,
  );
  const statusPath = user && data.orderId ? `/order/${data.orderId}` : "/track-order";

  const steps = [
    {
      icon: Smartphone,
      title: "Open your banking app",
      body: "Capitec, FNB, Standard Bank, Absa, Nedbank or TymeBank — any SA bank works.",
    },
    {
      icon: PenLine,
      title: `Use reference ${paymentReference} exactly`,
      body: "This is how we match your payment to your order automatically. No reference = delayed dispatch.",
    },
    {
      icon: BadgeCheck,
      title: "Done — we take it from here",
      body: "We email you once the matching deposit is verified. You can check your order status here.",
    },
  ];

  return (
    <>
      <SEO title="EFT Payment Instructions" description="Complete your order with a direct EFT to our Capitec Business account." path="/checkout/eft-instructions" noindex />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "EFT Payment" }]} />
      <div className="container px-4 py-6 pb-28 md:py-12 lg:pb-12">
        <CheckoutStepper current="pay" className="mb-6" />
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hero-gradient text-primary-foreground shadow-glow">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Pay by EFT</h1>
              <p className="text-sm text-muted-foreground">Use the exact amount and reference below. Already transferred? Check your order status before paying again.</p>
            </div>
          </div>

          {/* Reference — the single most important thing */}
          <div className="glow-border mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 text-center shadow-glow">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Your payment reference</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
              {paymentReference}
            </p>
            <button
              type="button"
              onClick={() => copy("ref", paymentReference)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {copiedKey === "ref" ? (
                <><Check className="h-4 w-4" /> Copied!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy reference</>
              )}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Amount to pay: <span className="font-display text-sm font-bold text-foreground">{formatZAR(amount)}</span>
            </p>
          </div>

          {/* Bank details */}
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Bank details</h2>
            <div className="mt-3 divide-y divide-border">
              <DetailRow label="Account name" value={bank.account_name} copiedKey={copiedKey} onCopy={copy} mono={false} />
              <DetailRow label="Bank" value={bank.bank} copiedKey={copiedKey} onCopy={copy} mono={false} />
              <DetailRow label="Account number" value={bank.account_number} copyKey="acc" copiedKey={copiedKey} onCopy={copy} />
              <DetailRow label="Branch code" value={bank.branch_code} copyKey="branch" copiedKey={copiedKey} onCopy={copy} />
              <DetailRow label="Reference" value={paymentReference} copyKey="ref2" copiedKey={copiedKey} onCopy={copy} />
              <DetailRow label="Amount" value={formatZAR(amount)} copyKey="amt" copiedKey={copiedKey} onCopy={copy} />
            </div>
            <p className="mt-4 rounded-md bg-trust/10 px-3 py-2 text-xs font-semibold leading-relaxed text-trust">
              Bank transfers can take 1–2 business days to clear. We prepare your order for dispatch after we verify the deposit.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="font-display text-xs font-bold text-muted-foreground">STEP {i + 1}</span>
                </div>
                <p className="mt-3 font-display text-sm font-semibold leading-snug text-foreground">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">After you pay</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Keep this page open or save your EFT instructions email. Check back for confirmation after the transfer clears.
              If you need help matching the payment, send your proof to PSA support.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {data.trackingUrl ? (
                <a href={data.trackingUrl} className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
                  Track this order securely
                </a>
              ) : (
                <Link to={statusPath} className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
                  Check order status
                </Link>
              )}
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" /> Send proof of payment
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
