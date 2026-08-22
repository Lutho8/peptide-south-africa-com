import { getProductBySlug, products } from "@/data/products";

export interface ReorderLine {
  slug: string;
  variantLabel?: string;
  qty: number;
}

interface ReorderSource {
  order_items: unknown;
  order_description: string | null;
}

function parseDescription(desc: string | null): ReorderLine[] {
  if (!desc) return [];
  return desc
    .split(",")
    .map((chunk) => chunk.trim())
    .map((chunk) => {
      const match = chunk.match(/^(.+?)(?:\s+\((.+?)\))?\s+x(\d+)$/i);
      if (!match) return null;
      const [, name, variant, qty] = match;
      const product = products.find((candidate) => candidate.name.toLowerCase() === name.trim().toLowerCase());
      if (!product) return null;
      return { slug: product.slug, variantLabel: variant ?? undefined, qty: Number(qty) || 1 };
    })
    .filter((line): line is ReorderLine => line !== null);
}

/** Prefer the structured checkout snapshot; keep legacy description parsing for older orders. */
export function getReorderLines(order: ReorderSource): ReorderLine[] {
  if (Array.isArray(order.order_items)) {
    const structured = order.order_items.flatMap((item): ReorderLine[] => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      const slug = typeof row.product_slug === "string" ? row.product_slug : "";
      const qty = typeof row.quantity === "number" && row.quantity > 0 ? Math.floor(row.quantity) : 1;
      if (!slug || !getProductBySlug(slug)) return [];
      return [{
        slug,
        variantLabel: typeof row.variant_label === "string" ? row.variant_label : undefined,
        qty,
      }];
    });
    if (structured.length > 0) return structured;
  }
  return parseDescription(order.order_description);
}
