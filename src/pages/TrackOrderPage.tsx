import { useState } from "react";
import { Package, Search } from "lucide-react";
import SEO from "@/components/SEO";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <SEO title="Track Your Order — Ride The Tide South Africa" description="Track your peptide order shipped from within South Africa. Same-day dispatch on orders before 14:00 SAST." path="/track-order" />
      <div className="container py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Package className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your order details below to check the status of your shipment.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-foreground">Order ID</label>
            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. RTT-20260321-001"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="The email used for your order"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            <Search className="h-4 w-4" /> Track Order
          </button>
        </form>

        {submitted && (
          <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No order found with those details. Please double-check your Order ID and email address, or contact us at{" "}
              <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a>.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
