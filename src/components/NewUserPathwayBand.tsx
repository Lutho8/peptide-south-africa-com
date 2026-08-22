import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { STARTER_PATHWAYS, STORE_LINKS } from "@/data/starterPathways";

export default function NewUserPathwayBand() {
  return (
    <section className="border-y border-primary/15 bg-primary/[0.035] py-10 md:py-12">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-primary/20 bg-card p-5 shadow-card sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Compass className="h-4 w-4" /> New to GLP-1s or peptides?
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Start with a clear pathway, not a guess.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Understand the guided and research routes, explore educational age-based research maps, and choose the next appropriate step without dosage claims or pressure.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {STARTER_PATHWAYS.map((pathway) => (
                  <Link
                    key={pathway.id}
                    to={`${STORE_LINKS.startHere}#${pathway.id}`}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {pathway.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to={STORE_LINKS.startHere}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-hero-gradient px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90"
            >
              Show me where to start <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
