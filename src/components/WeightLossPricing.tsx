import BookConsultLink from "@/components/BookConsultLink";
import { formatZarWhole, PRICING, WEIGHT_LOSS_SAVING } from "../../supabase/functions/_shared/pricing";

const zar = formatZarWhole;

export default function WeightLossPricing() {
  const monthly = PRICING.programOffers.monthly.amount;
  const full = PRICING.programOffers.full12Week.amount;
  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="weight-loss-pricing">
      <div className="rounded-2xl border-2 border-border bg-background p-6 text-center shadow-card">
        <p className="text-sm font-medium text-muted-foreground">Monthly plan</p>
        <p className="mt-1 font-display text-3xl font-bold text-foreground">
          {zar(monthly)}<span className="text-base font-normal text-muted-foreground">/month</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Per month. Cancel according to the applicable program terms. Prices include VAT.
        </p>
        <BookConsultLink
          offer="monthly"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-muted"
        />
      </div>
      <div className="relative rounded-2xl border-2 border-primary bg-background p-6 text-center shadow-glow">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
          BEST VALUE
        </span>
        <p className="text-sm font-medium text-muted-foreground">Full 12-week program</p>
        <p className="mt-1 font-display text-3xl font-bold text-gradient">{zar(full)}</p>
        <p className="mt-2 text-xs font-semibold text-trust">
          One payment for 12 weeks · Save {zar(WEIGHT_LOSS_SAVING)} vs three monthly payments · approximately 17%
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Prices include VAT.</p>
        <BookConsultLink
          offer="full12Week"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-hero-gradient px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
        />
      </div>
    </div>
  );
}
