import { useMemo, useState } from "react";
import { Check, ArrowRight, Stethoscope, Truck, Sparkles } from "lucide-react";

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

export const zar = (n: number) => `R${Math.round(n).toLocaleString("en-ZA")}`;

export function buildPlans(monthly: number): PlanChoice[] {
  return [
    { id: "monthly", label: "1 Month — The Tester", months: 1, perMonth: monthly, total: monthly },
    { id: "starter", label: "3 Months — Starter Cycle", months: 3, perMonth: monthly * 0.9, total: monthly * 3 * 0.9 },
    { id: "commitment", label: "6 Months — Commitment Cycle", months: 6, perMonth: monthly * 0.82, total: monthly * 6 * 0.82 },
  ];
}

export function parseMonthly(price?: string | null): number {
  if (!price) return 1999;
  const n = Number(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 1999;
}

export default function ProtocolPlans({
  monthlyPrice,
  budget,
  onChoose,
  choosing,
}: {
  monthlyPrice?: string | null;
  budget?: string;
  onChoose: (plan: PlanChoice) => void;
  choosing?: boolean;
}) {
  const monthly = useMemo(() => parseMonthly(monthlyPrice), [monthlyPrice]);
  const plans = useMemo(() => buildPlans(monthly), [monthly]);
  const [selected, setSelected] = useState<PlanChoice>(plans[1]); // 3-month default — the Keeps move

  const saveVsMonthly = (p: PlanChoice) => Math.max(0, monthly * p.months - p.total);

  return (
    <div>
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Choose your cycle
        </span>
        <h3 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl text-balance">
          Same protocol. Three ways to commit to it.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {budget === "starter"
            ? "Anchored to the budget you gave us — nothing here exceeds it."
            : "Body recomposition runs in months, not weeks. Your cycle should match the biology."}
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Choose your protocol cycle">
        {plans.map((p) => {
          const isSel = selected.id === p.id;
          const save = saveVsMonthly(p);
          const isDefault = p.id === "starter";
          const isBest = p.id === "commitment";
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
              {(isDefault || isBest) && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground ${
                    isBest ? "bg-trust" : "bg-hero-gradient"
                  }`}
                >
                  {isBest ? "Best results" : "Most popular"}
                </span>
              )}

              <span className={`mt-1 font-display text-sm font-bold ${isSel ? "text-primary" : "text-foreground"}`}>
                {p.label}
              </span>

              <span className="mt-3 font-display text-2xl font-bold text-foreground">
                {zar(p.perMonth)}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {p.months > 1 ? `${zar(p.total)} billed per cycle` : "Billed monthly, cancel anytime"}
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

              {isBest && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5"><Stethoscope className="h-3 w-3 text-primary" /> Priority GP consult</li>
                  <li className="flex items-center gap-1.5"><Truck className="h-3 w-3 text-primary" /> Free cold-chain shipping</li>
                  <li className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> Tracker app premium</li>
                </ul>
              )}
              {isDefault && (
                <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                  The minimum clinically meaningful cycle — where most members see the turning point.
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

      <button
        onClick={() => onChoose(selected)}
        disabled={choosing}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-6 py-4 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
      >
        Start the {selected.months}-month cycle — {zar(selected.total)} <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Reviewed by an HPCSA-registered GP before anything ships. Prefer month-to-month? The 1-month plan has no lock-in.
      </p>
    </div>
  );
}
