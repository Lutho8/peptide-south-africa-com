import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, FlaskConical, CheckCircle2, Stethoscope } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product, Variant } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import StockBadge from "@/components/StockBadge";
import TrackBadge from "@/components/TrackBadge";
import { useMarket, marketPath } from "@/hooks/useMarket";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { display, currency, rate, format } = useCurrency();
  const { market } = useMarket();
  const productUrl = marketPath(`/product/${product.slug}`, market);

  const packVariants = useMemo(
    () => (product.variants ?? []).filter((v) => typeof v.pack === "number"),
    [product.variants],
  );
  const hasPackVariants = packVariants.length > 0;
  // Default to middle (5-pack) for best perceived value.
  const defaultIdx = packVariants.findIndex((v) => v.pack === 5);
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0);
  const selected: Variant | undefined = packVariants[selectedIdx];

  const hasMultipleVariants = !hasPackVariants && (product.variants?.length ?? 0) > 1;

  // Convert EUR price range to ZAR display when ZAR is active.
  const priceRangeDisplay = (() => {
    if (!product.priceRange) return null;
    if (currency === "EUR") return product.priceRange;
    const nums = product.priceRange.match(/[\d.,]+/g)?.map((s) => parseFloat(s.replace(",", "."))) ?? [];
    if (nums.length !== 2) return product.priceRange;
    const fmt = (eur: number) => `R${(eur * rate).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
    return `${fmt(nums[0])} – ${fmt(nums[1])}`;
  })();
  const priceDisplay = display(selected?.price ?? product.price);

  const handleAdd = () => {
    if (!product.inStock) {
      navigate(productUrl);
      return;
    }
    if (hasPackVariants && selected) {
      addToCart(product, { variantLabel: selected.label, unitPrice: selected.price });
      return;
    }
    if (hasMultipleVariants) {
      navigate(`${productUrl}#variants`);
      return;
    }
    const onlyVariant = product.variants?.[0];
    addToCart(
      product,
      onlyVariant ? { variantLabel: onlyVariant.label, unitPrice: onlyVariant.price } : undefined,
    );
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <Link to={productUrl} className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {product.tag}
          </span>
        )}
        <span className="absolute right-3 top-3">
          <StockBadge product={product} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {/* Trust micro-row */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
          {product.purity && (
            <span className="inline-flex items-center gap-1 rounded bg-primary/5 px-1.5 py-0.5 text-primary ring-1 ring-primary/15">
              <FlaskConical className="h-3 w-3" /> {product.purity} HPLC
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded bg-trust/5 px-1.5 py-0.5 text-trust ring-1 ring-trust/15">
            <ShieldCheck className="h-3 w-3" /> COA Verified
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {product.category}
        </p>
        <Link to={productUrl}>
          <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {product.shortDescription}
        </p>

        {/* Headline price row */}
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <p className="font-display text-base font-bold text-primary">
              {hasPackVariants ? priceDisplay.primary : priceRangeDisplay || priceDisplay.primary}
            </p>
            {hasPackVariants ? (
              <p className="text-[10px] uppercase tracking-wide text-trust font-semibold">
                {product.inStock ? "Available" : "Pre-Order"}
              </p>
            ) : null}
          </div>
        </div>

        {/* Pack picker */}
        {hasPackVariants && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {packVariants.map((v, i) => {
              const isSelected = i === selectedIdx;
              const totalMg = (v.pack ?? 1) * (v.mgPerVial ?? 1);
              const perMgEur = v.price / totalMg;
              const perMgZar = perMgEur * rate;
              const perMgLabel =
                currency === "EUR"
                  ? `€${perMgEur.toFixed(2)}/mg`
                  : `R${perMgZar.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}/mg`;
              return (
                <button
                  type="button"
                  key={v.label}
                  onClick={() => setSelectedIdx(i)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {v.label}
                  </span>
                  <span className="font-display text-sm font-bold text-foreground">
                    {format(v.price)}
                  </span>
                  <span className="text-[10px] font-medium text-primary">{perMgLabel}</span>
                  {typeof v.stock === "number" && (
                    <span className={`text-[10px] font-semibold ${v.stock <= 2 ? "text-destructive" : "text-trust"}`}>
                      {v.stock} Avail
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Link
            to={productUrl}
            className="flex-1 rounded-lg border border-border px-3 py-2.5 text-center text-xs font-semibold text-foreground transition-all hover:bg-muted"
          >
            View
          </Link>
          <button
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {!product.inStock
              ? "Notify Me"
              : hasPackVariants
                ? "Add To Cart"
                : hasMultipleVariants
                  ? "Select Size"
                  : "Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
