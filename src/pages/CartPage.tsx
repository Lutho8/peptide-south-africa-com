import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowLeft, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import FreeShippingBar from "@/components/FreeShippingBar";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { cartBundleSavings } from "@/lib/bundlePricing";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";

export default function CartPage() {
  const { items, removeFromCart, removeBundle, updateQuantity, subtotal } = useCart();
  const { format } = useCurrency();
  const { market, lang } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  const singles = items.filter((i) => !i.bundleId);
  const bundleIds = [...new Set(items.filter((i) => i.bundleId).map((i) => i.bundleId as string))];
  const bundles = bundleIds.map((id) => {
    const lines = items.filter((i) => i.bundleId === id);
    return {
      id,
      label: lines[0]?.bundleLabel ?? "Pick & Mix Bundle",
      lines,
      total: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
      saving: lines.reduce((s, l) => s + Math.max(0, (l.compareAtPrice ?? l.unitPrice) - l.unitPrice) * l.quantity, 0),
    };
  });
  const specialOffer = Math.round(cartBundleSavings(items) * 100) / 100;
  const cartUnits = items.reduce((sum, item) => {
    const pack = Number(item.variantLabel?.match(/(\d+)\s*-?\s*Pack/i)?.[1] ?? 1);
    return sum + pack * item.quantity;
  }, 0);
  const anchorSlug = items[0]?.product.slug;

  if (items.length === 0) {
    return (
      <>
        <SEO title="Your Cart" description="Review your selected peptides before checkout." path={mp("/cart")} lang={lang} alternates={buildAlternates("/cart")} noindex />
        <div className="container flex flex-col items-center justify-center py-32">
          <ShoppingBag className="mb-4 h-20 w-20 text-muted-foreground/20" />
          <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
          <Link to={mp("/shop")} className="mt-6 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
            Browse Products
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Your Cart" description="Review your selected peptides before checkout." path={mp("/cart")} lang={lang} alternates={buildAlternates("/cart")} noindex />
      <Breadcrumbs crumbs={[{ label: "Home", href: mp("/") }, { label: "Cart" }]} />
      <div className="container max-w-3xl py-10">
        <Link to={mp("/shop")} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
        <h1 className="mb-8 text-center font-display text-3xl font-bold text-foreground">My Cart</h1>

        <FreeShippingBar subtotalZar={subtotal} className="mb-5" />

        <div className="flex flex-col gap-3">
          {bundles.map((b) => (
            <div key={b.id} className="rounded-lg border border-primary/30 bg-primary/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-foreground">{b.label}</h3>
                  <p className="text-sm font-bold text-primary">{format(b.total)}</p>
                  {b.saving > 0 && <p className="text-xs font-semibold text-trust">Save {format(b.saving)}</p>}
                </div>
                <button onClick={() => removeBundle(b.id)} aria-label="Remove bundle" className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
                {b.lines.map((item) => (
                  <li key={item.lineId} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className={`${vialTileFrameClasses} block h-12 w-12 shrink-0`} data-testid={VIAL_TEST_ID}>
                      <span aria-hidden className={vialAccentBarSmClasses} />
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                    </span>
                    <Link to={mp(`/product/${item.product.slug}`)} className="flex-1 truncate hover:text-primary">
                      {item.product.name}
                    </Link>
                    <span className="text-xs font-semibold text-muted-foreground">quantity {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {singles.map((item) => (
            <div key={item.lineId} className="relative flex gap-4 rounded-lg border border-border bg-card p-4">
              <span className={`${vialTileFrameClasses} block h-24 w-24 shrink-0`} data-testid={VIAL_TEST_ID}>
                <span aria-hidden className={vialAccentBarSmClasses} />
                <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
              </span>
              <div className="flex flex-1 flex-col pr-6">
                <Link to={mp(`/product/${item.product.slug}`)} className="font-display font-semibold text-foreground hover:text-primary">
                  {item.product.name}
                </Link>
                {item.variantLabel && (
                  <span className="text-xs text-muted-foreground">{item.variantLabel}</span>
                )}
                <span className="mt-1 font-display font-bold text-foreground">{format(item.unitPrice * item.quantity)}</span>
                <div className="mt-auto flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} className="rounded-md border border-border p-2 hover:bg-muted" aria-label="Decrease quantity">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[2ch] text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="rounded-md border border-border p-2 hover:bg-muted" aria-label="Increase quantity">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.lineId)}
                aria-label="Remove item"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {anchorSlug && cartUnits < 5 && (
          <Link
            to={cartUnits < 3 ? mp(`/product/${anchorSlug}`) : "/build-your-stack"}
            className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4"
          >
            <span>
              <span className="block font-semibold text-foreground">
                {cartUnits < 3 ? "Most customers choose the 3-pack" : "Best price per unit: 5-pack"}
              </span>
              <span className="block text-sm text-muted-foreground">
                {cartUnits < 3 ? "See the next pack and compare the savings." : "Build any five and save 20%."}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          </Link>
        )}

        <a
          href="https://peptide-south-africa.co.za/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-xl border border-trust/25 bg-trust/5 p-4"
        >
          <Gift className="h-5 w-5 shrink-0 text-trust" />
          <span>
            <span className="block font-semibold text-foreground">Free Peptide Tracker included</span>
            <span className="block text-sm text-muted-foreground">Open your digital progress companion at any time.</span>
          </span>
        </a>

        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          {specialOffer > 0 && (
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-destructive">Special Offer</span>
              <span className="font-semibold text-destructive" data-testid="cart-special-offer">−{format(specialOffer)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-foreground">
            <span>Subtotal</span><span data-testid="cart-subtotal">{format(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shipping & taxes calculated at checkout</p>
          <Link
            to={mp("/checkout")}
            className="mt-5 block w-full rounded-lg bg-hero-gradient py-4 text-center font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-all hover:opacity-90"
          >
            Checkout
          </Link>
        </div>

        {anchorSlug && (
          <div className="mt-6">
            <FrequentlyBoughtTogether slug={anchorSlug} variant="single" />
          </div>
        )}
      </div>
    </>
  );
}
