import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { ArrowRight, Flame, Activity, Sparkles, ShieldCheck, FlaskConical, MapPin, Truck, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import QuizResultBanner from "@/components/QuizResultBanner";
import { products, categories, tracks, getProductsByCategory, type ProductTrack } from "@/data/products";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import SEO from "@/components/SEO";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { pageCopy } from "@/lib/marketCopy";
import { useCart } from "@/context/CartContext";
import { toast as sonnerToast } from "sonner";
import BookConsultLink from "@/components/BookConsultLink";
import { formatZarWhole, PRICING } from "../../supabase/functions/_shared/pricing";

const SITE_URL = "https://www.peptide-south-africa.com";

const shopFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's the difference between the compound categories in your shop?",
      acceptedAnswer: { "@type": "Answer", text: "Metabolic/GLP-1 compounds, healing peptides, growth-hormone secretagogues, and longevity/mitochondrial peptides each work through different pathways. See our full breakdown in what are peptides for an overview of every category before choosing." },
    },
    {
      "@type": "Question",
      name: "What does third-party tested mean?",
      acceptedAnswer: { "@type": "Answer", text: "A third-party laboratory analysed the submitted sample using the tests shown in the published report. The report scope and sample reference are displayed so buyers can see exactly what was and was not tested." },
    },
    {
      "@type": "Question",
      name: "Are products sold for human use?",
      acceptedAnswer: { "@type": "Answer", text: "No. Products are supplied solely for lawful laboratory research and are not for human or animal use or consumption." },
    },
  ],
};

