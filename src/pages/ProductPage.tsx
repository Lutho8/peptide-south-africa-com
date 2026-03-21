import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Truck, Star } from "lucide-react";
import { getProductBySlug, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { useState } from "react";
import { formatZAR } from "@/lib/currency";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Product Not Found</h1>
        <Link to="/shop" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = product.variants ? product.variants[selectedVariant].price : product.price;

  const handleAdd = () => {
    addToCart({ ...product, price: currentPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div>
      <div className="container py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>

      {/* Product Detail */}
      <section className="container pb-16">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

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
              {product.priceRange || formatZAR(currentPrice)}
            </p>

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
                <p className="mt-2 font-display text-xl font-bold text-foreground">{formatZAR(currentPrice)}</p>
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

            {/* CTA */}
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="mt-8 w-full rounded-lg bg-hero-gradient py-4 text-center font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 md:w-auto md:px-12"
            >
              {!product.inStock ? "Pre-Order" : added ? "✓ Added to Cart!" : "Add to Cart"}
            </button>

            {/* Trust */}
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> ≥99% Purity — COA Available</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Third-Party Lab Tested & Batch Certified</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Ships in 1–3 Business Days</span>
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

      {/* FAQ */}
      {product.faqs.length > 0 && (
        <section className="container py-16">
          <h3 className="mb-6 font-display text-2xl font-bold text-foreground">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-4">
            {product.faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5">
                <h4 className="font-display font-semibold text-foreground">{faq.question}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
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
    </div>
  );
}
