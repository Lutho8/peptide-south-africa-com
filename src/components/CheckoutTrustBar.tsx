import { Lock, Truck, Clock, RefreshCcw, CreditCard } from "lucide-react";

export default function CheckoutTrustBar() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-border pb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Lock className="h-3.5 w-3.5 text-trust" /> 256-bit SSL
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <CreditCard className="h-3.5 w-3.5 text-primary" /> PCI-DSS Compliant
        </span>
        <div className="flex items-center gap-1.5">
          {["VISA", "MC", "AMEX", "DISC"].map((brand) => (
            <span
              key={brand}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-bold tracking-wider text-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
          <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-trust" />
          <div>
            <p className="text-xs font-bold text-foreground">Free Shipping</p>
            <p className="text-[11px] leading-tight text-muted-foreground">On orders over R1,000</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <div>
            <p className="text-xs font-bold text-foreground">Same-Day Dispatch</p>
            <p className="text-[11px] leading-tight text-muted-foreground">Orders before 14:00 SAST</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
          <RefreshCcw className="mt-0.5 h-4 w-4 flex-shrink-0 text-trust" />
          <div>
            <p className="text-xs font-bold text-foreground">30-Day Guarantee</p>
            <p className="text-[11px] leading-tight text-muted-foreground">No-questions refund</p>
          </div>
        </div>
      </div>
    </div>
  );
}
