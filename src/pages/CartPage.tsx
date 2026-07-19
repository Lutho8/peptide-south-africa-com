import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import CartCountdown from "@/components/CartCountdown";
import FreeShippingBar from "@/components/FreeShippingBar";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { COPY, trilingual } from "@/lib/copy";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";
import { cartBundleSavings } from "@/lib/bundlePricing";
import { getShippingCost } from "@/lib/shipping";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";

export default function CartPage() {
  const { items, removeFromCart, removeBundle, updateQuantity, subtotal, totalPrice, discountAmount, discountCode, isDiscountEligible } = useCart();
  const { format } = useCurrency();
  const { market, lang } = useMarket();
  const mp = (p: string) => marketPath(p, market);
  const shippingCost = getShippingCost(totalPrice, "South Africa") ?? 0;
  const grandTotal = totalPrice + shippingCost;


  const singles = items.filter((i) => !i.bundleId);
  const bundleIds = [...new Set(items.filter((i) => i.bundleId).map((i) => i.bundleId as string))];
  const bundles = bundleIds.map((id) => {
    const lines = items.filter((i) => i.bundleId === id);
    return {
      id,
      label: lines[0]?.bundleLabel ?? "Pick & Mix Bundle",
      discountPct: lines[0]?.bundleDiscountPct ?? 0,
      lines,
      total: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
      savings: lines.reduce((s, l) => s + ((l.compareAtPrice ?? l.unitPrice) - l.unitPrice) * l.quantity, 0),
    };
  });
  const bundleSavings = cartBundleSavings(items);

  if (items.length === 0) {
    return (
      <>
        <SEO title="Your Cart" description="Review your selected peptides before checkout." path={mp("/cart")} lang={lang} alternates={buildAlternates("/cart")} noindex />
        <div className="container flex flex-col items-center justify-center py-32">
        <ShoppingBag className="mb-4 h-20 w-20 text-muted-foreground/20" />
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products to get started.</p>
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
    <div className="container py-12">
      <Link to={mp("/shop")} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Shopping Cart</h1>

      <FreeShippingBar subtotalEur={subtotal} className="mb-6" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {bundles.map((b) => (
              <div key={b.id} className="rounded-lg border border-primary/30 bg-primary/[0.03] p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{b.label}</h3>
                    <p className="mt-0.5 text-sm">
                      <span className="font-display font-bold text-primary">{format(b.total)}</span>
                      {b.savings > 0 && (
                        <span className="ml-2 text-xs font-semibold text-trust">You Save {format(b.savings)}</span>
                      )}
                    </p>
                  </div>
                  <button onClick={() => removeBundle(b.id)} className="text-destructive hover:text-destructive/80" aria-label="Remove bundle">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <ul className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
                  {b.lines.map((item) => (
                    <li key={item.lineId} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded-md object-cover" />
                      <Link to={mp(`/product/${item.product.slug}`)} className="flex-1 truncate hover:text-primary">
                        {item.product.name}
                      </Link>
                      <span className="font-mono text-xs">
                        {item.compareAtPrice !== undefined && (
                          <span className="mr-1.5 line-through opacity-60">{format(item.compareAtPrice)}</span>
                        )}
                        <span className="font-semibold text-foreground">{format(item.unitPrice)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                  −{b.discountPct}% bundle discount shown per vial · free shipping applies automatically
                </p>
              </div>
            ))}
            {singles.map((item) => (
              <div key={item.lineId} className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-card">
                <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-md object-cover" />
                <div className="flex flex-1 flex-col">
                  <Link to={mp(`/product/${item.product.slug}`)} className="font-display font-semibold text-foreground hover:text-primary">
                    {item.product.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {item.product.category}
                    {item.variantLabel && <> · <span className="font-semibold text-foreground">{item.variantLabel}</span></>}
                  </span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} className="rounded-md border border-border p-1.5 hover:bg-muted">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[2ch] text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="rounded-md border border-border p-1.5 hover:bg-muted">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display font-bold text-foreground">{format(item.unitPrice * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.lineId)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-card h-fit">
          <CartCountdown variant="banner" className="mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground">{COPY.order_summary.en} · {COPY.order_summary.de}</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{COPY.subtotal.en} / {COPY.subtotal.de}</span><span data-testid="cart-subtotal">{format(subtotal)}</span>
            </div>
            {bundleSavings > 0 && (
              <div className="flex justify-between font-semibold text-trust">
                <span>Bundle savings (applied)</span><span data-testid="cart-bundle-savings">−{format(bundleSavings)}</span>
              </div>
            )}
            {isDiscountEligible && (
              <div className="flex justify-between font-semibold text-trust">
                <span>{discountCode} (−10%)</span><span>−{format(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>{COPY.shipping.en} / {COPY.shipping.de}</span>
              {shippingCost === 0 ? (
                <span className="font-semibold text-trust">{COPY.free.en} · {COPY.free.de}</span>
              ) : (
                <span data-testid="cart-shipping">{format(shippingCost)}</span>
              )}
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{COPY.tax.en} / {COPY.tax.de}</span><span>{format(0)}</span>
            </div>
          </div>
          {!isDiscountEligible && (
            <Link to="/auth" className="mt-4 block rounded-lg bg-primary/10 px-3 py-2.5 text-center text-xs font-semibold text-primary hover:bg-primary/15">
              🎁 Sign in to auto-apply PEPTIDESA10 (10% off your first order)
            </Link>
          )}
          <div className="mt-4 border-t border-border pt-4 flex justify-between font-display text-lg font-bold text-foreground">
            <span>{COPY.total.en} / {COPY.total.de}</span><span data-testid="cart-total">{format(grandTotal)}</span>

          </div>
          <Link
            to={mp("/checkout")}
            className="mt-6 block w-full rounded-lg bg-hero-gradient py-3.5 text-center font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
          <p className="mt-4 text-center text-xs text-muted-foreground">🔒 {trilingual("secure_checkout")}</p>
        </div>
      </div>
    </div>
    </>
  );
}
