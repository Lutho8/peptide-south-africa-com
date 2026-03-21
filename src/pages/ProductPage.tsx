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

  const handleAdd = () => {
    addToCart(product);
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
              {product.priceRange || `$${product.price}`}
            </p>
            <p className="mt-4 text-muted-foreground">{product.description}</p>

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
              className="mt-8 w-full rounded-lg bg-hero-gradient py-4 text-center font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] md:w-auto md:px-12"
            >
              {added ? "✓ Added to Cart!" : "Add to Cart"}
            </button>

            {/* Trust */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Checkout</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Free Shipping</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> 99% Purity COA</span>
            </div>
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
