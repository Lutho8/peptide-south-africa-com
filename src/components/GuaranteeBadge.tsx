import { ShieldCheck } from "lucide-react";

interface Props {
  variant?: "seal" | "bar" | "inline";
  className?: string;
}

/**
 * Bold certainty badge surfaced on PDP, cart drawer, and checkout.
 * Three variants:
 *  - "seal": circular emblem for hero positioning
 *  - "bar": full-width trust strip
 *  - "inline": compact horizontal chip
 */
export default function GuaranteeBadge({ variant = "bar", className = "" }: Props) {
  if (variant === "seal") {
    return (
      <div
        className={`relative inline-flex h-32 w-32 items-center justify-center rounded-full border-2 border-clay bg-background text-primary shadow-card-hover ${className}`}
        aria-label="99% purity, lab tested, 30-day refund guarantee"
      >
        <div className="absolute inset-2 rounded-full border border-clay/40" />
        <div className="flex flex-col items-center text-center leading-tight">
          <ShieldCheck className="h-7 w-7 text-clay" strokeWidth={1.5} />
          <span className="mt-1 font-display text-base italic">99%</span>
          <span className="eyebrow text-[9px] text-foreground/70">Purity · Lab tested</span>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border border-clay/40 bg-clay/5 px-3 py-1 text-[11px] font-medium text-foreground ${className}`}>
        <ShieldCheck className="h-3.5 w-3.5 text-clay" />
        <span className="font-mono uppercase tracking-wider">99% Purity · 30-day refund</span>
      </span>
    );
  }

  return (
    <div className={`flex items-stretch gap-3 rounded-2xl border border-clay/30 bg-clay/[0.04] p-4 ${className}`}>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-clay text-background">
        <ShieldCheck className="h-6 w-6" strokeWidth={2} />
      </div>
      <div className="flex flex-col justify-center">
        <p className="font-display text-lg leading-none text-foreground">Our promise to you.</p>
        <p className="eyebrow mt-1.5 text-foreground/70">
          99% HPLC purity · 3rd-party lab tested · 30-day refund
        </p>
      </div>
    </div>
  );
}
