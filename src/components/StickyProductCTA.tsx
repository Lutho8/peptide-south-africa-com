import { useCurrency } from "@/context/CurrencyContext";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  variantLabel?: string;
  price: number;
  added: boolean;
  onAdd: () => void;
}

export default function StickyProductCTA({ product, variantLabel, price, added, onAdd }: Props) {
  const { display } = useCurrency();
  const priceDisplay = display(price);
  const cta = !product.inStock
    ? "Out of Stock"
    : product.track === "GP"
      ? "Start Quiz"
      : added
        ? "✓ Added"
        : "Buy now";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Purchase this product"
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <img
          src={product.image}
          alt=""
          className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">{product.name}</p>
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-sm font-bold text-foreground">{priceDisplay.primary}</span>
            {variantLabel && (
              <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {variantLabel}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!product.inStock}
          className="min-h-11 flex-shrink-0 rounded-lg bg-hero-gradient px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-95 disabled:opacity-60"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
