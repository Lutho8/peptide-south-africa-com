import { ArrowRight } from "lucide-react";

const CARDS = [
  {
    key: "club",
    title: "Cape Town Peptide Club",
    eyebrow: "THE CLUB",
    body:
      "Monthly workshops for biohackers and longevity researchers in Cape Town's Northern Suburbs. Starting November 2025.",
    cta: "Join the Club",
    href: "https://capetownpeptideclub.co.za",
    border: "#0ea5e9",
    highlighted: false,
    current: false,
  },
  {
    key: "pets",
    title: "Peptides4Pets",
    eyebrow: "PSA PETS",
    body:
      "Pet-longevity waitlist for South African dogs and cats — BPC-157, KPV, recovery blends, mobility collagen and calming peptides, with vet-handout dosing and honest evidence notes.",
    cta: "Join the pet waitlist",
    href: "https://pets.peptide-south-africa.com",
    border: "#D97E3F",
    highlighted: true,
    current: false,
  },
  {
    key: "store",
    title: "Peptide South Africa",
    eyebrow: "THE STORE",
    body:
      "HPLC-verified research peptides. COA on every batch. Locally stocked in South Africa.",
    cta: null,
    href: null,
    border: "#475569",
    highlighted: false,
    current: true,
  },
];

export default function EcosystemSection() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container px-4">
        <div className="mb-10 text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">
            The Peptide SA Ecosystem
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            One Ecosystem. Three Properties.
          </h2>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.key}
              className={`flex flex-col rounded-2xl border border-border p-6 shadow-card ${
                c.highlighted ? "bg-background ring-1 ring-border" : "bg-card"
              } ${c.current ? "opacity-90" : ""}`}
              style={{ borderTop: `3px solid ${c.border}` }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.eyebrow}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{c.body}</p>

              {c.current ? (
                <p className="mt-5 text-sm font-medium text-muted-foreground">You're here</p>
              ) : (
                <a
                  href={c.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 self-start rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
