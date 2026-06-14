import { Link } from "react-router-dom";
import {
  ArrowRight,
  Star,
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
import HeroEditorial from "@/components/HeroEditorial";
import GuaranteeBadge from "@/components/GuaranteeBadge";
import TestimonialsRail, { type TestimonialCard } from "@/components/TestimonialsRail";
import { KITS } from "@/data/kits";

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

const testimonials: TestimonialCard[] = [
  {
    kind: "quote",
    title: "Life-changing",
    quote: "The program made it simple — I just followed it. Lost 8 kg in six weeks and my energy is back. The clinician review gave me confidence I was doing it safely.",
    name: "Michael T.",
    result: "Lost 8 kg in 6 weeks",
    beforeAfter: {
      before: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
      after: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    kind: "video",
    name: "Tati",
    result: "GLP-1 program",
    protocolLabel: "Retatrutide protocol",
    videoPoster: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
  },
  {
    kind: "quote",
    title: "Metabolic Support",
    quote: "Reversed my pre-diabetes markers, blood pressure normalised, and I sleep through the night. This program gave me my health back.",
    name: "Lerato P.",
    result: "Down 2 dress sizes",
    beforeAfter: {
      before: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
      after: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80",
    },
  },
];

const faqs = [
  { q: "How is this different from a regular pharmacy?", a: "Programs are personalised to your goal and biology, delivered discreetly, and where clinically required reviewed by a licensed South African physician — all from one membership." },
  { q: "Do I need to book a consultation first?", a: "No. You complete the assessment, join your program and check out. Where clinically required, a licensed physician will review your eligibility before treatment activation — usually within one business day." },
  { q: "Are the peptides lab tested?", a: "Yes. Every batch is independently HPLC tested with a Certificate of Analysis published online." },
  { q: "Can I cancel my membership?", a: "Yes. Memberships are month-to-month and cancellable at any time from your account." },
  { q: "Is this legal in South Africa?", a: "Peptides are dispensed in line with South African medical and pharmacy regulations. Programs follow GP-led clinical oversight." },
];

const zar = (n: number) => `R${n.toLocaleString("en-ZA")}`;

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

      {/* ===== HERO ===== */}
      <HeroEditorial sub={home.sub} />

      {/* ===== CHOOSE YOUR GOAL ===== */}
      <section className="border-t border-border bg-card py-20">
        <div className="container px-4">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-accent">Step 02 — Choose your goal</p>
              <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
                Customers buy <span className="italic text-clay">outcomes</span>.
              </h2>
              <p className="mt-3 text-foreground/70">Peptides are the engine. Pick the outcome that matters to you.</p>
            </div>
            <Link to="/assessment" className="eyebrow inline-flex items-center gap-1.5 text-clay hover:underline">
              Not sure? Take the assessment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {goals.map((g) => (
              <Link
                key={g.slug}
                to={`/assessment?goal=${g.slug}`}
                className="group relative flex flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-clay hover:shadow-card-hover"
              >
                <g.icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-2xl text-foreground">{g.label}</h3>
                <p className="mt-2 flex-1 text-sm text-foreground/65">{g.blurb}</p>
                <span className="eyebrow mt-4 inline-flex items-center gap-1 text-clay">
                  Start <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BUNDLED KITS ===== */}
      <section className="bg-background py-20">
        <div className="container px-4">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-accent">Bundled Kits</p>
              <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
                Pre-built for your goal.
              </h2>
              <p className="mt-3 text-foreground/70">Combinations designed by our clinical team. One subscription. Everything you need.</p>
            </div>
            <Link to="/shop" className="eyebrow text-clay hover:underline">Browse all programs →</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {KITS.map((kit) => (
              <Link
                key={kit.id}
                to={`/assessment?goal=${kit.goal}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  <img src={kit.image} alt={kit.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <span className="eyebrow absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-foreground shadow-card">
                    Save {zar(kit.savings)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="eyebrow text-clay">{kit.goal.replace("-", " ")}</p>
                  <h3 className="mt-2 font-display text-2xl text-foreground">{kit.name}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{kit.tagline}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {kit.peptides.map((p) => (
                      <li key={p} className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-[10px] text-foreground/70">
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                    <div>
                      <p className="font-display text-2xl text-foreground">{zar(kit.pricePerMonth)}<span className="text-sm text-muted-foreground">/mo</span></p>
                      <p className="eyebrow text-foreground/60">{kit.protocolWeeks}-week program</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-clay px-3 py-1.5 text-xs font-semibold text-background">
                      Start <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="border-y border-border bg-card py-20">
        <div className="container px-4">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow text-accent">How it works</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">From assessment to activation.</h2>
            <p className="mt-3 text-foreground/70">Simple, clinically considered, built for South Africa.</p>
          </div>

          <ol className="grid gap-6 md:grid-cols-5">
            {steps.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-border bg-background p-6">
                <span className="eyebrow text-clay">{s.n}</span>
                <s.icon className="mt-3 h-6 w-6 text-accent" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-xl leading-tight text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-full bg-clay px-8 py-3.5 font-semibold text-background shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              Take the Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROGRAMS ===== */}
      <section className="bg-background py-20">
        <div className="container mb-10 px-4">
          <p className="eyebrow text-accent">Programs</p>
          <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Built around your outcome.</h2>
          <p className="mt-3 max-w-2xl text-foreground/70">Memberships include the program plan, supply, and ongoing clinical support.</p>
        </div>
        <FeaturedProductRail />
        <div className="container mt-10 px-4">
          <GuaranteeBadge variant="bar" />
        </div>
      </section>

      {/* ===== TESTIMONIALS (Rivo style) ===== */}
      <section className="border-y border-border bg-card py-20">
        <div className="container px-4">
          <TestimonialsRail items={testimonials} />
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-background py-20">
        <div className="container px-4">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow text-accent">FAQ</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Common questions.</h2>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
            {faqs.map((f, i) => (
              <details key={i} className="group px-6 py-5 [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between font-display text-xl text-foreground">
                  {f.q}
                  <span className="ml-4 text-clay transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative isolate overflow-hidden bg-primary py-24">
        <div className="container px-4 text-center">
          <p className="eyebrow text-primary-foreground/70">Get started today</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-5xl leading-[1.05] text-primary-foreground sm:text-7xl">
            Your <span className="italic text-clay">peptide plan</span> — in 60 seconds.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
            Built for your goal. Reviewed by a licensed physician where clinically required. Delivered discreetly across South Africa.
          </p>
          <Link
            to="/assessment"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-8 py-4 text-base font-semibold text-background shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            Take the Assessment <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mx-auto mt-8 flex max-w-md justify-center">
            <GuaranteeBadge variant="inline" />
          </div>
        </div>
      </section>
    </div>
  );
}
