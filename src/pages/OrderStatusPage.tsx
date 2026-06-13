import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { COPY } from "@/lib/copy";

type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

interface OrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  paid_at: string | null;
  order_description: string | null;
  created_at: string;
}

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status,total,currency,paid_at,order_description,created_at")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
      } else {
        setOrder(data as OrderRow);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`order:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => {
          if (!cancelled) setOrder(payload.new as OrderRow);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id]);

  const status: OrderStatus = order?.status ?? "pending";
  const isPaid = status === "paid";
  const isCancelled = status === "cancelled" || status === "failed";
  const isPending = !isPaid && !isCancelled;

  const Icon = isPaid ? CheckCircle : isCancelled ? XCircle : Loader2;
  const iconClass = isPaid
    ? "text-trust"
    : isCancelled
      ? "text-destructive"
      : "text-primary animate-spin";
  const bgClass = isPaid
    ? "bg-trust/10"
    : isCancelled
      ? "bg-destructive/10"
      : "bg-primary/10";

  const headlineKey = isPaid ? "paid" : isCancelled ? "cancelled" : "pending";

  const formatMoney = (n: number, _ccy: string) =>
    `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <SEO title="Order Status" description="Your order status and receipt." path={`/order/${id}`} noindex />
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${bgClass}`}>
          <Icon className={`h-10 w-10 ${iconClass}`} />
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold text-foreground" data-testid="order-status-headline">
          {COPY[headlineKey].en}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {COPY[headlineKey].de} · {COPY[headlineKey].af}
        </p>

        {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}

        {notFound && !loading && (
          <p className="mt-4 max-w-md text-muted-foreground">
            We couldn't find that order. If you just paid, refresh in a moment — confirmations sometimes take up to a minute.
          </p>
        )}

        {order && (
          <div className="mt-6 w-full max-w-md rounded-xl border border-border bg-card p-5 text-left">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>{COPY.order_number.en} / {COPY.order_number.de}</span>
              <span className="font-mono text-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            {order.order_description && (
              <p className="mt-3 text-sm text-foreground">{order.order_description}</p>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-muted-foreground">
                {COPY.total.en} / {COPY.total.de}
              </span>
              <span className="font-display text-lg font-bold text-foreground" data-testid="order-total">
                {formatMoney(Number(order.total), order.currency)}
              </span>
            </div>
            {isPending && (
              <p className="mt-3 text-xs text-muted-foreground">
                {COPY.thank_you.en} — {COPY.thank_you.de}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/shop" className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
            {COPY.continue_shopping.en} · {COPY.continue_shopping.de}
          </Link>
          {isCancelled && (
            <Link to="/cart" className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground">
              {COPY.back_to_cart.en} · {COPY.back_to_cart.de}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
