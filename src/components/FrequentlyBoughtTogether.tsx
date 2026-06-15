import { Link } from "react-router-dom";
import { Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products, type Product } from "@/data/products";
import { BUNDLE_MAP } from "@/data/bundles";

interface Props {
  /** Slug of the anchor/primary product. */
  slug: string;
  /** Compact mode used inside cart drawer. */
  variant?: "default" | "compact";
}

/**
 * Frequently bought together rail. Picks 2 complementary products from
 * BUNDLE_MAP and shows a one-click "Add to cart" per item plus a
 * "Add bundle" combined action. Falls back gracefully if mapping missing.
 */
export default function FrequentlyBoughtTogether({ slug, variant = "default" }: Props) {
  const { addToCart } = useCart();
  const { format } = useCurrency();
  const hints = BUNDLE_MAP[slug] ?? [];
  const picks: Product[] = hints
    .map((h) => products.find((p) => p.slug === h.slug))
    .filter((p): p is Product => !!p && p.inStock)
    .slice(0, 2);

  if (picks.length === 0) return null;

  const bundleSubtotal = picks.reduce(
    (sum, p) => sum + (p.variants?.[0]?.price ?? p.price),
    0,
  );

  const addOne = (p: Product) => {
    const v = p.variants?.[0];
    addToCart(p, { variantLabel: v?.label, unitPrice: v?.price ?? p.price, silent: true });
  };

  const addBundle = () => picks.forEach(addOne);

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Often paired
        </p>
        <ul className="flex flex-col gap-2">
          {picks.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <img src={typeof p.image === "string" ? p.image : ""} alt="" className="h-10 w-10 rounded-md object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <Link to={`/product/${p.slug}`} className="block truncate text-xs font-semibold text-foreground hover:underline">
                  {p.name}
                </Link>
                <span className="text-[11px] text-muted-foreground">{format(p.variants?.[0]?.price ?? p.price)}</span>
              </div>
              <button
                onClick={() => addOne(p)}
                aria-label={`Add ${p.name} to cart`}
                className="rounded-md border border-border bg-card p-1.5 text-primary hover:bg-primary/5"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-primary">Frequently bought together</p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground">Complete your protocol</h3>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Bundle subtotal</span>
          <p className="font-display text-lg font-bold text-foreground">{format(bundleSubtotal)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {picks.map((p, idx) => (
          <div key={p.id} className="flex gap-3 rounded-xl border border-border p-3">
            <img src={typeof p.image === "string" ? p.image : ""} alt={p.name} className="h-20 w-20 rounded-md object-cover" loading="lazy" />
            <div className="flex flex-1 flex-col">
              <Link to={`/product/${p.slug}`} className="font-display text-sm font-semibold text-foreground hover:underline">
                {p.name}
              </Link>
              <span className="text-[11px] text-muted-foreground">{hints[idx]?.reason ?? p.category}</span>
              <span className="mt-auto text-sm font-bold text-foreground">{format(p.variants?.[0]?.price ?? p.price)}</span>
            </div>
            <button
              onClick={() => addOne(p)}
              className="self-start rounded-lg border border-border bg-background p-2 text-primary hover:bg-primary/5"
              aria-label={`Add ${p.name} to cart`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addBundle}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.99]"
      >
        <ShoppingBag className="h-4 w-4" /> Add bundle to cart
      </button>
    </section>
  );
}
