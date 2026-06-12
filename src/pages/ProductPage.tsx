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
import RelatedContent from "@/components/RelatedContent";
import { productSchema, entityClusters } from "@/lib/seo";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import StockBadge from "@/components/StockBadge";
import TrackBadge from "@/components/TrackBadge";
import DeliveryReturnsAccordion from "@/components/DeliveryReturnsAccordion";
import SEO from "@/components/SEO";
import StickyProductCTA from "@/components/StickyProductCTA";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CmsFaq { question: string; answer: string }


export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const { addToCart } = useCart();
  const { format, display, currency, rate } = useCurrency();
  const { market, lang } = useMarket();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
    // GP-track: route to clinician quiz instead of cart
    if (isGPTrack) {
      navigate(`/quiz?product=${product.slug}`);
      return;
    }
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
        unit_price_eur: currentPrice,
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
        title={`${product.name} | Research Peptide | Ride The Tide`}
        description={`${product.shortDescription || product.description.slice(0, 140)} 99%+ HPLC purity, COA included. Ships to Germany & South Africa.`}
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

      {/* Product Detail */}
      <section className="container pb-16">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <ProductImageZoom src={product.image} alt={product.name} />

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">{product.category}</span>
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
              {product?.priceRange
                ? (currency === "EUR"
                    ? product.priceRange
                    : (() => {
                        const nums = product.priceRange.match(/[\d.,]+/g)?.map((s) => parseFloat(s.replace(",", "."))) ?? [];
                        if (nums.length !== 2) return product.priceRange;
                        const fmt = (eur: number) => `R${(eur * rate).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
                        return `${fmt(nums[0])} – ${fmt(nums[1])}`;
                      })())
                : display(currentPrice).primary}
            </p>
            {display(currentPrice).secondary && (
              <p className="text-xs text-muted-foreground">{display(currentPrice).secondary}</p>
            )}

            {/* Purity & Storage */}
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

            {/* CTA */}
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="mt-4 w-full rounded-lg bg-hero-gradient py-4 text-center font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 md:w-auto md:px-12"
            >
              {!product.inStock ? "Pre-Order" : added ? "✓ Added to Cart!" : "Add to Cart"}
            </button>

            <TrackerBridgeCard productName={product.name} productSlug={product.slug} />

            {/* Trust */}
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> ≥99% Purity — COA Available</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Third-Party Lab Tested & Batch Certified</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> 🇿🇦 Free shipping over R1,500 across South Africa</span>
            </div>

            {product.sku && (
              <p className="mt-4 text-xs text-muted-foreground">SKU: {product.sku} &nbsp;|&nbsp; Category: {product.category}</p>
            )}
          </div>
        </div>
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
