import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import ExpressCheckoutButton from "@/components/ExpressCheckoutButton";

import { useMarket, marketPath } from "@/hooks/useMarket";
import { cartBundleSavings } from "@/lib/bundlePricing";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    removeBundle,
    updateQuantity,
    subtotal,
    discountAmount,
    totalItems,
  } = useCart();
  const { format } = useCurrency();
  const { market } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  const anchorSlug = items[0]?.product.slug;
  const singles = items.filter((i) => !i.bundleId);
  const bundleIds = [...new Set(items.filter((i) => i.bundleId).map((i) => i.bundleId as string))];
  const bundles = bundleIds.map((id) => {
    const lines = items.filter((i) => i.bundleId === id);
    return {
      id,
      label: lines[0]?.bundleLabel ?? "Pick & Mix Bundle",
      lines,
      total: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    };
  });
  const specialOffer = Math.round((cartBundleSavings(items) + discountAmount) * 100) / 100;

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex items-center justify-center border-b border-border p-4">
          <h2 className="font-display text-lg font-bold text-foreground">My Cart{totalItems > 0 ? ` (${totalItems})` : ""}</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="absolute right-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {bundles.map((b) => (
                  <div key={b.id} className="rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display text-sm font-bold text-foreground">{b.label}</h4>
                        <span className="text-sm font-bold text-primary">{format(b.total)}</span>
                      </div>
                      <button onClick={() => removeBundle(b.id)} aria-label="Remove bundle" className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <ul className="mt-2 flex flex-col gap-1.5 border-t border-border/60 pt-2">
                      {b.lines.map((item) => (
                        <li key={item.lineId} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={`${vialTileFrameClasses} block h-8 w-8 shrink-0`} data-testid={VIAL_TEST_ID}>
                            <span aria-hidden className={vialAccentBarSmClasses} />
                            <img src={item.product.image} alt={item.product.name} loading="lazy" className="h-full w-full object-cover" />
                          </span>
                          <span className="flex-1 truncate">{item.product.name}</span>
                          <span className="font-mono">{format(item.unitPrice)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {singles.map((item) => (
                  <div key={item.lineId} className="relative flex gap-3 rounded-lg border border-border bg-background p-3">
                    <span className={`${vialTileFrameClasses} block h-20 w-20 shrink-0`} data-testid={VIAL_TEST_ID}>
                      <span aria-hidden className={vialAccentBarSmClasses} />
                      <img src={item.product.image} alt={item.product.name} loading="lazy" className="h-full w-full object-cover" />
                    </span>
                    <div className="flex flex-1 flex-col pr-6">
                      <h4 className="font-display text-sm font-semibold text-foreground">{item.product.name}</h4>
                      {item.variantLabel && (
                        <span className="text-xs text-muted-foreground">{item.variantLabel}</span>
                      )}
                      <span className="text-sm font-bold text-foreground">{format(item.unitPrice)}</span>
                      <div className="mt-auto flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} aria-label="Decrease quantity" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} aria-label="Increase quantity" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.lineId)}
                      aria-label="Remove item"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4">
              {specialOffer > 0 && (
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-destructive">Special Offer</span>
                  <span className="font-semibold text-destructive">−{format(specialOffer)}</span>
                </div>
              )}
              <div className="mb-1 flex justify-between text-base font-bold text-foreground">
                <span>Subtotal</span><span>{format(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">Shipping & taxes calculated at checkout</p>

              <ExpressCheckoutButton onNavigate={() => setIsCartOpen(false)} className="mb-3" />

              <Link
                to={mp("/checkout")}
                onClick={() => setIsCartOpen(false)}
                className="block w-full rounded-lg border border-border py-3.5 text-center text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
              >
                Checkout with details
              </Link>


              {anchorSlug && (
                <div className="mt-4">
                  <FrequentlyBoughtTogether slug={anchorSlug} variant="single" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
