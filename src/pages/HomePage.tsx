import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Target,
  Heart,
  Sparkles,
  Flame,
  Dumbbell,
  Leaf,
  Brain,
  Award,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import RelatedContent from "@/components/RelatedContent";
import MediaLogos from "@/components/MediaLogos";
import HeroShop from "@/components/HeroShop";
import FeaturedProductRail from "@/components/FeaturedProductRail";
import CustomerProofStrip from "@/components/CustomerProofStrip";
import SectionReveal from "@/components/SectionReveal";
import { organizationSchema, websiteSchema, localBusinessSchema, entityClusters } from "@/lib/seo";
import SEO from "@/components/SEO";

const results = [
  { icon: Flame, title: "Visceral Fat Loss", desc: "Targeted reduction in stubborn belly and organ fat" },
  { icon: Dumbbell, title: "Guaranteed Healing", desc: "Accelerated recovery from injury and tissue repair" },
  { icon: Heart, title: "Better Recovery", desc: "Enhanced athletic performance and faster bounce-back" },
  { icon: Sparkles, title: "Clear Skin & Hair Growth", desc: "Visible improvement in skin clarity and hair thickness" },
  { icon: Leaf, title: "Gut Health & Immunity", desc: "Strengthened immune system and digestive function" },
  { icon: Brain, title: "Mental Clarity", desc: "Sharper focus and improved cognitive performance" },
];

const testimonials = [
  {
    name: "Michael T.",
    location: "Cape Town, ZA",
    text: "I lost 8 kg in 6 weeks. The protocol was so simple — no guessing, no confusion. Just followed the plan and the results came.",
    rating: 5,
    result: "Lost 8 kg in 6 weeks",
  },
  {
    name: "Anja R.",
    location: "Berlin, DE",
    text: "Endlich ein Anbieter mit echten Laborberichten und schnellem DHL-Versand. Innerhalb von 5 Tagen geliefert, klare Dosierung im Protokoll.",
    rating: 5,
    result: "Down 2 dress sizes",
  },
  {
    name: "James K.",
    location: "Durban, ZA",
    text: "My recovery time between training sessions dropped dramatically. I'm performing better at 38 than I did at 28.",
    rating: 5,
    result: "50% faster recovery",
  },
];

