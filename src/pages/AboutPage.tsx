import { Link } from "react-router-dom";
import {
  Shield,
  Award,
  Heart,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Microscope,
  BookOpen,
} from "lucide-react";
import heroImg1 from "@/assets/funnel-hero-1.jpg";
import heroImg3 from "@/assets/funnel-hero-3.jpg";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import { entityClusters } from "@/lib/seo";
import SEO from "@/components/SEO";

const credentials = [
  { icon: Award, title: "Pharmaceutical-Grade Compounds", desc: "All protocols use compounds that meet strict pharmaceutical quality standards." },
  { icon: Microscope, title: "Lab-Tested & Verified", desc: "Every batch independently tested with ≥99% purity. Certificates of Analysis available." },
  { icon: BookOpen, title: "Evidence-Based Protocols", desc: "Programs built on peer-reviewed research and clinical data — not trends or guesswork." },
  { icon: Globe, title: "International Standards", desc: "Sourcing, testing, and quality control aligned with global pharmaceutical benchmarks." },
];

const team = [
  {
    name: "Founder & Protocol Director",
    role: "Health Systems Architect",
    bio: "With a background in health optimization and pharmaceutical-grade compound research, our founder built Peptide South Africa to bridge the gap between clinical science and accessible health transformation.",
  },
  {
    name: "Clinical Advisory Team",
    role: "Protocol Design & Safety",
    bio: "Our protocols are reviewed by qualified health professionals who ensure every program is safe, effective, and personalized to individual needs.",
  },
  {
    name: "Client Success Team",
    role: "Guided Support & Check-ins",
    bio: "Dedicated specialists who guide each client through their transformation journey — from onboarding to results tracking and beyond.",
  },
];

const clientStories = [
  {
    name: "Michael T.",
    location: "Cape Town",
    result: "Lost 12 kg in 10 weeks",
    text: "I was skeptical at first, but the structured approach made all the difference. Everything was mapped out — I just followed the plan. By week 3, I could see real changes.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    location: "Johannesburg",
    result: "Down 2 dress sizes in 8 weeks",
    text: "After years of trying random diets and supplements, this was the first time I had a system. The weekly check-ins kept me accountable and the results speak for themselves.",
    rating: 5,
  },
  {
    name: "James K.",
    location: "Durban",
    result: "Full recovery from chronic injury",
    text: "My physio was amazed at the speed of my recovery. The protocol was simple, the support was excellent, and I'm now performing better than before the injury.",
    rating: 5,
  },
  {
    name: "Thandi N.",
    location: "Pretoria",
    result: "Cleared skin & improved energy",
    text: "Clean lab results, clear dosing, fast delivery. I came in for fat loss — skin, energy, and sleep all improved alongside.",
    rating: 5,
  },
];

const values = [
  { title: "Results Over Hype", desc: "We measure success by your outcomes, not our marketing claims." },
  { title: "Guided, Not Guessing", desc: "Every client gets a structured, step-by-step protocol — no confusion." },
  { title: "Accessible Premium", desc: "World-class quality at prices that don't exclude everyday people." },
  { title: "Transparency First", desc: "Open about our compounds, our process, and our results. Always." },
];

export default function AboutPage() {
  return (
    <>
      <SEO title="About Peptide South Africa | Premium Peptide Research Supplier" description="Peptide South Africa supplies 99%+ purity research peptides with third-party HPLC testing & COAs. Serving researchers across South Africa since 2024." path="/about" />
      <div className="flex flex-col">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-card">
        <div className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              About Peptide South Africa
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              We're Building the Future of{" "}
              <span className="text-gradient">Personalized Health</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Peptide South Africa isn't a supplement store. It's a guided health
              transformation system — built on science, personalized to you,
              and focused entirely on results.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-border bg-background py-16">
        <div className="container px-4">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-primary">Our Mission</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Make World-Class Health Protocols Accessible to Everyone
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We believe that transformative health solutions shouldn't be
                reserved for the elite. By combining pharmaceutical-grade
                compounds with personalized, guided protocols, we're making
                premium health transformation available to people across South
                Africa — at prices that make sense.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every protocol we design is rooted in clinical research,
                tailored to your unique body and goals, and supported by a
                team that's genuinely invested in your results.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={heroImg1}
                alt="Health transformation"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Credentials & Certifications */}
      <section className="bg-card py-16">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Credentials & Quality
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Why You Can Trust Us
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {credentials.map((c, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 shadow-card">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-background py-16">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              The Team
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              People Behind Your Protocol
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {team.map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{t.name}</h3>
                <p className="text-xs text-primary font-medium">{t.role}</p>
                <p className="mt-3 text-sm text-muted-foreground">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-card py-16">
        <div className="container px-4">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              <img src={heroImg3} alt="Wellness" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-primary">Our Values</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                What We Stand For
              </h2>
              <div className="mt-6 space-y-4">
                {values.map((v, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-trust" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Success Stories */}
      <section className="bg-background py-16">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              Client Success
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Real People, Real Transformations
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {clientStories.map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex gap-1">
                  {Array(s.rating).fill(null).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-badge text-badge" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">"{s.text}"</p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                  <span className="mt-2 inline-block rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
                    {s.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-16">
        <div className="container px-4">
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-4">
            {[
              { stat: "500+", label: "Active Clients" },
              { stat: "5,000+", label: "Protocols Delivered" },
              { stat: "99%", label: "Quality Certified" },
              { stat: "1–3", label: "Day Delivery" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-3xl font-bold text-gradient">{s.stat}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient py-16">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to Start Your Transformation?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Take a 2-minute assessment and discover the protocol designed for your body and goals.
          </p>
          <Link
            to="/quiz?intent=consult"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-10 py-4 text-lg font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Book a Consultation <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <RelatedContent
        title="Explore Our Protocols"
        links={[
          ...entityClusters.fatLoss.links.slice(0, 2),
          ...entityClusters.healing.links.slice(0, 1),
          entityClusters.trust.links.find(l => l.href === "/faq")!,
        ]}
      />
    </div>
    </>
  );
}
