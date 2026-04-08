import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, X as XIcon } from "lucide-react";

const comparisonRows = [
  { feature: "Clinical oversight", online: "❌ None", trad: "⚠️ 6-month wait", rtd: "✓ GP within 72 hours" },
  { feature: "Compound quality", online: "❌ Unknown", trad: "❌ Won't prescribe", rtd: "✓ Pharmacy-grade" },
  { feature: "Protocol personalization", online: "❌ Generic stacks", trad: "⚠️ One-size-fits-all", rtd: "✓ Based on your bloodwork" },
  { feature: "Price transparency", online: "❌ Hidden costs", trad: "❌ Consult + meds + follow-ups", rtd: "✓ One bundled price" },
  { feature: "Ongoing support", online: "❌ Telegram groups", trad: "⚠️ Book another appointment", rtd: "✓ WhatsApp + check-ins" },
];

const weightLossTiers = [
  { name: "Spark", price: "R2,900", desc: "Entry level — Test peptides safely, lose 5-8kg", stack: "Stack: BPC-157", popular: false },
  { name: "Transform", price: "R7,800", desc: "Complete protocol — 10-15kg fat loss + muscle preservation", stack: "Stack: BPC-157 + CJC-1295/Ipamorelin", popular: true },
  { name: "Optimise", price: "R13,500", desc: "Elite tier — Total body optimization for biohackers", stack: "Stack: Full stack + Metabolic panel + Monthly consults", popular: false },
];

const recoveryTiers = [
  { name: "Restore", price: "R2,900", desc: "Entry level — Overtrained, poor sleep, high cortisol", stack: "Stack: BPC-157", popular: false },
  { name: "Recharge", price: "R7,800", desc: "Complete protocol — Executive burnout recovery", stack: "Stack: BPC-157 + TB-500 + Sleep optimization", popular: true },
  { name: "Rebuild", price: "R13,500", desc: "Elite tier — Total system reset for high-performers", stack: "Stack: Full stack + NAD+ + Adrenal panel + HRV monitoring", popular: false },
];

const steps = [
  { num: "1", title: "Complete Assessment", desc: "2-minute online questionnaire about your goals, health history, and lifestyle" },
  { num: "2", title: "Blood Analysis", desc: "Visit our partner lab for comprehensive metabolic/hormonal panel (included in price)" },
  { num: "3", title: "GP Consultation", desc: "45-minute video consultation with peptide-certified physician to review results" },
  { num: "4", title: "Protocol & Dispensing", desc: "Personalized protocol designed + compounds dispensed from partner pharmacy" },
];

