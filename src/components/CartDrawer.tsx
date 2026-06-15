import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { COPY } from "@/lib/copy";
import CartCountdown from "@/components/CartCountdown";
import FrequentlyBoughtTogether from "@/components/FrequentlyBoughtTogether";
import { useMarket, marketPath } from "@/hooks/useMarket";

const FREE_SHIP_THRESHOLD = 1500; // ZAR

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalPrice, discountAmount, discountCode, isDiscountEligible, totalItems } = useCart();
  const { format } = useCurrency();
  const { market } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  const anchorSlug = items[0]?.product.slug;
  const shipProgress = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  const shipRemaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold text-foreground">Your Cart ({totalItems})</h2>
          <button onClick={() => setIsCartOpen(false)} aria-label="Close cart" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 hover:bg-muted">
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
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.lineId} className="flex gap-3 rounded-lg border border-border p-3">
                    <img src={item.product.image} alt={item.product.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-md object-cover" />
                    <div className="flex flex-1 flex-col">
                      <h4 className="font-display text-sm font-semibold text-foreground">{item.product.name}</h4>
                      {item.variantLabel && (
                        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{item.variantLabel}</span>
                      )}
                      <span className="text-sm font-bold text-primary">{format(item.unitPrice)}</span>
                      <div className="mt-auto flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} aria-label="Decrease quantity" className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} aria-label="Increase quantity" className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => removeFromCart(item.lineId)} className="ml-auto text-xs text-destructive hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free-shipping progress */}
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
                {shipRemaining > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add <span className="font-bold text-foreground">{format(shipRemaining)}</span> more for <span className="font-semibold text-trust">free shipping</span>
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-trust">✓ Free shipping unlocked</p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full bg-trust transition-all" style={{ width: `${shipProgress}%` }} />
                </div>
              </div>

              {/* Frequently bought together */}
              {anchorSlug && (
                <div className="mt-4">
                  <FrequentlyBoughtTogether slug={anchorSlug} variant="compact" />
                </div>
              )}
            </div>

            <div className="border-t border-border p-4">
              <CartCountdown variant="banner" className="mb-3" />
              <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>{COPY.subtotal.en} / {COPY.subtotal.de}</span><span>{format(subtotal)}</span>
              </div>
              {isDiscountEligible && (
                <div className="mb-1 flex justify-between text-sm font-semibold text-trust">
                  <span>{discountCode} (−10%)</span><span>−{format(discountAmount)}</span>
                </div>
              )}
              {!isDiscountEligible && (
                <Link to="/auth" onClick={() => setIsCartOpen(false)} className="mb-2 block rounded-md bg-primary/10 px-2 py-1.5 text-center text-xs font-semibold text-primary hover:bg-primary/15">
                  🎁 Sign in to auto-apply PEPTIDESA10 (10% off)
                </Link>
              )}
              <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>{COPY.shipping.en} / {COPY.shipping.de}</span><span className="font-semibold text-trust">{COPY.free.en} · {COPY.free.de}</span>
              </div>
              <div className="mb-4 flex justify-between font-display text-lg font-bold text-foreground">
                <span>{COPY.total.en} / {COPY.total.de}</span><span>{format(totalPrice)}</span>
              </div>
              <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Cart → Shipping → Pay
              </p>
              <Link
                to={mp("/checkout")}
                onClick={() => setIsCartOpen(false)}
                className="block w-full rounded-lg bg-hero-gradient py-4 text-center text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.99]"
              >
                Secure Checkout →
              </Link>
              <Link
                to={mp("/cart")}
                onClick={() => setIsCartOpen(false)}
                className="mt-2 block w-full rounded-lg border border-border py-2.5 text-center text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
