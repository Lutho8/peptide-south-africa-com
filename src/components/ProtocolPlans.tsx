import { useMemo, useState } from "react";
import { Check, ArrowRight, ShoppingCart } from "lucide-react";
import { formatZarWhole, PRICING, WEIGHT_LOSS_SAVING } from "../../supabase/functions/_shared/pricing";

/**
 * ProtocolPlans — commitment engineering for telehealth.
 * 1-month is the anchor. 3-month Starter is the default ("minimum
 * clinically meaningful cycle"). 6-month Commitment carries the savings
 * and the outcomes narrative. Perception of a smart choice, same stack.
 */

export interface PlanChoice {
  id: "monthly" | "starter" | "commitment";
  label: string;
  months: number;
  perMonth: number;
  total: number;
}

export const zar = formatZarWhole;

export function buildPlans(_monthly: number): PlanChoice[] {
  return [
    { id: "monthly", label: "Monthly plan", months: 1, perMonth: PRICING.programOffers.monthly.amount, total: PRICING.programOffers.monthly.amount },
    { id: "starter", label: "Full 12-week program", months: 3, perMonth: PRICING.programOffers.full12Week.amount / 3, total: PRICING.programOffers.full12Week.amount },
  ];
}

/** Build plan prices from the exact pack totals that will be added to cart. */
export function buildProductPlans(singleVialsTotal: number, threePacksTotal: number): PlanChoice[] {
  const single = Math.max(0, singleVialsTotal);
  const three = Math.max(0, threePacksTotal);
  return [
    { id: "monthly", label: "1 Month — Single Vials", months: 1, perMonth: single, total: single },
    { id: "starter", label: "3 Months — 3-Pack Cycle", months: 3, perMonth: three / 3, total: three },
    { id: "commitment", label: "6 Months — 2× 3-Pack Cycle", months: 6, perMonth: (three * 2) / 6, total: three * 2 },
  ];
}

export function parseMonthly(_price?: string | null): number {
  return PRICING.programOffers.monthly.amount;
}

export default function ProtocolPlans({
  monthlyPrice,
  budget,
  onChoose,
  choosing,
  exactPlans,
  consultHref,
}: {
  monthlyPrice?: string | null;
  budget?: string;
  onChoose: (plan: PlanChoice) => void;
  choosing?: boolean;
  exactPlans?: PlanChoice[];
  consultHref?: string;
}) {
  const monthly = useMemo(() => parseMonthly(monthlyPrice), [monthlyPrice]);
  const plans = useMemo(() => exactPlans?.length === 3 ? exactPlans : buildPlans(monthly), [exactPlans, monthly]);
  const [selected, setSelected] = useState<PlanChoice>(plans[1]);
  const clinicianGuided = !exactPlans || exactPlans.length !== 3;
  const anchorMonthly = plans[0]?.perMonth ?? monthly;

  const saveVsMonthly = (p: PlanChoice) => clinicianGuided && p.id === "starter"
    ? WEIGHT_LOSS_SAVING
    : Math.max(0, anchorMonthly * p.months - p.total);

  return (
    <div>
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Choose your cycle
        </span>
        <h3 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl text-balance">
          {clinicianGuided ? "One program. Two payment options." : "Choose your research pack."}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {budget === "starter"
            ? "Anchored to the budget you gave us — nothing here exceeds it."
            : "Body recomposition runs in months, not weeks. Your cycle should match the biology."}
        </p>
      </div>

      <div className={`mt-6 grid gap-3 ${clinicianGuided ? "md:grid-cols-2" : "md:grid-cols-3"}`} role="radiogroup" aria-label="Choose your protocol cycle">
        {plans.map((p) => {
          const isSel = selected.id === p.id;
          const save = saveVsMonthly(p);
          const isDefault = p.id === "starter";
          const isLongest = p.id === "commitment";
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={isSel}
              onClick={() => setSelected(p)}
              className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-300 active:scale-[0.98] ${
                isSel
                  ? "glow-border border-primary bg-primary/5 shadow-glow"
                  : "border-border bg-card shadow-card hover:border-primary/40"
              }`}
            >
              {(isDefault || isLongest) && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground ${
                    isLongest ? "bg-trust" : "bg-hero-gradient"
                  }`}
                >
                  {isLongest ? "Longest cycle" : "Most popular"}
                </span>
              )}

              <span className={`mt-1 font-display text-sm font-bold ${isSel ? "text-primary" : "text-foreground"}`}>
                {p.label}
              </span>

              <span className="mt-3 font-display text-2xl font-bold text-foreground">
                {zar(p.total)}{p.id === "monthly" && <span className="text-sm font-normal text-muted-foreground">/month</span>}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {clinicianGuided
                  ? (p.months > 1 ? "One payment for the full 12 weeks" : "Cancel according to the applicable program terms")
                  : `${p.months}-month research pack selection`}
              </span>

              {save > 0 ? (
                <span className="mt-2 inline-flex w-fit rounded-full bg-trust/10 px-2.5 py-0.5 text-[11px] font-bold text-trust">
                  Save {zar(save)} vs monthly
                </span>
              ) : (
                <span className="mt-2 inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Full flexibility
                </span>
              )}

              {isLongest && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> Two complete 3-pack cycles</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> Exact pack pricing shown upfront</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> Free tracker included</li>
                </ul>
              )}
              {isDefault && (
                <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                  One checkout for a three-month supply at the displayed pack pricing.
                </p>
              )}

              <span
                className={`mt-auto pt-4 text-xs font-semibold ${isSel ? "text-primary" : "text-muted-foreground"}`}
              >
                <span className={`mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 align-middle ${
                  isSel ? "border-primary bg-primary" : "border-border"
                }`}>
                  {isSel && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </span>
                {isSel ? "Selected" : "Select"}
              </span>
            </button>
          );
        })}
      </div>

      {clinicianGuided ? (
        <a
          href={consultHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onChoose(selected)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-6 py-4 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98]"
        >
          BOOK CONSULT <ArrowRight className="h-5 w-5" />
        </a>
      ) : (
        <button
          onClick={() => onChoose(selected)}
          disabled={choosing}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-6 py-4 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
        >
          <ShoppingCart className="h-5 w-5" /> Add to Cart · {zar(selected.total)}
        </button>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {clinicianGuided
          ? "Eligible prescription pathways are reviewed by an HPCSA-registered GP before fulfilment."
          : "Exact cart pricing, with no automatic renewal."}
      </p>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden"
        role="region"
        aria-label="Selected quiz plan"
      >
        {clinicianGuided ? (
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onChoose(selected)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            BOOK CONSULT
          </a>
        ) : (
          <button
            onClick={() => onChoose(selected)}
            disabled={choosing}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart · {zar(selected.total)}
          </button>
        )}
      </div>
    </div>
  );
}
