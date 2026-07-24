import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { products, type Product } from "@/data/products";
import { CHECKOUT_SUPPLIES_SLUGS } from "@/data/bundles";
import { VIAL_TEST_ID, vialFrame } from "@/lib/vialDesign";

/**
 * Compact rail rendered above the checkout Order Summary. Surfaces the
 * universal reconstitution supplies (BAC water, alcohol swabs, syringes) with
 * inline variant selection + quantity controls so accessories can be upsold
 * without leaving the checkout page. Uses the shared vial tile tokens so
 * packaging stays consistent with the rest of the cart/checkout flow.
 */
export default function CheckoutSuppliesRail() {
  const { addToCart, updateQuantity, items } = useCart();
  const { format } = useCurrency();

  const supplies = CHECKOUT_SUPPLIES_SLUGS
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => !!p && p.inStock);

  // Empty state: no in-stock supplies → render nothing (no rail chrome).
  if (supplies.length === 0) return null;

  const { frame, bar } = vialFrame("sm");

  return (
    <div
      className="rounded-lg border border-border bg-card p-4"
      data-testid="checkout-supplies-rail"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Add reconstitution supplies
        </p>
        <span className="text-[10px] text-muted-foreground">Inline add</span>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {supplies.map((p) => (
          <SupplyRow
            key={p.slug}
            product={p}
            frame={frame}
            bar={bar}
            format={format}
            items={items}
            addToCart={addToCart}
            updateQuantity={updateQuantity}
          />
        ))}
      </ul>
    </div>
  );
}

interface SupplyRowProps {
  product: Product;
  frame: string;
  bar: string;
  format: (n: number) => string;
  items: ReturnType<typeof useCart>["items"];
  addToCart: ReturnType<typeof useCart>["addToCart"];
  updateQuantity: ReturnType<typeof useCart>["updateQuantity"];
}

function SupplyRow({ product, frame, bar, format, items, addToCart, updateQuantity }: SupplyRowProps) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 1;
  const defaultVariantIdx = variants.length ? variants.length - 1 : 0;
  const [variantIdx, setVariantIdx] = useState(defaultVariantIdx);

  const activeVariant = variants[variantIdx];
  const unit = activeVariant?.price ?? product.price;
  const label = activeVariant?.label;

  const line = items.find(
    (i) => i.product.slug === product.slug && (i.variantLabel ?? undefined) === (label ?? undefined),
  );
  const qty = line?.quantity ?? 0;
  const inCart = qty > 0;

  const handleAdd = () =>
    addToCart(product, { variantLabel: label, unitPrice: unit, silent: true });

  return (
    <li className="flex items-center gap-3" data-testid={`supply-row-${product.slug}`}>
      <span className={`${frame} block h-12 w-12 shrink-0`} data-testid={VIAL_TEST_ID}>
        <span aria-hidden className={bar} />
        <img src={product.image} alt="" className="h-full w-full object-cover" loading="lazy" />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          to={`/product/${product.slug}`}
          className="block truncate text-xs font-semibold text-foreground hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{format(unit)}</span>
          {hasVariants && (
            <div
              role="radiogroup"
              aria-label={`${product.name} size`}
              className="inline-flex overflow-hidden rounded-md border border-border"
            >
              {variants.map((v, idx) => {
                const active = idx === variantIdx;
                return (
                  <button
                    key={v.label}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setVariantIdx(idx)}
                    className={
                      active
                        ? "bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
                        : "bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-primary/5"
                    }
                    data-testid={`supply-variant-${product.slug}-${v.label}`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {inCart ? (
        <div
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background"
          data-testid={`supply-stepper-${product.slug}`}
        >
          <button
            type="button"
            onClick={() => updateQuantity(line!.lineId, qty - 1)}
            aria-label={`Decrease ${product.name}`}
            className="flex h-7 w-7 items-center justify-center text-primary hover:bg-primary/5"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[1.25rem] text-center text-[11px] font-semibold tabular-nums text-foreground">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(line!.lineId, qty + 1)}
            aria-label={`Increase ${product.name}`}
            className="flex h-7 w-7 items-center justify-center text-primary hover:bg-primary/5"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to order`}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/5"
          data-testid={`supply-add-${product.slug}`}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      )}
      {inCart && (
        <span className="ml-1 min-w-[3.5rem] text-right text-[11px] font-medium tabular-nums text-muted-foreground">
          {format(unit * qty)}
        </span>
      )}
    </li>
  );
}
