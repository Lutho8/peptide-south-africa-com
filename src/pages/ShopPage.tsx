import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Flame, Activity, Sparkles, ShieldCheck, FlaskConical, MapPin, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { products, categories, tracks, getProductsByCategory, type ProductTrack } from "@/data/products";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import MediaLogos from "@/components/MediaLogos";
import SEO from "@/components/SEO";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { pageCopy } from "@/lib/marketCopy";

const SITE_URL = "https://tide-shop-clone.lovable.app";

const protocols = [
  {
    title: "Fat Loss Protocol",
    desc: "12-week guided program. Triple-agonist GLP-1 strategy + clinician check-ins.",
    icon: Flame,
    href: "/fat-loss-protocol",
    pill: "Most Popular",
    accent: "from-primary/15 to-primary/5",
  },
  {
    title: "Recovery & Healing",
    desc: "BPC-157 + TB-500 stack for tissue repair, injury recovery, and performance.",
    icon: Activity,
    href: "/quiz?goal=recovery",
    pill: "Athlete Favourite",
    accent: "from-trust/15 to-trust/5",
  },
  {
    title: "Longevity & Aesthetics",
    desc: "GHK-Cu, Epitalon and growth hormone secretagogues for skin, hair and cellular health.",
    icon: Sparkles,
    href: "/quiz?goal=longevity",
    pill: "New",
    accent: "from-badge/15 to-badge/5",
  },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "All";
  const initialTrack = (searchParams.get("track") as "All" | ProductTrack) || "All";
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [activeTrack, setActiveTrack] = useState<"All" | ProductTrack>(initialTrack);
  const { market, lang } = useMarket();
  const shopCopy = pageCopy("shop", market);

  const filtered = getProductsByCategory(activeCategory).filter(
    (p) => activeTrack === "All" || (p.track ?? "RUO") === activeTrack,
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Ride The Tide — ${activeCategory === "All" ? "All Products" : activeCategory}`,
    description:
      "Research-grade peptide kits, guides, and bundles including Retatrutide, Tirzepatide, BPC-157, Tesamorelin, and GHK-Cu.",
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.name,
    })),
  };

  const syncParams = (cat: string, trk: "All" | ProductTrack) => {
    const next: Record<string, string> = {};
    if (cat !== "All") next.category = cat;
    if (trk !== "All") next.track = trk;
    setSearchParams(next);
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    syncParams(cat, activeTrack);
  };
  const handleTrack = (trk: "All" | ProductTrack) => {
    setActiveTrack(trk);
    syncParams(activeCategory, trk);
  };

  return (
    <>
      <SEO
        title={shopCopy.title}
        description={shopCopy.description}
        path={marketPath("/shop", market)}
        lang={lang}
        alternates={buildAlternates("/shop")}
      />
      <JsonLd data={itemListSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(activeCategory !== "All" ? [{ label: activeCategory }] : []),
        ]}
      />

      {/* ============ HERO ============ */}
      <section className="border-b border-border bg-card">
        <div className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Lab-tested · ≥99% HPLC purity · Shipped from South Africa &amp; an EU partner
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {shopCopy.h1}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Every batch is third-party HPLC tested. Every protocol is built by a clinician.
              Pick a single compound or commit to a full transformation.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/quiz"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95 sm:w-auto"
              >
                Find My Protocol <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#products"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted sm:w-auto"
              >
                Browse Compounds
              </a>
            </div>
          </div>

          {/* Trust strip — directly counters Vril/Peptide Supply credibility */}
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: FlaskConical, label: "≥99% HPLC", sub: "Every batch" },
              { icon: ShieldCheck, label: "COA on every product", sub: "3rd-party verified" },
              { icon: MapPin, label: "ZA &amp; DE / EU", sub: "Local + EU support" },
              { icon: Truck, label: "Free shipping", sub: "R1,500 SA · €75 DE / EU" },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-left"
              >
                <t.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{t.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AS SEEN IN ============ */}
      <MediaLogos variant="muted" />

      {/* ============ PROTOCOLS (Maximus-style) ============ */}
      <section className="bg-background py-12 md:py-16">
        <div className="container px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                Guided Programs
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Start with a Protocol — not a Vial
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Outcomes-led programs that combine the right compounds, dosing schedule, and check-ins.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {protocols.map((p) => (
              <Link
                key={p.title}
                to={p.href}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${p.accent} p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1`}
              >
                <span className="absolute right-4 top-4 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                  {p.pill}
                </span>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background shadow-card">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATALOG ============ */}
      <section id="products" className="border-t border-border bg-card py-12 md:py-16">
        <div className="container px-4">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                Compound Catalog
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {activeCategory === "All" ? "All Research Peptides" : activeCategory}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "product" : "products"} · all third-party HPLC tested
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              No products found in this category.
            </div>
          )}
        </div>
      </section>

      {/* ============ CONVERSION CTA ============ */}
      <section className="bg-hero-gradient py-12">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            Not sure which compound is right for you?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-primary-foreground/80">
            Take a 2-minute quiz and get a personalized protocol — built around your goal, body and lifestyle.
          </p>
          <Link
            to="/quiz"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-card px-8 py-3.5 font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Start Free Assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
