import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Truck, Star, Repeat, Zap, Stethoscope } from "lucide-react";
import ProductImageZoom from "@/components/ProductImageZoom";
import TrackerBridgeCard from "@/components/TrackerBridgeCard";
import { getProductBySlug, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuizResultBanner from "@/components/QuizResultBanner";
import RelatedContent from "@/components/RelatedContent";
import { productSchema, entityClusters } from "@/lib/seo";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import StockBadge from "@/components/StockBadge";
import TrackBadge from "@/components/TrackBadge";
import DeliveryReturnsAccordion from "@/components/DeliveryReturnsAccordion";
import SEO from "@/components/SEO";
import StickyProductCTA from "@/components/StickyProductCTA";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLastViewedProduct } from "@/context/LastViewedProductContext";
import TrustComplianceSection from "@/components/TrustComplianceSection";

interface CmsFaq { question: string; answer: string }


export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const { addToCart } = useCart();
  const { format, display } = useCurrency();
  const { market, lang } = useMarket();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setLastViewed } = useLastViewedProduct();
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [purchaseMode, setPurchaseMode] = useState<"one-time" | "subscribe">("one-time");
  const [intervalWeeks, setIntervalWeeks] = useState<4 | 8 | 12>(8);
  const [subBusy, setSubBusy] = useState(false);
  const [globalFaqs, setGlobalFaqs] = useState<CmsFaq[]>([]);


  useEffect(() => {
    supabase
      .from("product_faqs")
      .select("question, answer")
      .eq("scope", "global")
      .eq("is_published", true)
      .order("display_order")
      .then(({ data }) => setGlobalFaqs(data ?? []));
  }, []);

  // Register this product as the "last viewed" for the site-wide follower.
  useEffect(() => {
    if (!product) return;
    setLastViewed({
      slug: product.slug,
      name: product.name,
      image: typeof product.image === "string" ? product.image : "",
      price: product.variants?.[0]?.price ?? product.price,
      track: product.track,
    });
  }, [product, setLastViewed]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Product Not Found</h1>
        <Link to={marketPath("/shop", market)} className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const isGPTrack = product.track === "GP";
  const subDiscountPct = 12;
  const basePrice = product.variants ? product.variants[selectedVariant].price : product.price;
  const currentPrice =
    purchaseMode === "subscribe" && !isGPTrack
      ? Math.round(basePrice * (1 - subDiscountPct / 100) * 100) / 100
      : basePrice;

  const handleAdd = async () => {
    const variantLabel = product.variants?.[selectedVariant]?.label;
    if (purchaseMode === "subscribe") {
      if (!user) {
        navigate(`/auth?redirect=/product/${product.slug}`);
        return;
      }
      setSubBusy(true);
      const next = new Date();
      next.setDate(next.getDate() + intervalWeeks * 7);
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        product_slug: product.slug,
        variant_label: variantLabel ?? null,
        interval_weeks: intervalWeeks,
        discount_pct: subDiscountPct,
        next_charge_at: next.toISOString(),
      });
      setSubBusy(false);
      if (error) {
        toast({ title: "Couldn't create subscription", description: error.message, variant: "destructive" });
        return;
      }
      toast({
        title: "Subscription saved",
        description: "Manage it anytime in your account. Billing activation is in final review.",
      });
      navigate("/account");
      return;
    }
    addToCart(product, { variantLabel, unitPrice: currentPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Determine entity cluster for internal linking
  const clusterLinks = product.category === "GLP"
    ? entityClusters.fatLoss.links.filter(l => l.href !== `/product/${product.slug}`)
    : product.category === "Healing"
    ? entityClusters.healing.links.filter(l => l.href !== `/product/${product.slug}`)
    : entityClusters.growthHormone.links.filter(l => l.href !== `/product/${product.slug}`);

  return (
    <div>
      <JsonLd data={productSchema(product)} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [...product.faqs, ...globalFaqs].map(f => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }} />
      <SEO
        title={`${product.name} | Research Peptide | Peptide South Africa`}
        description={`${product.shortDescription || product.description.slice(0, 140)} 99%+ HPLC purity, COA included. Ships across South Africa.`}
        path={marketPath(`/product/${product.slug}`, market)}
        lang={lang}
        image={typeof product.image === "string" ? product.image : undefined}
        type="product"
        alternates={buildAlternates(`/product/${product.slug}`)}
      />
      <Breadcrumbs crumbs={[
        { label: "Home", href: marketPath("/", market) },
        { label: "Shop", href: marketPath("/shop", market) },
        { label: product.category, href: `${marketPath("/shop", market)}?category=${encodeURIComponent(product.category)}` },
        { label: product.name },
      ]} />
      <QuizResultBanner />



      {/* Product Detail */}
      <section className="container pb-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* Image — sticks on desktop so the product follows the user as they scroll. */}
          <div className="md:sticky md:top-24 md:self-start">
            <ProductImageZoom src={product.image} alt={product.name} />
          </div>


          {/* Info — sticks on desktop so price + CTA follow the user. */}
          <div className="flex flex-col md:sticky md:top-24 md:self-start">
            <span className="font-mono text-sm font-medium uppercase tracking-wider text-primary">{product.category}</span>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array(5).fill(null).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-badge text-badge" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(47 reviews)</span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-foreground">
              {product?.priceRange ?? display(currentPrice).primary}
            </p>

            {/* Monospace authenticity strip — lab-grade trust signals */}
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-border bg-muted/30 p-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <div><dt className="inline text-foreground/60">LOT</dt> <dd className="inline font-semibold text-foreground">{`PSA-${(product.slug || "x").slice(0,3).toUpperCase()}-${new Date().getFullYear()}`}</dd></div>
              <div><dt className="inline text-foreground/60">PURITY</dt> <dd className="inline font-semibold text-foreground">{product.purity ?? "≥99% HPLC"}</dd></div>
              <div><dt className="inline text-foreground/60">COA</dt> <dd className="inline font-semibold text-foreground">JANOSHIK ✓</dd></div>
              <div><dt className="inline text-foreground/60">BATCH</dt> <dd className="inline font-semibold text-foreground">{new Date().toISOString().slice(0,10)}</dd></div>
            </dl>


            {product.purity && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Purity:</span> {product.purity}
              </p>
            )}
            {product.storage && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Storage:</span> {product.storage}
              </p>
            )}

            <p className="mt-4 text-muted-foreground">{product.description}</p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-semibold text-foreground">MG</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.label}
                      onClick={() => setSelectedVariant(i)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                        selectedVariant === i
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 font-display text-xl font-bold text-foreground">{format(currentPrice)}</p>
              </div>
            )}

            {/* Benefits */}
            <ul className="mt-6 flex flex-col gap-2">
              {product.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 shrink-0 text-trust" /> {b}
                </li>
              ))}
            </ul>

            {/* Stock urgency */}
            <div className="mt-6">
              <StockBadge product={product} size="md" />
            </div>

            {/* Purchase mode — Subscribe & save */}
            {product.inStock && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="grid grid-cols-2">
                  <button
                    onClick={() => setPurchaseMode("one-time")}
                    className={`flex flex-col items-start gap-1 p-4 text-left transition-all ${
                      purchaseMode === "one-time" ? "bg-background" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Zap className="h-4 w-4" /> One-time
                    </span>
                    <span className="font-display text-base font-bold text-foreground">{format(basePrice)}</span>
                  </button>
                  <button
                    onClick={() => setPurchaseMode("subscribe")}
                    className={`flex flex-col items-start gap-1 border-l border-border p-4 text-left transition-all ${
                      purchaseMode === "subscribe" ? "bg-primary/5 ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-primary">
                      <Repeat className="h-4 w-4" /> Subscribe · save {subDiscountPct}%
                    </span>
                    <span className="font-display text-base font-bold text-foreground">
                      {format(Math.round(basePrice * (1 - subDiscountPct / 100) * 100) / 100)}
                    </span>
                  </button>
                </div>
                {purchaseMode === "subscribe" && (
                  <div className="border-t border-border bg-background/50 px-4 py-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reorder every
                    </label>
                    <div className="mt-2 flex gap-2">
                      {[4, 8, 12].map((w) => (
                        <button
                          key={w}
                          onClick={() => setIntervalWeeks(w as 4 | 8 | 12)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                            intervalWeeks === w
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          {w} weeks
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Pause, skip, or cancel anytime from your account.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Primary CTA — Add to Cart */}
            <button
              onClick={handleAdd}
              disabled={!product.inStock || subBusy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 text-center font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {!product.inStock ? (
                "Pre-Order"
              ) : purchaseMode === "subscribe" ? (
                subBusy ? "Saving…" : <><Repeat className="h-4 w-4" /> Subscribe · save {subDiscountPct}%</>
              ) : added ? (
                "✓ Added to Cart!"
              ) : (
                "Add to Cart"
              )}
            </button>

            {/* Secondary CTA — Clinician consult for GP-track */}
            {isGPTrack && product.inStock && (
              <Link
                to={`/quiz?product=${product.slug}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
              >
                <Stethoscope className="h-4 w-4" /> Prefer guidance? Start Clinician Consultation
              </Link>
            )}

            <TrackerBridgeCard productName={product.name} productSlug={product.slug} />

            {/* Trust */}
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> ≥99% Purity — COA Available</span>
              <Link to="/testing" className="flex items-center gap-1 hover:text-foreground">
                <CheckCircle className="h-3.5 w-3.5" /> Janoshik Analytical · per-batch COA
              </Link>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> 🇿🇦 Free shipping over R1,500 across South Africa</span>
            </div>

            {/* SKU / CAS / Class footer */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {product.sku && <span>SKU: <span className="font-mono text-foreground">{product.sku}</span></span>}
              {product.casNumber && <span>· CAS: <span className="font-mono text-foreground">{product.casNumber}</span></span>}
              {product.compoundClass && <span>· {product.compoundClass}</span>}
              <span>· <TrackBadge track={product.track} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently bought together */}
      <section className="container">
        <FrequentlyBoughtTogether slug={product.slug} />
      </section>

      {/* Details Sections */}
      <section className="border-t border-border bg-card py-16">
        <div className="container grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">What's Included</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {product.whatsIncluded.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Who It's For</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {product.whoItsFor.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">How It Works</h3>
            <ol className="mt-4 flex flex-col gap-2">
              {product.howItWorks.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Research Disclaimer */}
      <section className="border-t border-border py-8">
        <div className="container">
          <p className="text-center text-xs text-muted-foreground">
            For research purposes only. Not for human use or consumption.
          </p>
        </div>
      </section>

      {/* Trust & compliance — reinforces premium pricing */}
      <TrustComplianceSection variant="compact" />

      {/* Reviews */}
      <ProductReviews slug={product.slug} />

      {/* FAQ — accordion */}
      {/* Delivery & Returns */}
      <section className="container pb-8">
        <h3 className="mb-4 font-display text-2xl font-bold text-foreground">Delivery &amp; Returns</h3>
        <DeliveryReturnsAccordion />
      </section>

      {/* FAQ — accordion */}
      {(() => {
        const allFaqs = [...product.faqs, ...globalFaqs];
        return (
          <section className="container pb-16">
            <h3 className="mb-6 font-display text-2xl font-bold text-foreground">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-5">
              {allFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="last:border-b-0">
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        );
      })()}

      {/* Entity-linked related content */}
      <RelatedContent title="Related Protocols & Research" links={clusterLinks} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border bg-card py-16">
          <div className="container">
            <h3 className="mb-6 font-display text-2xl font-bold text-foreground">You Might Also Like</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <StickyProductCTA
        product={product}
        variantLabel={product.variants?.[selectedVariant]?.label}
        price={currentPrice}
        added={added}
        onAdd={handleAdd}
      />
    </div>
  );
}
