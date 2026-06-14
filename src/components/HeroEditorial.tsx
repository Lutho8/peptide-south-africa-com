import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeroEditorial({ sub }: { sub: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* Top eyebrow row */}
      <div className="border-b border-border/60">
        <div className="container flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-foreground/70">
          <span className="eyebrow">SA · Peptide-forward telehealth</span>
          <span className="eyebrow hidden sm:inline">GP-led · Lab tested · POPIA</span>
          <span className="eyebrow">Est. 2026</span>
        </div>
      </div>

      <div className="container grid gap-10 px-4 py-14 md:grid-cols-12 md:gap-8 md:py-20 lg:py-24">
        {/* Left: editorial copy column */}
        <div className="md:col-span-7 md:pr-6">
          <p className="eyebrow text-accent">Step 01 — Personalise</p>
          <h1 className="display-xl mt-5 font-display text-foreground">
            Your personalised <br className="hidden sm:block" />
            health plan. <span className="italic text-clay">In 60 seconds.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/75">
            {sub} Take the 1-minute assessment and we'll match you to a peptide
            program engineered for your goal — reviewed by a licensed SA physician
            where clinically required.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/assessment"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-clay px-8 py-4 text-base font-semibold text-background shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Take the 60-second assessment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-7 py-4 text-base font-medium text-foreground transition hover:bg-foreground/5"
            >
              How it works
            </Link>
          </div>

          {/* Trust strip */}
          <ul className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 sm:grid-cols-4">
            {[
              ["01", "GP-led"],
              ["02", "Lab tested"],
              ["03", "Same-day CT"],
              ["04", "POPIA"],
            ].map(([n, label]) => (
              <li key={n} className="flex flex-col">
                <span className="eyebrow text-clay">{n}</span>
                <span className="mt-1 text-sm font-medium text-foreground">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: full-bleed portrait + floating mono label */}
        <div className="relative md:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-secondary">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80"
              alt="Personalised peptide telehealth"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            {/* Floating monospace label (CSS position absolute + transform = floating centered label) */}
            <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-background/95 px-4 py-2 shadow-card-hover backdrop-blur">
              <span className="eyebrow text-foreground">Protocol #014 · GLP-1 + BPC-157</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent p-6">
              <p className="font-display text-2xl italic text-primary-foreground">
                "My program was ready in minutes. Lost 8 kg in six weeks."
              </p>
              <p className="eyebrow mt-2 text-primary-foreground/80">Michael T. · Cape Town</p>
            </div>
          </div>

          {/* Floating score card */}
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-card-hover md:block">
            <p className="eyebrow text-clay">Health Score</p>
            <p className="mt-1 font-display text-3xl text-foreground">84<span className="text-base text-muted-foreground">/100</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Built from 9 inputs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
