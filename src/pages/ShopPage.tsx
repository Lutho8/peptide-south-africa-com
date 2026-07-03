import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { ArrowRight, Flame, Activity, Sparkles, ShieldCheck, FlaskConical, MapPin, Truck, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import QuizResultBanner from "@/components/QuizResultBanner";
import { products, categories, tracks, getProductsByCategory, type ProductTrack } from "@/data/products";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import MediaLogos from "@/components/MediaLogos";
import SEO from "@/components/SEO";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { pageCopy } from "@/lib/marketCopy";
import { useCart } from "@/context/CartContext";
import { toast as sonnerToast } from "sonner";

const SITE_URL = "https://www.peptide-south-africa.com";

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

  const addStackToCart = () => {
    stackProducts.forEach((p) => {
      const v = p.variants?.[0];
      addToCart(p, v ? { variantLabel: v.label, unitPrice: v.price } : undefined);
    });
    setIsCartOpen(true);
    sonnerToast.success("Stack added to cart", {
      description: `${stackProducts.length} product${stackProducts.length === 1 ? "" : "s"} from your protocol.`,
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
                <button
                  onClick={addStackToCart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-hero-gradient px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <ShoppingCart className="h-4 w-4" /> Add stack to cart
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stackProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
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
              Lab-tested · ≥99% HPLC purity · Shipped from Cape Town across South Africa
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {shopCopy.h1}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Every batch is third-party HPLC tested. Every protocol is built by a clinician.
              Pick a single compound or commit to a full transformation.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/quiz"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95 sm:w-auto"
              >
                Find My Protocol <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/quiz?intent=consult"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-background px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/5 active:scale-95 sm:w-auto"
              >
                Book a 15-min Consult
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
              { icon: MapPin, label: "Ships across SA", sub: "Same-day dispatch" },
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

      {/* ============ AS SEEN IN ============ */}
      <MediaLogos variant="muted" />

      {/* ============ PROTOCOLS (Maximus-style) ============ */}
      <section className="bg-background py-12 md:py-16">
        <div className="container px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
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
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
                Compound Catalog
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {activeCategory === "All" ? "All Research Peptides" : activeCategory}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "product" : "products"} · all third-party HPLC tested ·{" "}
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

          {/* Track filter — Research vs Clinical pathway */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pathway
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
