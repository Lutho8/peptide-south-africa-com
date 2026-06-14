import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Flame,
  Dumbbell,
  Heart,
  Sparkles,
  Leaf,
  Activity,
  ClipboardCheck,
  Stethoscope,
  Package,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import FeaturedProductRail from "@/components/FeaturedProductRail";
import { organizationSchema, websiteSchema, localBusinessSchema } from "@/lib/seo";
import SEO from "@/components/SEO";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { pageCopy } from "@/lib/marketCopy";

const goals = [
  { slug: "weight-loss", label: "Lose Weight", icon: Flame, blurb: "GLP-1 program with clinical oversight." },
  { slug: "recovery", label: "Improve Recovery", icon: Dumbbell, blurb: "Heal faster. Train harder." },
  { slug: "energy", label: "Increase Energy", icon: Sparkles, blurb: "Sharper days. Steadier output." },
  { slug: "longevity", label: "Age Better", icon: Leaf, blurb: "Mitochondrial & longevity peptides." },
  { slug: "performance", label: "Improve Performance", icon: Activity, blurb: "Strength, output and recovery." },
];

const steps = [
  { n: "01", icon: ClipboardCheck, title: "Take the Assessment", desc: "9 questions. Under 3 minutes." },
  { n: "02", icon: Sparkles, title: "Get a Personalised Program", desc: "Matched to your goal, age and biology." },
  { n: "03", icon: Package, title: "Join Today", desc: "Start your membership in one tap." },
  { n: "04", icon: Stethoscope, title: "Clinical Review", desc: "Where clinically required, a licensed physician reviews your eligibility." },
  { n: "05", icon: Heart, title: "Start Your Journey", desc: "Discreet delivery. Ongoing support." },
];

const testimonials = [
  { name: "Michael T.", location: "Cape Town", text: "Lost 8 kg in 6 weeks. The program was clear and simple — I just followed it.", result: "Lost 8 kg in 6 weeks" },
  { name: "Lerato P.", location: "Johannesburg", text: "Down two dress sizes in 10 weeks with lab work to back it up. No guesswork.", result: "Down 2 dress sizes" },
  { name: "James K.", location: "Durban", text: "My recovery between training sessions dropped dramatically. Performing better at 38 than I did at 28.", result: "50% faster recovery" },
];

const faqs = [
  { q: "How is this different from a regular pharmacy?", a: "Programs are personalised to your goal and biology, delivered discreetly, and where clinically required reviewed by a licensed South African physician — all from one membership." },
  { q: "Do I need to book a consultation first?", a: "No. You complete the assessment, join your program and check out. Where clinically required, a licensed physician will review your eligibility before treatment activation — usually within one business day." },
  { q: "Are the peptides lab tested?", a: "Yes. Every batch is independently HPLC tested with a Certificate of Analysis published online." },
  { q: "Can I cancel my membership?", a: "Yes. Memberships are month-to-month and cancellable at any time from your account." },
  { q: "Is this legal in South Africa?", a: "Peptides are dispensed in line with South African medical and pharmacy regulations. Programs follow GP-led clinical oversight." },
];

