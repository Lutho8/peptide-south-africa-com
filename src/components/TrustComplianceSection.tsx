import { Microscope, FileCheck2, ShieldCheck, FlaskConical, Stethoscope, ClipboardList, Thermometer, Lock } from "lucide-react";

interface Props {
  /** "full" for homepage hero section, "compact" for PDP inline panel. */
  variant?: "full" | "compact";
  className?: string;
}

const PILLARS = [
  {
    icon: Microscope,
    title: "Scientific Oversight",
    detail:
      "Every protocol is reviewed by a registered medical doctor before dispatch. Compound selection, dosing windows, and stack interactions are signed off — not auto-generated.",
    proof: "HPCSA-registered GP review on file",
  },
  {
    icon: FileCheck2,
    title: "Independent Lab Testing",
    detail:
      "Every batch is third-party tested by Janoshik Analytical (Czech Republic) using HPLC-MS for purity and identity. No batch ships without a passing COA.",
    proof: "99.0%+ purity threshold · COA per lot",
  },
  {
    icon: ClipboardList,
    title: "Documented SOPs",
    detail:
      "Pick-and-pack, cold-chain handoff, COA-to-batch reconciliation, and refund workflows are documented Standard Operating Procedures — versioned and auditable.",
    proof: "ISO-style procedure control",
  },
  {
    icon: Thermometer,
    title: "Cold-Chain Integrity",
    detail:
      "Lyophilised vials ship in insulated packaging with phase-change gel packs from our Johannesburg facility. Same-day dispatch before 14:00 SAST.",
    proof: "2–8 °C controlled handoff",
  },
  {
    icon: Stethoscope,
    title: "Medical Pathway",
    detail:
      "Prescription-track compounds (GLP-1s, growth-hormone secretagogues) route through GP consultation and partner pharmacy dispensing — never direct-to-consumer for Schedule items.",
    proof: "GP → script → SAHPRA-compliant pharmacy",
  },
  {
    icon: Lock,
    title: "Operational Legitimacy",
    detail:
      "Registered South African entity (Pty) Ltd. POPIA-compliant data handling. PayFast/Yoco PCI-DSS payment rails. Discreet, signature-required courier delivery.",
    proof: "POPIA · PCI-DSS · CIPC registered",
  },
];

export default function TrustComplianceSection({ variant = "full", className = "" }: Props) {
  if (variant === "compact") {
    return (
      <section className={`container py-10 ${className}`}>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Why this peptide costs what it costs
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                Clinical-grade compounding, not grey-market vials.
              </h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.slice(0, 6).map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/60 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{p.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-trust">
                      {p.proof}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden bg-background py-16 md:py-24 ${className}`}>
      {/* Editorial depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.06),_transparent_60%)]" />
      <div className="container px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
            <FlaskConical className="h-3 w-3" /> Trust & Compliance Architecture
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Built like a pharmacy. Priced like one too.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Peptide South Africa is the only SA-based platform combining GP-led oversight, independently
            verified purity, and documented operational controls. Here's what your money buys beyond the vial.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.detail}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-trust/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-trust">
                  <ShieldCheck className="h-3 w-3" /> {p.proof}
                </div>
              </article>
            );
          })}
        </div>

        {/* Operational legitimacy strip */}
        <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {[
              { kpi: "99.0%+", label: "Min. purity per COA" },
              { kpi: "<24h", label: "Order → dispatch" },
              { kpi: "100%", label: "Lots third-party tested" },
              { kpi: "POPIA", label: "Compliant data handling" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-primary sm:text-3xl">{s.kpi}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
