import { BadgeCheck, FlaskConical, ShieldCheck } from "lucide-react";

/**
 * Janoshik COA trust badge — the store's biggest differentiator, made visible
 * on every product page. `coaUrl` is intentionally optional: when a real
 * per-batch COA link exists it becomes a "View COA" button; until then the
 * badge communicates the reported result without inventing a dead link.
 */
export default function CoaBadge({
  purity = "≥99% HPLC",
  coaUrl,
}: {
  purity?: string;
  coaUrl?: string;
}) {
  return (
    <div className="mt-4 rounded-xl border border-trust/30 bg-trust/[0.06] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trust/15">
          <FlaskConical className="h-5 w-5 text-trust" />
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 font-display text-sm font-bold text-foreground">
            <BadgeCheck className="h-4 w-4 text-trust" /> Independently lab-tested by Janoshik
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {purity} is the result currently associated with this product. Open the published
            source report where available and check its sample or lot scope before relying on it.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
              <ShieldCheck className="h-3 w-3 text-trust" /> {purity}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
              Janoshik verified
            </span>
            {coaUrl ? (
              <a
                href={coaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-trust px-3 py-1 text-[11px] font-bold text-white hover:opacity-90"
              >
                View COA →
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                Published report pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
