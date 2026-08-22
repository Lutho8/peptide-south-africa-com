import { ArrowRight, CheckCircle2, FlaskConical, ShieldCheck, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";
import {
  STARTER_PATHWAYS,
  STORE_LINKS,
  guidedReviewLink,
  productStoreLink,
  resolveStarterProducts,
  starterBuilderLink,
} from "@/data/starterPathways";

export default function StarterPathwaysPage() {
  return (
    <>
      <SEO
        title="New to Peptides? Start Here | Peptide South Africa"
        description="A clear South African starting path for people new to GLP-1s and peptide research: understand guided versus research routes, then explore age-based research collections without dosage advice."
        path={STORE_LINKS.startHere}
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Peptide starter pathways for new South African customers",
        description: "Educational navigation for guided and research peptide pathways, organised by age-based research themes.",
      }} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Start Here" }]} />

      <section className="border-b border-border bg-hero-gradient py-12 text-primary-foreground md:py-16">
        <div className="container px-4 text-center">
          <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            A clear first step for South Africa
          </span>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-3xl font-bold sm:text-4xl md:text-5xl">
            New to GLP-1s and peptides? Start here.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            No comparison-site noise and no shopping-cart guesswork. First choose the correct pathway; then explore the store with clear context and an obvious next step.
          </p>
        </div>
      </section>

      <section className="container px-4 py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
            <Stethoscope className="h-7 w-7 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">Guided pathway</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">GLP-1s or personal health decisions</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If your question is about personal use, suitability, symptoms, interactions or outcomes, start with the guided assessment. Clinical decisions stay with the clinician.
            </p>
            <Link to={guidedReviewLink()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
              Start guided assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <FlaskConical className="h-7 w-7 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">Research pathway</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Catalog and laboratory research</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If you are comparing compounds for legitimate research, use the educational maps below, open each product page, verify its COA and build a transparent research basket.
            </p>
            <Link to={STORE_LINKS.researchShop} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/35 bg-background px-5 py-3 text-sm font-bold text-primary hover:bg-primary/5">
              Browse research catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Educational research maps</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Explore by life stage</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              These collections organise research topics; they do not recommend human use. Age alone cannot determine suitability, and no dose, frequency or medical outcome is implied.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-2">
            {STARTER_PATHWAYS.map((pathway) => {
              const compounds = resolveStarterProducts(pathway);
              return (
                <article id={pathway.id} key={pathway.id} className="scroll-mt-24 rounded-3xl border border-border bg-background p-5 shadow-card sm:p-7">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{pathway.label}</span>
                  <h3 className="mt-4 font-display text-xl font-bold text-foreground sm:text-2xl">{pathway.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pathway.summary}</p>
                  <div className="mt-5 space-y-2">
                    {compounds.map((product, index) => (
                      <Link
                        key={product.slug}
                        to={productStoreLink(product.slug)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/35 hover:bg-primary/[0.035]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-trust" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-foreground">{product.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{pathway.researchThemes[index]}</span>
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link to={starterBuilderLink(pathway.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-hero-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90">
                      Open prefilled research stack <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to={guidedReviewLink(pathway.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                      Guided review
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container px-4 py-10 md:py-14">
        <div className="mx-auto max-w-4xl rounded-3xl border border-trust/25 bg-trust/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-0.5 h-7 w-7 shrink-0 text-trust" />
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">The safe next step stays obvious</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Use the store for product information and research purchasing. Use the guided route for GLP-1s and any decision involving personal health. We do not provide dosage instructions or promise medical outcomes in these pathways.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={STORE_LINKS.shop} className="text-sm font-bold text-primary hover:underline">Shop all categories →</Link>
                <Link to={STORE_LINKS.account} className="text-sm font-bold text-primary hover:underline">Open customer dashboard →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
