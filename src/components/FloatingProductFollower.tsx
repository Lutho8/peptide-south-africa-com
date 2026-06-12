import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X, Stethoscope, ShoppingCart } from "lucide-react";
import { useLastViewedProduct } from "@/context/LastViewedProductContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";

/**
 * Site-wide floating follower card for the last-viewed product.
 *
 * - position: fixed bottom-right (desktop only — mobile already has StickyMobileCTA).
 * - z-index 45: sits BELOW WhatsApp/Text-us launchers (z-50) so they remain tappable.
 * - Auto-hides on /cart, /checkout, /product/:slug (current PDP), and after dismiss.
 * - Uses transform + opacity for the entrance (no layout thrash).
 */
export default function FloatingProductFollower() {
  const { lastViewed, dismissed, dismiss } = useLastViewedProduct();
  const { display } = useCurrency();
  const { addToCart, setIsCartOpen } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!lastViewed || dismissed) return null;

  // Hide on routes where it would be noise or duplicate
  const hideRoutes = ["/cart", "/checkout"];
  if (hideRoutes.some((r) => pathname.startsWith(r))) return null;
  if (pathname.includes(`/product/${lastViewed.slug}`)) return null;

  const visible = mounted && scrolled;
  const isGP = lastViewed.track === "GP";
  const priceLabel = display(lastViewed.price).primary;

  const handlePrimary = () => {
    if (isGP) {
      navigate(`/quiz?product=${lastViewed.slug}`);
      return;
    }
    // Minimal cart payload — uses canonical price; real variant selection lives on PDP.
    addToCart(
      {
        id: lastViewed.slug,
        slug: lastViewed.slug,
        name: lastViewed.name,
        image: lastViewed.image,
        price: lastViewed.price,
      } as never,
      { unitPrice: lastViewed.price, silent: true },
    );
    setIsCartOpen(true);
    dismiss();
  };

  return (
    <aside
      role="complementary"
      aria-label="Continue with last-viewed product"
      className="pointer-events-none fixed bottom-6 right-6 z-[45] hidden md:block"
      style={{
        transform: visible ? "translateY(0)" : "translateY(160%)",
        opacity: visible ? 1 : 0,
        transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease-out",
      }}
    >
      <div className="pointer-events-auto grid w-[340px] grid-cols-[64px_1fr] gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-card-hover backdrop-blur-lg">
        <Link to={`/product/${lastViewed.slug}`} className="block overflow-hidden rounded-lg bg-muted">
          <img src={lastViewed.image} alt="" className="h-16 w-16 object-cover" loading="lazy" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                {isGP ? "GP-prescribed" : "Continue browsing"}
              </p>
              <Link
                to={`/product/${lastViewed.slug}`}
                className="block truncate font-display text-sm font-semibold text-foreground hover:text-primary"
              >
                {lastViewed.name}
              </Link>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-bold text-foreground">{priceLabel}</span>
            <button
              type="button"
              onClick={handlePrimary}
              className="inline-flex items-center gap-1 rounded-lg bg-hero-gradient px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              {isGP ? (
                <>
                  <Stethoscope className="h-3.5 w-3.5" /> Book consult
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" /> Add to cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
