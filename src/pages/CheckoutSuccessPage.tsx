import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | null;

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const [status, setStatus] = useState<OrderStatus>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    const fetchOnce = async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();
      if (!cancelled) setStatus((data?.status as OrderStatus) ?? "pending");
    };
    fetchOnce();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <>
      <SEO title="Order Confirmed" description="Thank you for your order." path="/checkout/success" noindex />
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trust/10">
          {status === "paid" ? <CheckCircle className="h-10 w-10 text-trust" /> : <Loader2 className="h-10 w-10 animate-spin text-trust" />}
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
          {status === "paid" ? "Payment Confirmed!" : "Thank you — payment received"}
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          {status === "paid"
            ? "Your order is being prepared. We'll email you tracking details as soon as it ships."
            : "We're waiting on final confirmation from our payment partner. You'll get an email as soon as it clears — this usually takes a few minutes."}
        </p>
        {orderId && (
          <p className="mt-2 text-sm font-mono text-foreground">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <Link to="/shop" className="mt-6 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
          Continue Shopping
        </Link>
      </div>
    </>
  );
}
