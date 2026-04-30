import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import type { Product } from "@/data/products";

interface Props {
  product: Pick<Product, "inStock" | "stock">;
  size?: "sm" | "md";
  className?: string;
}

export default function StockBadge({ product, size = "sm", className = "" }: Props) {
  const text =
    !product.inStock
      ? "Pre-Order — Reserve Yours"
      : typeof product.stock === "number" && product.stock <= 5
        ? `Only ${product.stock} left in stock`
        : "In Stock";

  const Icon =
    !product.inStock
      ? Clock
      : typeof product.stock === "number" && product.stock <= 5
        ? AlertTriangle
        : CheckCircle2;

  const tone =
    !product.inStock
      ? "bg-muted text-muted-foreground ring-border"
      : typeof product.stock === "number" && product.stock <= 5
        ? "bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-400"
        : "bg-trust/10 text-trust ring-trust/20";

  const padding = size === "md" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ${tone} ${padding} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}
