import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  CheckCircle,
  Quote,
  FlaskConical,
  Users,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import SEO from "@/components/SEO";

const SITE_URL = "https://tide-shop-clone.lovable.app";

const credentials = [
  { icon: GraduationCap, title: "BSc Biochemistry & Physiology", detail: "University of Cape Town" },
  { icon: Stethoscope, title: "Certified Peptide Therapist", detail: "American Academy of Anti-Aging Medicine (A4M)" },
  { icon: Award, title: "Advanced Functional Medicine", detail: "Institute for Functional Medicine (IFM)" },
  { icon: ShieldCheck, title: "GMP & HPLC Compliance Trained", detail: "International Society for Pharmaceutical Engineering" },
];

const principles = [
  {
    icon: FlaskConical,
    title: "Lab-verified before sale",
    desc: "Every batch we sell ships with an HPLC Certificate of Analysis from an independent third-party lab. I review and sign each one personally before stock is released.",
  },
  {
    icon: ClipboardCheck,
    title: "Protocols, not products",
    desc: "I won't sell you a vial without context. Every order is matched to a written dosing schedule, expected timeline, and clear safety guardrails.",
  },
  {
    icon: Users,
    title: "Real human accountability",
    desc: "Questions go through me or my clinical team — not a chatbot, not an offshore call centre. You always know who is answering.",
  },
  {
    icon: MessageCircle,
    title: "Transparent on what we don't know",
    desc: "Peptides are research compounds. If the evidence is thin, I'll tell you. No hype, no miracle promises.",
  },
];

const stats = [
  { value: "1,200+", label: "Clients guided" },
  { value: "98", label: "Peptides catalogued" },
  { value: "100%", label: "Batches HPLC-tested" },
  { value: "8 yrs", label: "In peptide therapy" },
];

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Lutho Kote",
  jobTitle: "Peptide & Bio-Health Expert",
  worksFor: { "@type": "Organization", name: "Ride The Tide" },
  url: `${SITE_URL}/clinician`,
  sameAs: [`${SITE_URL}/about`],
  description:
    "Founder and lead clinician at Ride The Tide. Certified peptide therapist with 8+ years experience designing personalized peptide protocols for fat loss, recovery, longevity and performance.",
  alumniOf: [
    { "@type": "EducationalOrganization", name: "University of Cape Town" },
    { "@type": "Organization", name: "American Academy of Anti-Aging Medicine" },
  ],
  knowsAbout: [
    "Peptide therapy",
    "GLP-1 agonists",
    "BPC-157",
    "Tirzepatide",
    "Retatrutide",
    "Tesamorelin",
    "Functional medicine",
    "Hormone optimization",
  ],
};

export default function ClinicianPage() {
  return (
    <>
      <SEO title="For Clinicians — Partner With Ride The Tide South Africa" description="South African GPs and practitioners: prescribe and supply German-certified peptides through Ride The Tide's compliant, GP-led protocol pathway." path="/clinician" />
      <>
      <JsonLd data={personSchema} />
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Clinician", href: "/clinician" },
        ]}
      />

      {/* HERO */}
      <section className="border-b border-border bg-card">
        <div className="container px-4 py-12 md:py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[280px_1fr]">
            <div className="mx-auto md:mx-0">
              <div className="relative">
                <div className="relative h-64 w-64 overflow-hidden rounded-3xl bg-hero-gradient shadow-glow ring-4 ring-card">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-8xl font-black text-primary-foreground/95">
                      LK
                    </span>
                  </div>
                </div>
                <span className="absolute -right-3 top-5 rounded-full bg-trust px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-card">
                  ✓ Verified
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Founder · Lead Clinician
              </span>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Lutho Kote
              </h1>
              <p className="mt-1 font-display text-lg text-muted-foreground">
                Peptide & Bio-Health Expert
              </p>
              <p className="mt-5 text-base text-foreground/90">
                I'm Lutho. I founded Ride The Tide because South Africans were
                being forced to choose between sketchy international peptide
                vendors and a healthcare system that hasn't caught up with the
                research. Neither is good enough. So I built a third option —
                clinical-grade peptides, real protocols, and a practitioner you
                can actually reach.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/quiz"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
                >
                  Get a Personalized Protocol <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/491624747159"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                >
                  Message Me on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-background">
        <div className="container px-4 py-8">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDENTIALS */}
      <section className="bg-card py-14 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Credentials
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Trained where it matters
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {credentials.map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-card"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {c.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-background py-14 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                How I Practice
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Four non-negotiables
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {principles.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-trust/10">
                    <p.icon className="h-5 w-5 text-trust" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PERSONAL STATEMENT */}
      <section className="bg-card py-14 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <Quote className="h-10 w-10 text-primary/40" />
            <blockquote className="mt-3 font-display text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl">
              "I won't sell anything I wouldn't put in my own body, give to my
              partner, or recommend to my closest friends. That's the entire
              filter — and it's why our catalogue is smaller than the offshore
              guys, and our COA pile is taller."
            </blockquote>
            <p className="mt-5 text-sm font-semibold text-muted-foreground">
              — Lutho Kote
            </p>
          </div>
        </div>
      </section>

      {/* SAFETY COMMITMENT */}
      <section className="bg-background py-14">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-trust/30 bg-trust/5 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-trust" />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  My commitment to your safety
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {[
                    "I will never recommend a peptide without a documented protocol and dosing schedule.",
                    "I will refuse a sale if your medical history makes a compound unsafe — even when you ask me to.",
                    "I will publish the COA for every batch on the product page within 48 hours of arrival.",
                    "I will respond to clinical questions within one business day, personally or via my team.",
                    "If a product underperforms our purity standard, I will recall the entire batch — no exceptions.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-trust" />
                      <span className="text-sm text-foreground">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient py-14">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to work with a real clinician?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-primary-foreground/80">
            Take the 2-minute assessment and I'll review your goals personally
            before recommending a protocol.
          </p>
          <Link
            to="/quiz"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-card px-8 py-3.5 font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Start My Assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <RelatedContent
        title="Continue Exploring"
        links={[
          { label: "Our Lab Standards & COAs", href: "/about", description: "Third-party HPLC testing, batch tracking and COA archive." },
          { label: "12-Week Fat Loss Protocol", href: "/fat-loss-protocol", description: "Lutho's flagship guided program for sustainable body recomposition." },
          { label: "Peptide Research Hub", href: "/research", description: "Reviewed database of 98+ peptides with dosing & literature." },
          { label: "FAQ", href: "/faq", description: "Common questions on safety, shipping and protocol design." },
        ]}
      />
    </>
  );
}
