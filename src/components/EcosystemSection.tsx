import { ArrowRight, ClipboardList, FlaskConical, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

const CARDS = [
  {
    key: "store",
    title: "Research Store",
    eyebrow: "01 · DISCOVER",
    body:
      "Browse research compounds, compare product records and review the exact scope of published reports.",
    cta: "Browse the catalogue",
    href: "/shop",
    icon: FlaskConical,
    external: false,
  },
  {
    key: "portal",
    title: "Patient Portal",
    eyebrow: "02 · MANAGE",
    body:
      "Keep orders, fulfilment milestones, consent receipts, documents and reorder actions in one Peptide SA account.",
    cta: "Open your portal",
    href: "/account",
    icon: ClipboardList,
    external: false,
  },
  {
    key: "tracker",
    title: "Peptide Tracker",
    eyebrow: "03 · CONTINUE",
    body:
      "Continue with routine planning, notes and progress records in the same navy, teal and ice Peptide SA experience.",
    cta: "Open the tracker",
    href: "https://peptide-south-africa.co.za/",
    icon: LineChart,
    external: true,
  },
];

export default function EcosystemSection() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container px-4">
        <div className="mb-10 text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">
            One Branded Journey
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Store, portal and tracker — continuously Peptide SA.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Customers keep the same visual language, account identity and record trail from first product review through every later interaction.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.key}
              className="flex flex-col rounded-2xl border border-border border-t-[3px] border-t-primary bg-card p-6 shadow-card"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.eyebrow}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{c.body}</p>

              {c.external ? (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 self-start rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link
                  to={c.href}
                  className="mt-5 inline-flex items-center gap-1.5 self-start rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
