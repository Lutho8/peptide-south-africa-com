import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Repeat, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { products, getProductBySlug } from "@/data/products";
import { toast } from "sonner";

interface OrderRow {
  id: string;
  total: number;
  status: string;
  currency: string;
  created_at: string;
  paid_at: string | null;
  order_description: string | null;
}

function statusTone(status: string) {
  switch (status) {
    case "paid":
      return "bg-trust/10 text-trust";
    case "pending":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "cancelled":
    case "failed":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/**
 * Parse "Retatrutide (3-Pack) x1, BPC-157 (Single Vial) x2" back into
 * { slug, variantLabel, qty } so we can rebuild the cart on reorder.
 */
function parseDescription(desc: string | null): { slug: string; variantLabel?: string; qty: number }[] {
  if (!desc) return [];
  return desc
    .split(",")
    .map((chunk) => chunk.trim())
    .map((chunk) => {
      const m = chunk.match(/^(.+?)(?:\s+\((.+?)\))?\s+x(\d+)$/i);
      if (!m) return null;
      const [, name, variant, qtyStr] = m;
      const product = products.find(
        (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (!product) return null;
      return { slug: product.slug, variantLabel: variant ?? undefined, qty: Number(qtyStr) || 1 };
    })
    .filter((x): x is { slug: string; variantLabel: string | undefined; qty: number } => x !== null);
}

export default function OrdersList() {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total, status, currency, created_at, paid_at, order_description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders((data ?? []) as OrderRow[]);
      setLoading(false);
    })();
  }, [user]);

  const reorder = (order: OrderRow) => {
    const parsed = parseDescription(order.order_description);
    if (parsed.length === 0) {
      toast.error("Couldn't reconstruct this order — please add items manually.");
      return;
    }
    setReordering(order.id);
    let added = 0;
    for (const line of parsed) {
      const product = getProductBySlug(line.slug);
      if (!product) continue;
      const variant = product.variants?.find((v) => v.label === line.variantLabel);
      for (let i = 0; i < line.qty; i++) {
        addToCart(product, {
          variantLabel: variant?.label,
          unitPrice: variant?.price ?? product.price,
          silent: i < line.qty - 1, // open drawer only on the very last add
        });
        added++;
      }
    }
    toast.success(`${added} item${added === 1 ? "" : "s"} added to cart`);
    setIsCartOpen(true);
    setReordering(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-10 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Package className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-medium text-foreground">No orders yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Your purchases will appear here.</p>
        <Link to="/shop" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Browse shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const lines = parseDescription(order.order_description);
        const canReorder = lines.length > 0 && order.status === "paid";
        return (
          <div key={order.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 font-display text-base font-bold text-foreground">
                  R{Number(order.total).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/order/${order.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Details
                </Link>
                {canReorder && (
                  <button
                    onClick={() => reorder(order)}
                    disabled={reordering === order.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {reordering === order.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Repeat className="h-3 w-3" />
                    )}
                    Reorder
                  </button>
                )}
              </div>
            </div>
            {order.order_description && (
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {order.order_description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
