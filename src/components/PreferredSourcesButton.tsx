import { Sparkles } from "lucide-react";

type Props = {
  compact?: boolean;
  className?: string;
};

/**
 * Google-hosted Preferred Sources control.
 *
 * The unusual attribute is the official declarative hook documented by
 * Google. The publisher library loaded in index.html replaces this container
 * with its localized, account-aware button.
 */
export default function PreferredSourcesButton({ compact = false, className = "" }: Props) {
  const googleButtonAttributes = {
    "google-add-preferred-source-btn": "",
    "data-theme": "light",
    "data-lang": "en",
  } as React.HTMLAttributes<HTMLDivElement>;

  return (
    <aside
      aria-label="Follow Peptide South Africa in Google"
      className={`rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 ${
        compact ? "p-4" : "p-5 md:p-6"
      } ${className}`}
    >
      <div className={`flex ${compact ? "flex-col gap-3 sm:flex-row sm:items-center" : "flex-col gap-4 md:flex-row md:items-center md:justify-between"}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              Make us a preferred source on Google
            </p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              See more of our new, research-cited South African peptide explainers in Google Search,
              Top Stories, AI Overviews and AI Mode when they are relevant.
            </p>
          </div>
        </div>
        <div className="shrink-0 pl-12 sm:pl-0" {...googleButtonAttributes} />
      </div>
    </aside>
  );
}