export default function HomePage() {
  const { market, lang } = useMarket();
  const home = pageCopy("home", market);

  return (
    <div className="flex flex-col">
      <SEO
        title={home.title}
        description={home.description}
        path={marketPath("/", market) === "/" ? "/" : marketPath("/", market)}
        lang={lang}
        alternates={buildAlternates("/")}
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={localBusinessSchema} />

      {/* ===================== 1. HERO ===================== */}
      <section className="relative isolate overflow-hidden border-b border-border bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[hsl(var(--gold))]/15 blur-3xl" />
        </div>
        <div className="container grid items-center gap-12 px-4 py-16 md:grid-cols-[1.1fr,0.9fr] md:py-24 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              South Africa's first peptide-forward telehealth platform
            </div>
            <h1 className="mt-5 font-display text-[2.75rem] leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem]">
              Get your personalised <span className="italic text-accent">health plan</span> in 1 minute.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {home.sub} Complete a quick assessment and discover the peptides designed for your goals.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/assessment"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Take the Assessment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-7 py-4 text-base font-medium text-foreground hover:bg-muted"
              >
                Browse programs
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> GP-led clinical oversight</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-accent" /> ≥99% HPLC lab tested</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-accent" /> POPIA-compliant · ZAR pricing</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-card-hover">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80"
                alt="Personalised peptide telehealth"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                width={900}
                height={1125}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent p-6">
                <p className="font-display text-xl text-primary-foreground">"My program was ready in minutes. Lost 8 kg in six weeks."</p>
                <p className="mt-1 text-xs text-primary-foreground/80">— Michael T., Cape Town</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-card-hover md:block">
              <div className="flex items-center gap-1 text-[hsl(var(--gold))]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-1 text-xs font-semibold text-foreground">4.9 · 1,200+ members</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 2. CHOOSE YOUR GOAL ===================== */}
      <section className="bg-card py-20">
        <div className="container px-4">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Step 1</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Choose your goal.</h2>
            <p className="mt-3 text-muted-foreground">Customers buy outcomes. Peptides are the engine.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {goals.map((g) => (
              <Link
                key={g.slug}
                to={`/assessment?goal=${g.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:border-accent hover:shadow-card-hover"
              >
                <g.icon className="h-7 w-7 text-accent" />
                <h3 className="mt-5 font-display text-2xl text-foreground">{g.label}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{g.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Start <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 3. HOW IT WORKS ===================== */}
      <section id="how-it-works" className="bg-background py-20">
        <div className="container px-4">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">How it works</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">From assessment to activation.</h2>
            <p className="mt-3 text-muted-foreground">Simple, clinically considered, built for South Africa.</p>
          </div>

          <ol className="grid gap-6 md:grid-cols-5">
            {steps.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
                <span className="font-mono text-xs text-[hsl(var(--gold))]">{s.n}</span>
                <s.icon className="mt-2 h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-xl leading-tight text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              Take the Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== 4. PROGRAMS ===================== */}
      <section className="border-y border-border bg-card py-20">
        <div className="container mb-10 px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Programs</p>
          <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Built around your outcome.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Memberships include the program plan, supply, and ongoing clinical support.</p>
        </div>
        <FeaturedProductRail />
      </section>

      {/* ===================== 5. SUCCESS STORIES ===================== */}
      <section className="bg-background py-20">
        <div className="container px-4">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Success stories</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Real members. Real outcomes.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="rounded-2xl border border-border bg-card p-7">
                <div className="flex gap-1 text-[hsl(var(--gold))]">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 font-display text-xl leading-snug text-foreground">"{t.text}"</blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                  <span className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{t.result}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 6. FAQ ===================== */}
      <section className="border-t border-border bg-card py-20">
        <div className="container px-4">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">FAQ</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Common questions.</h2>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-background">
            {faqs.map((f, i) => (
              <details key={i} className="group px-6 py-5 [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between font-display text-lg text-foreground">
                  {f.q}
                  <span className="ml-4 text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 7. FINAL CTA ===================== */}
      <section className="relative isolate overflow-hidden bg-primary py-24">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-accent/40 blur-3xl" />
          <div className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[hsl(var(--gold))]/30 blur-3xl" />
        </div>
        <div className="container px-4 text-center">
          <h2 className="mx-auto max-w-3xl font-display text-5xl leading-[1.05] text-primary-foreground sm:text-6xl">
            Get your <span className="italic text-[hsl(var(--gold))]">peptide plan</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
            Built for your goal. Reviewed by a licensed physician where clinically required. Delivered discreetly across South Africa.
          </p>
          <Link
            to="/assessment"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--gold))] px-8 py-4 text-base font-semibold text-primary shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            Get Peptide Plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
