import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, CheckCircle2, ShoppingCart, Users, MousePointerClick, MailCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface EventRow {
  id: string;
  event: string;
  source: string;
  created_at: string;
  user_id: string | null;
  order_id: string | null;
  props: Json;
}

interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
}

interface ConsentRow {
  id: number;
  marketing_consent: boolean;
  accepted_at: string;
}

const pct = (numerator: number, denominator: number) =>
  denominator > 0 ? `${Math.round((numerator / denominator) * 100)}%` : "—";

export default function AdminLifecyclePage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [consents, setConsents] = useState<ConsentRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { navigate("/"); return; }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    void (async () => {
      const [eventsRes, ordersRes, consentsRes] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("id, event, source, created_at, user_id, order_id, props")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("orders")
          .select("id, user_id, status, total, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("checkout_consents")
          .select("id, marketing_consent, accepted_at")
          .gte("accepted_at", since)
          .order("accepted_at", { ascending: false })
          .limit(1000),
      ]);

      const firstError = eventsRes.error ?? ordersRes.error ?? consentsRes.error;
      if (firstError) setError(firstError.message);
      setEvents((eventsRes.data ?? []) as EventRow[]);
      setOrders((ordersRes.data ?? []) as OrderRow[]);
      setConsents((consentsRes.data ?? []) as ConsentRow[]);
      setLoadingData(false);
    })();
  }, [user, isAdmin, loading, navigate]);

  const metrics = useMemo(() => {
    const eventCount = (name: string) => events.filter((event) => event.event === name).length;
    const checkoutStarts = eventCount("checkout_started");
    const paidOrders = orders.filter((order) => ["paid", "processing", "packed", "shipped", "dispatched", "delivered"].includes(order.status.toLowerCase()));
    const customerOrderCounts = new Map<string, number>();
    for (const order of orders) customerOrderCounts.set(order.user_id, (customerOrderCounts.get(order.user_id) ?? 0) + 1);
    const repeatCustomers = [...customerOrderCounts.values()].filter((count) => count > 1).length;
    const portalUsers = new Set(events.filter((event) => event.event === "portal_viewed").map((event) => event.user_id).filter(Boolean));
    const marketingOptIns = consents.filter((consent) => consent.marketing_consent).length;
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
    return {
      checkoutStarts,
      paidOrders: paidOrders.length,
      revenue,
      uniqueCustomers: customerOrderCounts.size,
      repeatCustomers,
      portalUsers: portalUsers.size,
      trackerOpens: eventCount("portal_tracker_opened"),
      consentReceipts: consents.length,
      marketingOptIns,
    };
  }, [events, orders, consents]);

  if (loading || loadingData) {
    return <div className="container py-20 text-center text-muted-foreground">Loading lifecycle analytics…</div>;
  }

  const cards = [
    { label: "Checkout starts", value: metrics.checkoutStarts.toLocaleString("en-ZA"), note: "Browser event", icon: ShoppingCart },
    { label: "Paid orders", value: metrics.paidOrders.toLocaleString("en-ZA"), note: `${pct(metrics.paidOrders, metrics.checkoutStarts)} checkout conversion`, icon: CheckCircle2 },
    { label: "Verified revenue", value: `R${metrics.revenue.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`, note: "Paid order rows", icon: Activity },
    { label: "Portal customers", value: metrics.portalUsers.toLocaleString("en-ZA"), note: `${metrics.trackerOpens} tracker hand-offs`, icon: Users },
    { label: "Consent coverage", value: pct(metrics.consentReceipts, orders.length), note: `${metrics.consentReceipts} versioned receipts`, icon: MousePointerClick },
    { label: "Marketing opt-in", value: pct(metrics.marketingOptIns, metrics.consentReceipts), note: `${metrics.marketingOptIns} explicit opt-ins`, icon: MailCheck },
    { label: "Repeat customers", value: pct(metrics.repeatCustomers, metrics.uniqueCustomers), note: `${metrics.repeatCustomers} of ${metrics.uniqueCustomers}`, icon: RefreshCw },
  ];

  return (
    <div className="container py-10 md:py-12">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to admin
      </Link>
      <div className="mt-6 overflow-hidden rounded-3xl bg-[#041b36] p-6 text-white sm:p-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#55c8be]">Lifecycle intelligence</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Customer journey · last 30 days</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          First-party events from storefront discovery through consent, payment, portal engagement, tracker hand-off and repeat purchase.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Some lifecycle data could not be loaded: {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <card.icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
          </article>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Event stream</p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">Most recent lifecycle signals</h2>
          </div>
          <span className="text-xs text-muted-foreground">{events.length.toLocaleString("en-ZA")} events loaded</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2 pr-4">Time</th><th className="py-2 pr-4">Event</th><th className="py-2 pr-4">Source</th><th className="py-2 pr-4">Customer</th><th className="py-2">Order</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.slice(0, 30).map((event) => (
                <tr key={event.id}>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString("en-ZA")}</td>
                  <td className="py-3 pr-4 font-semibold text-foreground">{event.event.replaceAll("_", " ")}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{event.source}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{event.user_id?.slice(0, 8) ?? "anonymous"}</td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">{event.order_id?.slice(0, 8) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No lifecycle events in this window yet.</p>}
        </div>
      </section>
    </div>
  );
}
