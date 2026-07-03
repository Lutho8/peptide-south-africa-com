import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { MIX_BUNDLE_TIERS } from "@/lib/bundlePricing";

/**
 * Bundle promo band — sits directly below the homepage hero.
 * "The only pick & mix in SA" is the core differentiator vs every competitor.
 */
export default function BundlePromoBanner() {
  return (
    <section className="border-y border-border bg-primary/5">
      <div className="container flex flex-col items-center justify-between gap-3 px-4 py-4 text-center sm:flex-row sm:text-left">
        <p className="flex flex-col items-center gap-1 text-sm font-semibold text-foreground sm:flex-row sm:gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hero-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
            <Sparkles className="h-3 w-3" /> New
          </span>
          <span>
            Build Your Own 5-Pack — pick any 5 peptides, save {MIX_BUNDLE_TIERS[5].discountPct}%.{" "}
            <span className="text-muted-foreground">The only pick &amp; mix in SA.</span>
          </span>
        </p>
        <Link
          to="/build-your-stack"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Start Building <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