function TierCard({ tier }: { tier: typeof weightLossTiers[0] }) {
  return (
    <div className={`rounded-lg p-5 transition-colors ${tier.popular ? "border-2 border-accent bg-accent/5" : "border-b border-border"}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-primary">{tier.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-accent">{tier.price}</span>
          {tier.popular && (
            <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">MOST POPULAR</span>
          )}
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{tier.desc}</p>
      <p className="mt-2 text-xs text-muted-foreground">{tier.stack}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ===== HERO ===== */}
      <section className="bg-hero-gradient px-4 py-20 text-center text-primary-foreground md:py-28">
        <div className="container">
          <h1 className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            Peptide Optimization for South Africans Who've Tried Everything Else
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg opacity-90">
            Medical-grade protocols. Real GP oversight. No more guessing with unregulated online orders or waiting months for specialist referrals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/quiz" className="btn-accent inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-95">
              Start Weight Loss Track <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/quiz" className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/20">
              Start Recovery Track
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm opacity-80">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> German Certified Compounds</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> GP-Led Protocols</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Partner Pharmacy Dispensing</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> 500+ South African Clients</span>
          </div>
        </div>
      </section>

      {/* ===== WHY RTD WORKS ===== */}
      <section className="bg-background py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
              Why RTD Works When Other Approaches Fail
            </h2>
            <p className="mt-3 text-muted-foreground">
              We bridge the gap between "buying random peptides online" and "waiting 6 months for an endocrinologist"
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border border-l-4 border-l-destructive bg-card p-6">
              <h3 className="font-display text-lg font-bold text-primary">❌ The "Online Peptide" Problem</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                You don't know what's in the vial. You don't know if your dose is right for your body. You have no clinical oversight when side effects hit. And when something goes wrong, you're alone.
              </p>
            </div>
            <div className="rounded-xl border border-border border-l-4 border-l-destructive bg-card p-6">
              <h3 className="font-display text-lg font-bold text-primary">❌ The Traditional Healthcare Problem</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Your GP won't prescribe peptides. Endocrinologists have 6-month waiting lists. And nobody bridges the gap between diagnosis and actually getting the compounds.
              </p>
            </div>
            <div className="rounded-xl border border-border border-l-4 border-l-accent bg-accent/5 p-6">
              <h3 className="font-display text-lg font-bold text-primary">✓ The RTD Bridge</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                We charge for the clinical service — bloodwork, GP consultation, protocol design — and prescribe through our partner pharmacy. You get pharmaceutical-grade compounds with medical oversight.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mx-auto mt-12 max-w-4xl overflow-x-auto">
            <table className="w-full overflow-hidden rounded-xl shadow-card">
              <thead>
                <tr className="bg-primary text-left text-sm text-primary-foreground">
                  <th className="p-4 font-semibold">What You Get</th>
                  <th className="p-4 font-semibold">Generic Online Peptides</th>
                  <th className="p-4 font-semibold">Traditional Healthcare</th>
                  <th className="bg-accent/20 p-4 font-semibold">RTD</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-border bg-card text-sm last:border-b-0">
                    <td className="p-4 font-medium text-foreground">{row.feature}</td>
                    <td className="p-4 text-muted-foreground">{row.online}</td>
                    <td className="p-4 text-muted-foreground">{row.trad}</td>
                    <td className="bg-accent/5 p-4 font-semibold text-foreground">{row.rtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== TRACKS ===== */}
      <section className="border-y border-border bg-card py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
              Choose Your Track
            </h2>
            <p className="mt-3 text-muted-foreground">
              Two specialized pathways, each with three tiers based on your goals and commitment level
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Weight Loss Track */}
            <div className="overflow-hidden rounded-2xl border border-border shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1">
              <div className="bg-hero-gradient p-6 text-primary-foreground">
                <h3 className="font-display text-2xl font-bold">🏋️ Weight Loss & Body Composition</h3>
                <p className="mt-1 opacity-90">Fat loss, lean muscle preservation, metabolic optimization</p>
              </div>
              <div className="space-y-1 p-4">
                {weightLossTiers.map((tier, i) => <TierCard key={i} tier={tier} />)}
              </div>
            </div>

            {/* Recovery Track */}
            <div className="overflow-hidden rounded-2xl border border-border shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1">
              <div className="p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(210 50% 25%), hsl(210 45% 35%))" }}>
                <h3 className="font-display text-2xl font-bold">🧘 Recovery, Burnout & Performance</h3>
                <p className="mt-1 opacity-90">Cortisol management, sleep architecture, HRV optimization</p>
              </div>
              <div className="space-y-1 p-4">
                {recoveryTiers.map((tier, i) => <TierCard key={i} tier={tier} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="bg-background py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl md:text-4xl">
              How RTD Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              From assessment to your first dose — complete transparency on the process
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-extrabold text-accent-foreground">
                  {s.num}
                </div>
                <h3 className="font-display text-base font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing Note */}
          <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-accent bg-accent/5 p-6 text-center">
            <h3 className="font-display text-lg font-bold text-primary">Transparent Pricing — No Hidden Costs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your tier price includes everything: bloodwork, GP consultation, protocol design, 8-week compound supply, injection training, and follow-up support. No surprise pharmacy bills. No extra consultation fees.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-primary px-4 py-16 text-center text-primary-foreground md:py-24">
        <div className="container">
          <h2 className="mx-auto max-w-xl font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Ready to Stop Guessing?
          </h2>
          <p className="mx-auto mt-4 max-w-lg opacity-90">
            Take the 2-minute assessment and get matched with the right protocol for your body, goals, and lifestyle.
          </p>
          <Link
            to="/quiz"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Start Your Assessment <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm opacity-70">No commitment required • Takes under 2 minutes</p>
        </div>
      </section>
    </div>
  );
}
