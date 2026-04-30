import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, FlaskConical, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { formatZAR } from "@/lib/currency";
import StockBadge from "@/components/StockBadge";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1;

  const handleAdd = () => {
    if (!product.inStock) {
      navigate(`/product/${product.slug}`);
      return;
    }
    if (hasMultipleVariants) {
      // Force the user to pick a size on the PDP rather than silently choose.
      navigate(`/product/${product.slug}#variants`);
      return;
    }
    const onlyVariant = product.variants?.[0];
    addToCart(product, onlyVariant ? { variantLabel: onlyVariant.label, unitPrice: onlyVariant.price } : undefined);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted">
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
        {/* Trust micro-row (purity + COA) */}
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

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-3 flex items-baseline justify-between">
          <p className="font-display text-base font-bold text-primary">
            {product.priceRange || formatZAR(product.price)}
          </p>
          {hasMultipleVariants && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {product.variants!.length} sizes
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 rounded-lg border border-border px-3 py-2.5 text-center text-xs font-semibold text-foreground transition-all hover:bg-muted"
          >
            View
          </Link>
          <button
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {!product.inStock ? "Notify Me" : hasMultipleVariants ? "Select Size" : "Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
