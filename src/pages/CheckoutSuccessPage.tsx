import { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { COPY } from "@/lib/copy";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  // When we know the order id, route the user to the canonical receipt page.
  if (orderId) {
    return <Navigate to={`/order/${orderId}`} replace />;
  }

  return (
    <>
      <SEO title="Order Received" description="Thank you for your order." path="/checkout/success" noindex />
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trust/10">
          <CheckCircle className="h-10 w-10 text-trust" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
          {COPY.thank_you.en}
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          {COPY.thank_you.de} · {COPY.thank_you.af}
        </p>
        <Link to="/shop" className="mt-6 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
          {COPY.continue_shopping.en} · {COPY.continue_shopping.de}
        </Link>
      </div>
    </>
  );
}
