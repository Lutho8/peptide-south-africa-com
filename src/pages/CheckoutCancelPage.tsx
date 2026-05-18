import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import SEO from "@/components/SEO";

export default function CheckoutCancelPage() {
  return (
    <>
      <SEO title="Payment Cancelled" description="Your payment was cancelled." path="/checkout/cancel" noindex />
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Payment cancelled</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          No charge was made. Your cart is still saved — try again whenever you're ready.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/cart" className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Back to Cart
          </Link>
          <Link to="/shop" className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground">
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
