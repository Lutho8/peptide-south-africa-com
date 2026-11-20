import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SEO from "@/components/SEO";
import { formatZAR } from "@/lib/price";

type Result = { status: string; total: number; currency: string };

const paymentLabels: Record<string, string> = {
  pending: "Awaiting EFT payment",
  paid: "Payment confirmed",
  cancelled: "Order cancelled",
  failed: "Payment could not be confirmed",
};

export default function TrackOrderPage() {
  const { hash } = useLocation();
  const token = hash.slice(1);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    setResult(null);
    setMessage(token ? "Checking your order…" : "Open the secure link in your EFT instructions email to check your payment status.");
    if (!token) return;

    const controller = new AbortController();
    fetch("/api/guest-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setMessage(response.status === 404
            ? "This tracking link is invalid or expired. Contact support for help locating your order."
            : "Order status is temporarily unavailable. Try checking again.");
          return;
        }
        const data: Result = await response.json();
        if (controller.signal.aborted) return;
        setResult(data);
        setMessage("");
      })
      .catch(() => {
        if (!controller.signal.aborted) setMessage("Order status is temporarily unavailable. Try checking again.");
      });
    return () => controller.abort();
  }, [token, refreshCount]);

  return (
    <>
      <SEO title="Track your order" description="Check your payment status" path="/track-order" noindex />
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-7">
          <h1 className="font-display text-3xl font-bold">Track your order</h1>
          <div className="mt-5 text-sm" role="status">
            {message && <p className="text-muted-foreground">{message}</p>}
            {result && (
              <div className="space-y-3">
                <p>Payment status <strong>{paymentLabels[result.status] ?? "Contact support for an update"}</strong></p>
                <p>Total <strong>{formatZAR(Number(result.total))}</strong></p>
                {result.status === "pending" && <p className="text-muted-foreground">If you have already transferred the funds, allow time for your bank to clear the transfer. We update this status after verifying the deposit.</p>}
                {result.status === "paid" && <p className="text-muted-foreground">Look for the separate shipping email with your courier tracking link once your parcel is dispatched.</p>}
              </div>
            )}
          </div>
          {token && (
            <button type="button" className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => setRefreshCount((count) => count + 1)}>
              Check again
            </button>
          )}
          <p className="mt-6 text-sm">
            <a className="text-primary underline" href="mailto:support@peptide-south-africa.com">Contact support</a>
            {" · "}
            <Link className="text-primary underline" to="/shop">Continue shopping</Link>
          </p>
        </div>
      </div>
    </>
  );
}
