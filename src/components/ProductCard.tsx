import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, FlaskConical, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product, Variant } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import StockBadge from "@/components/StockBadge";
import TrackBadge from "@/components/TrackBadge";
import { VIAL_TEST_ID, vialFrame } from "@/lib/vialDesign";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { format } = useCurrency();
  const productUrl = `/product/${product.slug}`;

  const singleVial: Variant | undefined = useMemo(
    () => (product.variants ?? []).find((v) => v.pack === 1),
    [product.variants],
  );
  const threePack: Variant | undefined = useMemo(
    () => (product.variants ?? []).find((v) => v.pack === 3),
    [product.variants],
  );

  const headlinePrice = singleVial?.price ?? product.price;
  const isGPTrack = product.track === "GP";
  const threePackSavings =
    threePack && singleVial ? singleVial.price * 3 - threePack.price : undefined;

  const handleAdd = () => {
    if (!product.inStock) {
      navigate(productUrl);
      return;
    }
    // Bundle-first: the card headlines the 3-Pack, so Add To Cart adds the 3-Pack.
    if (threePack) {
      addToCart(product, { variantLabel: threePack.label, unitPrice: threePack.price });
      return;
    }
    if (singleVial) {
      addToCart(product, { variantLabel: singleVial.label, unitPrice: singleVial.price });
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
      <Link
        to={productUrl}
        className="relative aspect-square overflow-hidden rounded-t-lg bg-vial-surface shadow-vial ring-1 ring-vial-border"
        data-testid="vial-frame"
      >
        {/* Teal accent band on the right edge — echoes the physical box */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-vial-accent" />
        <span aria-hidden className="pointer-events-none absolute right-1 top-3 h-1.5 w-1.5 rounded-full bg-vial-accent-strong" />
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
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
          {product.purity && (
            <span className="inline-flex items-center gap-1 rounded bg-primary/5 px-1.5 py-0.5 text-primary ring-1 ring-primary/15">
              <FlaskConical className="h-3 w-3" /> {product.purity} HPLC
            </span>
          )}
          <Link to="/testing" className="inline-flex items-center gap-1 rounded bg-trust/5 px-1.5 py-0.5 text-trust ring-1 ring-trust/15 hover:bg-trust/10">
            <ShieldCheck className="h-3 w-3" /> Janoshik COA
          </Link>
          <TrackBadge track={product.track} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {product.category}
          </p>
          {product.sku && (
            <p className="font-mono text-[10px] font-medium text-muted-foreground" title="Internal SKU">
              {product.sku}
            </p>
          )}
        </div>
        <Link to={productUrl}>
          <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {product.casNumber && (
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            CAS {product.casNumber}
          </p>
        )}

        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            {threePack ? (
              <>
                <p className="font-mono text-lg font-bold text-primary">
                  From {format(threePack.price)}
                  <span className="ml-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    / 3-Pack · 15% off
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                  or {format(headlinePrice)}/vial
                </p>
                {threePackSavings !== undefined && (
                  <Link
                    to={productUrl}
                    className="mt-0.5 inline-block font-mono text-[10px] font-semibold text-trust hover:underline"
                  >
                    Save {format(threePackSavings)} on 3-Pack
                  </Link>
                )}
              </>
            ) : (
              <p className="font-mono text-lg font-bold text-primary">
                {format(headlinePrice)}
                <span className="ml-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  / single vial
                </span>
              </p>
            )}
          </div>
        </div>

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
            {!product.inStock ? "Notify Me" : "Add To Cart"}
          </button>
        </div>
        {isGPTrack && product.inStock && (
          <Link
            to={`/quiz?product=${product.slug}`}
            className="mt-2 block text-center text-[11px] font-medium text-muted-foreground hover:text-primary hover:underline"
          >
            or book a clinician consult →
          </Link>
        )}
      </div>
    </div>
  );
}