const protocols = [
  {
    title: "Metabolic Research",
    desc: "Triple- and dual-agonist compounds presented for laboratory pathway research.",
    icon: Flame,
    href: "/shop?category=GLP",
    pill: "Research area",
    accent: "from-primary/15 to-primary/5",
  },
  {
    title: "Repair Signalling",
    desc: "Research peptides studied in cellular repair, angiogenesis and response models.",
    icon: Activity,
    href: "/shop?category=Healing",
    pill: "Research area",
    accent: "from-trust/15 to-trust/5",
  },
  {
    title: "Cellular & Longevity",
    desc: "Compounds studied in mitochondrial, dermal and cellular signalling models.",
    icon: Sparkles,
    href: "/shop?category=Wellness%20%26%20Longevity",
    pill: "Research area",
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
  const { addToCart, setIsCartOpen } = useCart();
  const { hash } = useLocation();

  // Honor #products / #cat-recovery hash — SPA nav doesn't auto-scroll to anchors.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // small delay so category sections have mounted
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [hash]);


  // Deep-link stack from the quiz: /shop?stack=id1,id2&from=quiz
  const stackIds = useMemo(
    () => (searchParams.get("stack") || "").split(",").map((s) => s.trim()).filter(Boolean),
    [searchParams],
  );
  const stackProducts = useMemo(() => {
    if (!stackIds.length) return [];
    const byId = new Map(products.map((p) => [p.id, p]));
    return stackIds.map((id) => byId.get(id)).filter((p): p is typeof products[number] => !!p);
  }, [stackIds]);
  const stackRequiresConsult = stackProducts.some((product) => product.track === "GP");
  const stackSubtotal = stackProducts.reduce((sum, product) => sum + (product.variants?.[0]?.price ?? product.price), 0);
  const stackSaving = stackProducts.reduce((sum, product) => {
    const variant = product.variants?.[0];
    const single = product.variants?.find((candidate) => candidate.pack === 1)?.price ?? product.price;
    return sum + Math.max(0, single * (variant?.pack ?? 1) - (variant?.price ?? product.price));
  }, 0);

  const addStackToCart = () => {
    // Skip out-of-stock items — the cart guard would drop them anyway, but
    // filtering here keeps the confirmation toast count honest.
    const purchasable = stackProducts.filter((p) => p.inStock);
    purchasable.forEach((p) => {
      const v = p.variants?.[0];
      addToCart(p, v ? { variantLabel: v.label, unitPrice: v.price } : undefined);
    });
    if (purchasable.length === 0) {
      sonnerToast.error("Stack unavailable", {
        description: "Every product in this protocol is currently out of stock.",
      });
      return;
    }
    setIsCartOpen(true);
    sonnerToast.success("Stack added to cart", {
      description: `${purchasable.length} product${purchasable.length === 1 ? "" : "s"} from your protocol.`,
    });
  };

  const filtered = getProductsByCategory(activeCategory).filter(
    (p) => activeTrack === "All" || (p.track ?? "RUO") === activeTrack,
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Peptide South Africa — ${activeCategory === "All" ? "All Products" : activeCategory}`,
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
      <JsonLd data={shopFaqSchema} />
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(activeCategory !== "All" ? [{ label: activeCategory }] : []),
        ]}
      />
      <QuizResultBanner />

      {/* ============ RECOMMENDED STACK (from quiz deep-link) ============ */}
      {stackProducts.length > 0 && (
        <section className="border-b border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <div className="container px-4 py-8 md:py-10">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Your recommended stack
                  </span>
                  <h2 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl">
                    {stackProducts.length} product{stackProducts.length === 1 ? "" : "s"} matched to your protocol
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {stackRequiresConsult
                      ? `${formatZarWhole(PRICING.programOffers.monthly.amount)}/month or ${formatZarWhole(PRICING.programOffers.full12Week.amount)}/12 weeks`
                      : `Combined subtotal R${stackSubtotal.toLocaleString("en-ZA")}`}
                  </p>
                  {!stackRequiresConsult && stackSaving > 0 && <p className="text-xs font-semibold text-trust">Save R{stackSaving.toLocaleString("en-ZA")}</p>}
                  {stackRequiresConsult ? (
                    <BookConsultLink className="mt-2 inline-flex items-center justify-center rounded-xl bg-hero-gradient px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow">
                      BOOK CONSULT
                    </BookConsultLink>
                  ) : (
                    <button
                      onClick={addStackToCart}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-hero-gradient px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stackProducts.map((p) => (
                  <ProductCard key={p.id} product={p} recommendation />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ============ HERO ============ */}
      <section className="border-b border-border bg-card">
        <div className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Research-use only · Published analytical reports · Shipped across South Africa
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {shopCopy.h1}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Research-use compounds with clear identity, storage, report scope and batch documentation where published.
              Browse by compound class or use the existing quiz to organise the catalogue.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/quiz"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95 sm:w-auto"
              >
                Open research quiz <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#products"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted sm:w-auto"
              >
                Browse Compounds
              </a>
            </div>
          </div>

          {/* Research supplier trust strip */}
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: FlaskConical, label: "HPLC results", sub: "Where published" },
              { icon: ShieldCheck, label: "Reports linked", sub: "Scope disclosed" },
              { icon: MapPin, label: "Ships across SA", sub: "From Cape Town" },
              { icon: Truck, label: "Free shipping", sub: "On orders over R1,500" },
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

      {/* ============ PROTOCOLS (Maximus-style) ============ */}
      <section className="bg-background py-12 md:py-16">
        <div className="container px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
                Research Catalogue
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Start with the research area
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Organise the catalogue by pathway, then review the exact compound and documentation available.
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
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
                Compound Catalog
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {activeCategory === "All" ? "All Research Peptides" : activeCategory}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "product" : "products"} · published analytical records and scope shown where available ·{" "}
                <Link to="/testing" className="font-semibold text-primary hover:underline">View testing methodology</Link>
              </p>
            </div>
          </div>

          {/* Bundle deals strip */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.04] p-3">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Bundles
            </span>
            <a
              href="#products"
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              3-Pack Deals · 15% Off
            </a>
            <Link
              to="/build-your-stack"
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              5-Pack Pick &amp; Mix · 20% Off
            </Link>
            <Link
              to="/build-your-stack"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow hover:opacity-90"
            >
              Build Your Stack <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Research-use filter */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Use
            </span>
            {tracks.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTrack(t.value)}
                title={t.desc}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTrack === t.value
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category filters */}
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

          {/* Products — grouped by category when "All" is active, so Recovery
              and Wellness & Longevity render as visible sections instead of
              being buried inside one long grid. */}
          {activeCategory === "All" ? (
            <div className="space-y-12">
              {categories
                .filter((c) => c !== "All")
                .map((cat) => {
                  const items = filtered.filter((p) => p.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="mb-4 flex items-end justify-between gap-3">
                        <h3 id={`cat-${cat.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`} className="font-display text-xl font-bold text-foreground sm:text-2xl">
                          {cat}
                        </h3>
                        <button
                          onClick={() => handleCategory(cat)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View all {cat} →
                        </button>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              No products found in this category.
            </div>
          )}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="border-t border-border bg-background py-16 sm:py-20">
        <div className="container px-4 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-1">What's the difference between the compound categories in your shop?</h3>
              <p className="text-sm text-muted-foreground">Metabolic/GLP-1 compounds, healing peptides, growth-hormone secretagogues, and longevity/mitochondrial peptides each work through different pathways. See our full breakdown in <Link to="/blog/what-are-peptides-complete-guide" className="text-primary hover:underline">what are peptides</Link> for an overview of every category before choosing.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">What does third-party tested mean?</h3>
              <p className="text-sm text-muted-foreground">A third-party laboratory analysed the submitted sample using the methods and tests shown in the report. We display the source or lot reference and a scope notice so you can see exactly what was and was not tested.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Are products sold for human use?</h3>
              <p className="text-sm text-muted-foreground">No. Products are supplied solely for lawful laboratory research and are not for human or animal use or consumption. Checkout requires an explicit acknowledgement for every order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONVERSION CTA ============ */}
      <section className="bg-hero-gradient py-12">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            Need a clearer place to start?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-primary-foreground/80">
            Use the existing quiz to organise the research catalogue, then review each product's identity, storage and published documentation.
          </p>
          <Link
            to="/quiz"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-card px-8 py-3.5 font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Open Research Quiz <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
