import { ArrowRight } from "lucide-react";
import type { CTAVariant } from "@/data/blog/types";

const CLUB_URL = "https://www.capetownpeptideclub.co.za/";

export default function BlogCTA({ variant: _variant }: { variant: CTAVariant }) {
  const cards = [
    {
      href: CLUB_URL,
      eyebrow: "Join the community",
      title: "Cape Town Peptide Club",
      body: "Workshops, GP-led Q&A and a vetted peer network for longevity-focused biohackers in SA.",
      cta: "Visit the Club",
    },
  ];

  return (
    <section className="mt-12 grid gap-5">
      {cards.map((c) => (
        <a
          key={c.href}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/10 p-7 transition-all hover:border-accent hover:shadow-glow"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">{c.eyebrow}</p>
          <h3 className="mb-2 font-display text-2xl font-bold text-foreground">{c.title}</h3>
          <p className="mb-4 text-muted-foreground">{c.body}</p>
          <span className="inline-flex items-center gap-2 font-semibold text-accent">
            {c.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </a>
      ))}
    </section>
  );
}
