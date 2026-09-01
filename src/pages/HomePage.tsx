import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
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
import HeroShop from "@/components/HeroShop";
import TextUsSection from "@/components/TextUsSection";
import CategoryShowcase from "@/components/CategoryShowcase";
import FeaturedProductRail from "@/components/FeaturedProductRail";
import EcosystemSection from "@/components/EcosystemSection";
import { organizationSchema, websiteSchema, localBusinessSchema, entityClusters } from "@/lib/seo";
import SEO from "@/components/SEO";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { pageCopy } from "@/lib/marketCopy";
import TrustComplianceSection from "@/components/TrustComplianceSection";

const researchAreas = [
  { icon: Flame, title: "Metabolic Pathways", desc: "Laboratory models involving energy regulation and receptor signalling" },
  { icon: Dumbbell, title: "Repair Signalling", desc: "Research into cellular repair, angiogenesis and tissue-response pathways" },
  { icon: Heart, title: "Recovery Models", desc: "Analytical work involving inflammatory and recovery-related markers" },
  { icon: Sparkles, title: "Dermal Research", desc: "Models involving collagen signalling, copper peptides and cellular renewal" },
  { icon: Leaf, title: "Immune Signalling", desc: "Research involving mucosal, innate and adaptive immune pathways" },
  { icon: Brain, title: "Neuro Research", desc: "Laboratory models involving neuropeptide and cellular communication pathways" },
];

const buyingStandards = [
  {
    title: "Batch produced. Batch documented.",
    text: "Reports are connected to the source sample or published lot and presented with a clear scope notice.",
    result: "Traceable documentation",
  },
  {
    title: "Research information without guesswork.",
    text: "Product pages prioritise compound identity, research context, storage, batch information and fulfilment details.",
    result: "Clear product records",
  },
  {
    title: "Local support after checkout.",
    text: "The branded portal keeps orders, acknowledgements, source reports and the Peptide SA tracker within one connected journey.",
    result: "Store · portal · tracker",
  },
];

const whyItWorks = [
  { title: "Research-Grade Presentation", desc: "Professional packaging, storage information and lot-level records." },
  { title: "Batch Transparency", desc: "Published source and batch reports show what was submitted and tested." },
  { title: "Clear Report Scope", desc: "Every report is presented without claiming tests or conclusions it does not contain." },
  { title: "Independent Verification", desc: "Third-party analytical reports are published where available." },
  { title: "Connected Records", desc: "Orders, receipts, documents and tracker access stay connected in your portal." },
  { title: "Dependable Support", desc: "Local order, batch, shipping and research-use support from Cape Town." },
];

export default function HomePage() {
  const { market, lang } = useMarket();
  const home = pageCopy("home", market);
  return (
    <div id="top" className="flex flex-col">
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
      {/* ===================== HERO (shop-first) ===================== */}
      <HeroShop />

      {/* ===================== CATEGORY SHOWCASES (Whoosh-style) ===================== */}
      <CategoryShowcase
        eyebrow="Metabolic Research"
        title="Compounds for advanced pathway research."
        blurb="Triple- and dual-agonist research peptides presented with clear compound, storage and batch information."
        productIds={["1", "4"]}
        shopHref="/shop?category=GLP"
        accent="weight-loss"
      />
      <CategoryShowcase
        eyebrow="Wellness & Longevity"
        title="Mitochondrial and cellular research."
        blurb="Research peptides and blends studied in laboratory models involving cellular energy, signalling and longevity pathways."
        productIds={["5", "8", "2"]}
        shopHref="/shop?category=Longevity"
        accent="longevity"
      />
      <CategoryShowcase
        eyebrow="Recovery"
        title="Repair and recovery pathway research."
        blurb="Research compounds studied in laboratory models involving repair signalling, angiogenesis and cellular response."
        productIds={["6", "3"]}
        shopHref="/shop?category=Healing"
        accent="recovery"
      />


      {/* ===================== FIND MY PROTOCOL BAND ===================== */}
      <section className="border-y border-primary/15 bg-gradient-to-br from-primary/5 via-background to-primary/5 py-10 md:py-12">
        <div className="container px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">60-second match</span>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl">
                Not sure where to start?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Answer six quick questions to organise the catalogue around your area of research. The existing quiz remains your guided starting point.
              </p>
            </div>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-hero-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              Open the research quiz <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS RAIL ===================== */}
      <FeaturedProductRail />

      {/* ===================== TEXT US (WhatsApp) ===================== */}
      <TextUsSection />

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
                title: "Define the Research Area",
                desc: "Use the quiz or browse by compound class to organise the catalogue around the pathway you are studying.",
              },
              {
                step: "2",
                icon: Shield,
                title: "Review the Documentation",
                desc: "Compare identity, batch information, storage guidance and the exact scope of published analytical reports.",
              },
              {
                step: "3",
                icon: Clock,
                title: "Order and Keep Records",
                desc: "Follow checkout through fulfilment, retain your consent receipt and continue into the branded tracker.",
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
              Browse research compounds <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== THE OFFER ===================== */}
      <section className="bg-card py-16 md:py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Research Supply Standard
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Clear records from catalogue to delivery
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              A connected research buying experience built around identity, batch transparency, careful fulfilment and durable order records.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {/* What's Included */}
              <div className="rounded-2xl border border-border bg-background p-6 shadow-card sm:p-8">
                <h3 className="mb-5 font-display text-xl font-semibold text-foreground">
                  Included with the experience
                </h3>
                <ul className="space-y-4">
                  {[
                    "Research-use-only product labelling",
                    "Published source or batch reports where available",
                    "Clear report-scope notices",
                    "Versioned checkout acknowledgement receipt",
                    "Order and fulfilment timeline",
                    "Branded tracker hand-off",
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
                  Research areas represented
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {researchAreas.map((r, i) => (
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

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Products are supplied for lawful laboratory research only and are not for human or animal use or consumption.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== SOCIAL PROOF ===================== */}
      <section className="bg-background py-16 md:py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              The Buying Standard
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              What a credible research supplier should make clear
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {buyingStandards.map((t, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.text}</p>
                <div className="mt-4 border-t border-border pt-3">
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
              Built for research integrity and repeatable operations
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

      {/* ===================== TRUST & COMPLIANCE ARCHITECTURE ===================== */}
      <TrustComplianceSection />

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
              Explore compound profiles, research summaries, literature links and record-keeping tools in one branded resource for the research community.
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
        title="Explore Research Areas"
        links={[
          ...entityClusters.fatLoss.links.slice(0, 2),
          entityClusters.fatLoss.links.find(l => l.href === "/buy-retatrutide-south-africa")!,
          ...entityClusters.healing.links.slice(0, 1),
          entityClusters.healing.links.find(l => l.href === "/buy-bpc-157-south-africa")!,
          ...entityClusters.growthHormone.links.slice(0, 1),
          ...entityClusters.trust.links.slice(0, 2),
        ]}
      />

      {/* ===================== ECOSYSTEM ===================== */}
      <EcosystemSection />

      {/* ===================== BOTTOM CTA ===================== */}
      <section className="bg-hero-gradient py-14 md:py-20">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            Your free Peptide Tracker is ready.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Plan your routine, record notes and keep your progress in one mobile-friendly place.
            Free shipping still applies over R1,500 across South Africa.
          </p>
          <a
            href="https://peptide-south-africa.co.za/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-10 py-4 text-lg font-bold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Open Free Tracker <ArrowRight className="h-5 w-5" />
          </a>
          <p className="mt-3 text-sm text-primary-foreground/70">
            New to peptides? <Link to="/quiz" className="underline">Start with the quiz</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
