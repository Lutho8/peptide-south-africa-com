import { useState } from "react";
import { Building2, CheckCircle2, Clock3, Copy, Loader2, Package, Search, Truck } from "lucide-react";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface TrackingResult {
  order: {
    reference: string;
    paymentStatus: string;
    placedAt: string;
    paidAt: string | null;
    deliveryMethod: string | null;
  };
  shipment: null | {
    status: string;
    courier: string | null;
    service: string;
    branch: string | null;
    trackingNumber: string | null;
    pickedAt: string | null;
    packedAt: string | null;
    dispatchedAt: string | null;
    readyForCollectionAt: string | null;
    deliveredAt: string | null;
    events: Array<{ status: string; at: string }>;
  };
}

const statusLabels: Record<string, string> = {
  payment_confirmed: "Payment confirmed",
  pending_pick: "Queued for packing",
  picking: "Items being picked",
  packed: "Packed and checked",
  dispatched: "Handed to PostNet",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  ready_for_collection: "Ready for collection",
  delivered: "Delivered",
  exception: "Delivery exception",
  returned: "Returned",
  cancelled: "Cancelled",
};

const formatDate = (value: string) => new Date(value).toLocaleString("en-ZA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function TrackOrderPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [orderRef, setOrderRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setError("Sign in to the account used at checkout, then enter your order reference.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    const { data, error: functionError } = await supabase.functions.invoke("track-order", {
      body: { orderRef: orderRef.trim().toUpperCase() },
    });
    setLoading(false);
    if (functionError || data?.error) {
      setError(data?.error === "Tracking is temporarily unavailable"
        ? "Tracking is temporarily unavailable. Please try again shortly."
        : data?.error === "Sign in required"
          ? "Sign in to the account used at checkout to track this order."
          : "No order with that reference was found in your account.");
      return;
    }
    setResult(data as TrackingResult);
  };

  const copyTracking = async () => {
    const tracking = result?.shipment?.trackingNumber;
    if (!tracking) return;
    await navigator.clipboard.writeText(tracking);
    toast({ title: "Tracking number copied" });
  };

  const currentStatus = result?.shipment?.status ?? (result?.order.paymentStatus === "paid" ? "pending_pick" : result?.order.paymentStatus);
  const Icon = currentStatus === "delivered" ? CheckCircle2 : currentStatus === "ready_for_collection" ? Building2 : result?.shipment?.dispatchedAt ? Truck : Package;

  return (
    <>
      <SEO title="Track Your PostNet Order — Peptide South Africa" description="Track packing and PostNet delivery for your Peptide South Africa order." path="/track-order" />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Package className="h-8 w-8" /></div>
            <h1 className="font-display text-3xl font-bold text-foreground">Track your order</h1>
            <p className="mt-2 text-muted-foreground">See when your parcel is picked, packed, handed to PostNet and delivered or ready to collect.</p>
          </div>

          {!authLoading && !user && (
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center text-sm text-foreground">
              Tracking is private to your customer account. <Link to="/auth?next=/track-order" className="font-semibold text-primary hover:underline">Sign in to continue</Link>.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <label className="text-sm font-medium text-foreground">Order reference
              <input value={orderRef} onChange={(event) => setOrderRef(event.target.value.toUpperCase())} placeholder="PSA-260822-A1B2C3D4" required className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <button type="submit" disabled={loading || authLoading || !user} className="inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-3.5 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {loading ? "Checking…" : "Track order"}
            </button>
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</p>}
          </form>

          {result && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="flex flex-col justify-between gap-4 border-b border-border bg-muted/30 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Current status</p><h2 className="font-display text-xl font-bold text-foreground">{statusLabels[currentStatus] ?? currentStatus}</h2></div></div>
                <p className="font-mono text-sm font-semibold text-primary">{result.order.reference}</p>
              </div>

              <div className="p-5">
                {result.shipment?.trackingNumber && (
                  <div className="flex flex-col justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PostNet tracking number</p><p className="mt-1 font-mono text-lg font-bold text-foreground">{result.shipment.trackingNumber}</p></div>
                    <button onClick={copyTracking} className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-background px-4 py-2 text-sm font-semibold text-primary"><Copy className="h-4 w-4" /> Copy</button>
                  </div>
                )}

                {result.shipment?.service === "postnet_to_postnet" && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-border p-4"><Building2 className="mt-0.5 h-5 w-5 text-primary" /><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collection branch</p><p className="mt-1 font-semibold text-foreground">{result.shipment.branch || "Your selected PostNet branch"}</p></div></div>
                )}

                <div className="mt-6">
                  <h3 className="font-display text-lg font-bold text-foreground">Order journey</h3>
                  <ol className="mt-4 space-y-0">
                    {(result.shipment?.events?.length ? result.shipment.events : [{ status: result.order.paymentStatus === "paid" ? "payment_confirmed" : result.order.paymentStatus, at: result.order.paidAt || result.order.placedAt }]).map((event, index, events) => (
                      <li key={`${event.status}-${event.at}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < events.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-border" />}
                        <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="h-3 w-3" /></span>
                        <div><p className="text-sm font-semibold text-foreground">{statusLabels[event.status] ?? event.status}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" /> {formatDate(event.at)}</p></div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
