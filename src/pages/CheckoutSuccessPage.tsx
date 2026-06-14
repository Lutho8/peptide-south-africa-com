import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { market, lang } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  if (orderId) {
    return <Navigate to={`/order/${orderId}`} replace />;
  }

  return (
    <>
      <SEO
        title="You're In — Activate Your Program"
        description="Your program is being activated."
        path={mp("/checkout/success")}
        lang={lang}
        alternates={buildAlternates("/checkout/success")}
        noindex
      />
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h1 className="mt-4 font-display text-4xl text-foreground">You're in.</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Your program is being activated. Where clinically required, a licensed physician will review your eligibility before treatment activation — usually within one business day.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to={mp("/account")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground hover:opacity-90">
            Complete clinical verification <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={mp("/shop")} className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 font-semibold text-foreground hover:bg-muted">
            Browse programs
          </Link>
        </div>
      </div>
    </>
  );
}
