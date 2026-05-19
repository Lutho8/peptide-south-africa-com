import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { COPY } from "@/lib/copy";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";

export default function CheckoutCancelPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { market, lang } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  return (
    <>
      <SEO
        title="Payment Cancelled"
        description="Your payment was cancelled."
        path={mp("/checkout/cancel")}
        lang={lang}
        alternates={buildAlternates("/checkout/cancel")}
        noindex
      />
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground" data-testid="cancel-headline">
          {COPY.cancelled.en}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {COPY.cancelled.de} · {COPY.cancelled.af}
        </p>
        <p className="mt-3 max-w-md text-muted-foreground">
          No charge was made. Your cart is still saved — try again whenever you're ready.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to={mp("/cart")} className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
            {COPY.back_to_cart.en} · {COPY.back_to_cart.de}
          </Link>
          <Link to={mp("/shop")} className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground">
            {COPY.continue_shopping.en} · {COPY.continue_shopping.de}
          </Link>
          {orderId && (
            <Link to={`/order/${orderId}`} className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground">
              {COPY.view_order.en} · {COPY.view_order.de}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