const whyItWorks = [
  { title: "German Certified Quality", desc: "Every compound meets the highest international pharmaceutical standards." },
  { title: "No Random Products", desc: "You get a structured protocol, not a shopping cart of guesses." },
  { title: "No Guessing Doses", desc: "Exact dosing schedules tailored to your body and goals." },
  { title: "No Trial and Error", desc: "Proven protocols based on clinical research and real results." },
  { title: "Structured System", desc: "Week-by-week guidance so you always know what to do next." },
  { title: "Personalized Approach", desc: "Your protocol is built around YOUR body, goals, and lifestyle." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <SEO title="Buy Peptides Online — South Africa &amp; Germany / EU" description="GP-led peptide service. ≥99% purity, German-certified, third-party lab tested. Fat loss, healing &amp; performance. Same-day dispatch in SA · 4–7 day DHL to Germany / EU." path="/" />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={localBusinessSchema} />
      {/* ===================== HERO (shop-first) ===================== */}
      <HeroShop />

      {/* ===================== FEATURED PRODUCTS RAIL ===================== */}
      <FeaturedProductRail />

      {/* ===================== REAL CUSTOMERS ===================== */}
      <CustomerProofStrip />

      {/* ===================== AS SEEN IN ===================== */}
      <SectionReveal>
        <MediaLogos variant="muted" />
      </SectionReveal>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="border-y border-border bg-background py-16 md:py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Simple 3-Step Process
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              How It Works
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: Target,
                title: "Answer a Few Questions",
                desc: "Tell us about your goals, lifestyle, and what you've tried before. Takes under 2 minutes.",
              },
              {
                step: "2",
                icon: Shield,
                title: "Get Your Protocol",
                desc: "Receive a personalized protocol designed specifically for your body and objectives.",
              },
              {
                step: "3",
                icon: Clock,
                title: "Start Your Transformation",
                desc: "Begin your guided journey with weekly support, tracking, and expert guidance.",
              },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <s.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-hero-gradient text-xs font-bold text-primary-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-8 py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              Buy Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== THE OFFER ===================== */}
      <section className="bg-card py-16 md:py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Flagship Program
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              12-Week Fat Loss Protocol
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              A complete, guided transformation system — not a product. Everything you need, mapped out week by week.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {/* What's Included */}
              <div className="rounded-2xl border border-border bg-background p-6 shadow-card sm:p-8">
                <h3 className="mb-5 font-display text-xl font-semibold text-foreground">
                  What's Included
                </h3>
                <ul className="space-y-4">
                  {[
                    "Personalized protocol plan",
                    "Monthly supply (guided system)",
                    "Weekly check-ins & guidance",
                    "Progress tracking dashboard",
                    "WhatsApp support access",
                    "Dosing schedules & timelines",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-trust" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Results You Can Expect */}
              <div className="rounded-2xl border border-border bg-background p-6 shadow-card sm:p-8">
                <h3 className="mb-5 font-display text-xl font-semibold text-foreground">
                  Results You Can Expect
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {results.map((r, i) => (
                    <div key={i} className="text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <r.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">{r.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-border bg-background p-6 text-center shadow-card">
                <p className="text-sm font-medium text-muted-foreground">Monthly</p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">
                  R1,999<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Flexible, cancel anytime</p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-muted"
                >
                  Buy Monthly — R1,999
                </Link>
              </div>
              <div className="relative rounded-2xl border-2 border-primary bg-background p-6 text-center shadow-glow">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
                  BEST VALUE
                </span>
                <p className="text-sm font-medium text-muted-foreground">Full 12-Week Program</p>
                <p className="mt-1 font-display text-3xl font-bold text-gradient">
                  R4,999
                </p>
                <p className="mt-2 text-xs text-trust font-semibold">Save R997 — 17% off</p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
                >
                  Buy Now — R4,999 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              ⚡ Limited spots available for personalized onboarding
            </p>
          </div>
        </div>
      </section>

      {/* ===================== SOCIAL PROOF ===================== */}
      <section className="bg-background py-16 md:py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Real Clients, Real Results
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex gap-1">
                  {Array(t.rating).fill(null).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-badge text-badge" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">"{t.text}"</p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                  <span className="mt-2 inline-block rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
                    {t.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== (clinician hero removed for conversion focus) ===================== */}

      {/* ===================== WHY THIS WORKS ===================== */}
      <section className="border-y border-border bg-card py-16 md:py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              The Difference
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Why This Works When Other Approaches Fail
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyItWorks.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-5 shadow-card">
                <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== RESEARCH HUB ===================== */}
      <section className="bg-background py-16 md:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Peptide Research Hub
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Access our comprehensive database of 98+ peptides with clinical research, dosage calculators, stack builders, and scientific literature — free for the research community.
            </p>
            <Link
              to="/research"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-8 py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              Explore Research Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== ENTITY LINKS ===================== */}
      <RelatedContent
        title="Explore By Goal"
        links={[
          ...entityClusters.fatLoss.links.slice(0, 2),
          ...entityClusters.healing.links.slice(0, 1),
          ...entityClusters.growthHormone.links.slice(0, 1),
          ...entityClusters.trust.links.slice(0, 2),
        ]}
      />

      {/* ===================== BOTTOM CTA ===================== */}
      <section className="bg-hero-gradient py-14 md:py-20">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to start? Save 10% on your first order.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Use code <span className="font-mono font-bold">RIDETHETIDE10</span> at checkout.
            Free shipping over R1,500 (SA) or €75 (DE / EU). Same-day dispatch in SA · DHL within 24 h to Germany / EU.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-10 py-4 text-lg font-bold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Buy Now <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Or <Link to="/quiz" className="underline">take the 2-min quiz</Link> for a personalised protocol
          </p>
        </div>
      </section>
    </div>
  );
}
