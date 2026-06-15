import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Check, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products } from "@/data/products";
import { BUNDLE_MAP, POST_ADD_ACCESSORIES } from "@/data/bundles";

const SESSION_KEY = "psa_postadd_shown";

/**
 * Modal that fires after the first addToCart in a session, suggesting
 * 2 complementary peptides. Dismissible, max once per session.
 * Mounted globally in App.tsx. Listens to cart `items` length growing
 * from 0/1 to trigger.
 */
export default function PostAddUpsellModal() {
  const { items, addToCart } = useCart();
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [anchorSlug, setAnchorSlug] = useState<string | null>(null);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    const newCount = items.length;
    if (newCount > prevCount && newCount === 1) {
      const shown = sessionStorage.getItem(SESSION_KEY);
      if (!shown) {
        setAnchorSlug(items[0].product.slug);
        // Defer so cart drawer animation doesn't conflict
        setTimeout(() => setOpen(true), 600);
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    }
    setPrevCount(newCount);
  }, [items, prevCount]);

  if (!open || !anchorSlug) return null;

  const hints = BUNDLE_MAP[anchorSlug] ?? POST_ADD_ACCESSORIES;
  const picks = hints
    .map((h) => products.find((p) => p.slug === h.slug))
    .filter((p): p is NonNullable<typeof p> => !!p && p.inStock)
    .slice(0, 2);

  if (picks.length === 0) {
    setOpen(false);
    return null;
  }

  const addOne = (slug: string) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    const v = p.variants?.[0];
    addToCart(p, { variantLabel: v?.label, unitPrice: v?.price ?? p.price, silent: true });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-trust/10 text-trust">
              <Check className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-foreground">Added to cart</h3>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-primary">Complete your protocol</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Researchers often pair these with your selection. One tap to add.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {picks.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <img src={typeof p.image === "string" ? p.image : ""} alt={p.name} className="h-14 w-14 rounded-md object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="block truncate font-display text-sm font-semibold text-foreground hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="truncate text-[11px] text-muted-foreground">{p.shortDescription}</p>
                  <span className="text-sm font-bold text-foreground">{format(p.variants?.[0]?.price ?? p.price)}</span>
                </div>
                <button
                  onClick={() => addOne(p.slug)}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  aria-label={`Add ${p.name}`}
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Keep shopping
            </button>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-hero-gradient py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90"
            >
              Secure checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
