import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products } from "@/data/products";
import { CHECKOUT_SUPPLIES_SLUGS } from "@/data/bundles";
import { VIAL_TEST_ID, vialFrame } from "@/lib/vialDesign";

/**
 * Compact rail rendered above the checkout Order Summary. Surfaces the three
 * universal reconstitution supplies (BAC water, alcohol swabs, syringes) with
 * one-tap add. Uses the shared vial tile tokens so the packaging stays
 * consistent with the rest of the cart/checkout flow.
 */
export default function CheckoutSuppliesRail() {
  const { addToCart, items } = useCart();
  const { format } = useCurrency();

  const supplies = CHECKOUT_SUPPLIES_SLUGS
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p && p.inStock);

  if (supplies.length === 0) return null;

  const { frame, bar } = vialFrame("sm");
  const inCart = (slug: string) => items.some((i) => i.product.slug === slug);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Add reconstitution supplies
        </p>
        <span className="text-[10px] text-muted-foreground">One-tap add</span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {supplies.map((p) => {
          const unit = p.variants?.[p.variants.length - 1]?.price ?? p.price;
          const label = p.variants?.[p.variants.length - 1]?.label;
          const already = inCart(p.slug);
          return (
            <li key={p.slug} className="flex items-center gap-3">
              <span className={`${frame} block h-12 w-12 shrink-0`} data-testid={VIAL_TEST_ID}>
                <span aria-hidden className={bar} />
                <img
                  src={p.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/product/${p.slug}`}
                  className="block truncate text-xs font-semibold text-foreground hover:underline"
                >
                  {p.name}
                </Link>
                <span className="text-[11px] text-muted-foreground">
                  {format(unit)}{label ? ` · ${label}` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  addToCart(p, {
                    variantLabel: label,
                    unitPrice: unit,
                    silent: true,
                  })
                }
                disabled={already}
                aria-label={`Add ${p.name} to order`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {already ? "Added" : (<><Plus className="h-3 w-3" /> Add</>)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
