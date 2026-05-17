import { ExternalLink, FlaskConical, BookOpen, Calculator, Layers, Search } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";

const PEPTIDE_PRO_URL = "https://peptide-mastery.lovable.app";
const SITE_URL = "https://tide-shop-clone.lovable.app";

const researchHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/research#page`,
  name: "Peptide Research Hub",
  url: `${SITE_URL}/research`,
  description:
    "Comprehensive peptide research database with 98+ peptides, clinical citations, reconstitution calculator, stack builder, and dosage protocols.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: [
    { "@type": "Thing", name: "Peptide therapy" },
    { "@type": "Thing", name: "Retatrutide" },
    { "@type": "Thing", name: "BPC-157" },
    { "@type": "Thing", name: "Tesamorelin" },
    { "@type": "Thing", name: "Tirzepatide" },
    { "@type": "Thing", name: "GHK-Cu" },
  ],
  hasPart: [
    { "@type": "WebApplication", name: "Reconstitution Calculator", applicationCategory: "HealthApplication" },
    { "@type": "WebApplication", name: "Stack Builder", applicationCategory: "HealthApplication" },
    { "@type": "DataCatalog", name: "Peptide Research Library", description: "500+ scientific citations and clinical trial data." },
  ],
};

const tools = [
  { icon: Search, title: "Browse 98+ Peptides", desc: "Search and filter our complete research-grade peptide database.", color: "bg-accent/10 text-accent" },
  { icon: FlaskConical, title: "Peptide Blends", desc: "Explore pre-formulated blends with full dosage protocols and references.", color: "bg-primary/10 text-primary" },
  { icon: Layers, title: "Stack Builder", desc: "Create optimised peptide combinations based on your research goals.", color: "bg-trust/10 text-trust" },
  { icon: Calculator, title: "Reconstitution Calculator", desc: "Precise reconstitution and dosing calculator with multiple syringe types.", color: "bg-badge/10 text-badge" },
  { icon: BookOpen, title: "Research Library", desc: "500+ scientific citations and clinical trial data at your fingertips.", color: "bg-primary/10 text-primary" },
];

export default function ResearchHubPage() {
  return (
    <>
      <SEO title="Peptide Research Hub — 500+ Citations" description="Evidence-based peptide research with 500+ citations. Use our Protocol Pro tool to design and study compound stacks. Curated for South African researchers." path="/research" />
      <div className="flex flex-col">
      <JsonLd data={researchHubSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Research Hub", href: "/research" }]} />
      {/* Hero */}
      <section className="bg-hero-gradient py-16 sm:py-20">
        <div className="container px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">
            <FlaskConical className="h-4 w-4" /> Powered by Ride The Tide
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Peptide Research Hub
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            Your comprehensive peptide research database with 98+ peptides, clinical data, dosage calculators, and stacking tools — built for the research community.
          </p>
          <a
            href={PEPTIDE_PRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 active:scale-95"
          >
            Launch Research Hub <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 sm:py-20">
        <div className="container px-4">
          <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            Research Tools Available
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Everything you need for informed peptide research — free, evidence-based, and constantly updated.
          </p>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <a
                key={tool.title}
                href={PEPTIDE_PRO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary">
                  {tool.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{tool.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Embedded App */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="container px-4">
          <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            Explore the Database
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Browse peptides, check clinical data, and use research tools directly below.
          </p>
          <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-border shadow-card">
            <iframe
              src={PEPTIDE_PRO_URL}
              title="Peptide Protocol Pro — Research Hub"
              className="h-[600px] w-full sm:h-[750px]"
              allow="clipboard-write"
              loading="lazy"
            />
          </div>
          <div className="mt-6 text-center">
            <a
              href={PEPTIDE_PRO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Open in full screen <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
