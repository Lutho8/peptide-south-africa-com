import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/context/CurrencyContext";
import { Shield, Lock, Tag, CreditCard, Bitcoin, Loader2, AlertTriangle, Truck } from "lucide-react";
import CartCountdown from "@/components/CartCountdown";
import SecurityChecklist from "@/components/SecurityChecklist";
import CheckoutTrustBar from "@/components/CheckoutTrustBar";
import DeliveryReturnsAccordion from "@/components/DeliveryReturnsAccordion";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import FreeShippingBar from "@/components/FreeShippingBar";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { COPY, trilingual, t as tCopy, type CopyKey } from "@/lib/copy";
import {
  SHIPPING_RULES,
  SUPPORTED_COUNTRIES,
  amountToFreeShipping,
  getShippingCost,
  isSupportedCountry,
  type ShippingCountry,
} from "@/lib/shipping";
import { validateCheckout, type CheckoutForm, type CheckoutErrors } from "@/lib/checkoutSchema";
import { formatEUR, formatZAR } from "@/lib/price";

const FORM_KEY = "rtt_checkout_form";
const emptyForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  address1: "",
  city: "",
  region: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const { items, subtotal, totalPrice, discountAmount, discountCode, isDiscountEligible, clearCart } = useCart();
  const { user, refreshOrders } = useAuth();
  const { format, currency, convert, rate } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Persist shipping country across reloads / cancelled payments. Manual
  // selection always wins over the currency-derived default.
  const SHIP_KEY = "rtt_ship_country";
  const [country, setCountryState] = useState<ShippingCountry | string>(() => {
    if (typeof window === "undefined") return currency === "ZAR" ? "South Africa" : "Germany";
    const stored = window.localStorage.getItem(SHIP_KEY);
    if (stored === "South Africa" || stored === "Germany") return stored;
    // If a non-supported value was somehow stored, keep it so the blocked
    // banner renders and the user can see the explanation.
    if (stored && stored.length > 0) return stored;
    return currency === "ZAR" ? "South Africa" : "Germany";
  });
  const setCountry = (c: ShippingCountry) => {
    setCountryState(c);
    if (typeof window !== "undefined") window.localStorage.setItem(SHIP_KEY, c);
  };

  // --- Shipping math --------------------------------------------------------
  // Cart subtotal (after discount) is stored in EUR. Convert into destination
  // currency to evaluate flat / free-over thresholds. Shipping is always charged
  // in the destination currency.
  const shippingMath = useMemo(() => {
    const supported = isSupportedCountry(country);
    if (!supported) {
      return { supported: false as const, rule: null, shipDest: 0, destSubtotal: 0, grandTotalDest: 0, freeUnlocked: false, remainingDest: 0 };
    }
    const rule = SHIPPING_RULES[country];
    const destSubtotal = rule.currency === "EUR" ? totalPrice : totalPrice * rate;
    const shipDest = getShippingCost(destSubtotal, country) ?? 0;
    const grandTotalDest = destSubtotal + shipDest;
    const remainingDest = amountToFreeShipping(destSubtotal, country);
    return { supported: true as const, rule, shipDest, destSubtotal, grandTotalDest, freeUnlocked: shipDest === 0, remainingDest };
  }, [country, totalPrice, rate]);

  const formatDest = (amountDest: number) =>
    country === "South Africa" ? formatZAR(amountDest) : formatEUR(amountDest);

  // Convert a destination-currency amount back to EUR so the user's display-currency
  // toggle still works (e.g. SA delivery costs are charged in ZAR but a customer
  // browsing in EUR sees a ≈ €X reference).
  const displayFromDest = (amountDest: number): string => {
    const eurEquivalent =
      shippingMath.supported && shippingMath.rule!.currency === "EUR"
        ? amountDest
        : amountDest / rate;
    return format(eurEquivalent);
  };

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">Browse Products</Link>
      </div>
    );
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingMath.supported) {
      toast({ title: "Shipping unavailable", description: trilingual("country_blocked"), variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to complete checkout.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setBusy(true);
    try {
      const rule = shippingMath.rule!;
      const description = items
        .map((i) => `${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
        .join(", ")
        .slice(0, 500);

      // Persist order in destination currency totals.
      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: Math.round(shippingMath.grandTotalDest * 100) / 100,
          discount_code: discountCode,
          status: "pending",
          currency: rule.currency,
          order_description: description,
          shipping_country: country,
          shipping_method: rule.method,
          shipping_cost: Math.round(shippingMath.shipDest * 100) / 100,
          shipping_currency: rule.currency,
          free_shipping_applied: shippingMath.freeUnlocked,
        })
        .select("id")
        .single();
      if (orderErr || !orderRow) throw orderErr ?? new Error("Failed to create order");

      const amount = Math.round(shippingMath.grandTotalDest * 100) / 100;
      const origin = window.location.origin;

      const { data, error: fnErr } = await supabase.functions.invoke("nowpayments-create-payment", {
        body: {
          orderId: orderRow.id,
          amount,
          currency: rule.currency.toLowerCase(),
          description,
          successUrl: `${origin}/checkout/success?order_id=${orderRow.id}`,
          cancelUrl: `${origin}/checkout/cancel?order_id=${orderRow.id}`,
        },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.payment_url) throw new Error("No payment URL returned");

      await refreshOrders();
      await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      clearCart();
      window.location.href = data.payment_url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment could not be started";
      toast({
        title: "Payment unavailable",
        description: msg.includes("not configured") || msg.includes("503")
          ? trilingual("payment_unavailable", " — ")
          : msg,
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  const showFreeNudge =
    shippingMath.supported &&
    !shippingMath.freeUnlocked &&
    shippingMath.remainingDest > 0 &&
    shippingMath.remainingDest <= shippingMath.rule!.freeOver * 0.25;

  return (
    <>
    <SEO title="Checkout" description="Complete your secure peptide order — discreet packaging, SA & EU shipping." path="/checkout" noindex />
    <div className="container py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
        <CartCountdown variant="compact" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handlePay} className="lg:col-span-2 flex flex-col gap-6">
          {/* Shipping Country Selector */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Truck className="h-4 w-4 text-primary" /> {COPY.shipping_country.en} · {COPY.shipping_country.de}
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SUPPORTED_COUNTRIES.map((c) => {
                const active = country === c;
                const flag = c === "South Africa" ? "🇿🇦" : "🇩🇪";
                const label = c === "South Africa" ? "South Africa" : "Germany · Deutschland";
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCountry(c)}
                    data-testid={`country-${c === "South Africa" ? "sa" : "de"}`}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                      active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="mr-2">{flag}</span>{label}
                  </button>
                );
              })}
            </div>
            {shippingMath.supported && (
              <p className="mt-3 text-sm text-muted-foreground">
                {country === "South Africa" ? trilingual("local_courier_sa") : trilingual("standard_shipping_de")}
                <br />
                <span className="font-semibold text-foreground">
                  {shippingMath.freeUnlocked
                    ? `${COPY.free.en} · ${COPY.free.de}`
                    : `${formatDest(shippingMath.rule!.flat)} `}
                  {!shippingMath.freeUnlocked && (
                    <span className="font-normal text-muted-foreground">
                      ({country === "South Africa" ? "Free over R1,500" : "Free over €120"})
                    </span>
                  )}
                </span>
              </p>
            )}
            {showFreeNudge && (
              <p className="mt-2 rounded-md bg-trust/10 px-3 py-2 text-xs font-semibold text-trust">
                Add {formatDest(shippingMath.remainingDest)} more to unlock free shipping · Noch {formatDest(shippingMath.remainingDest)} bis zum kostenlosen Versand
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Contact Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="First Name" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Last Name" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required type="email" defaultValue={user?.email ?? ""} placeholder="Email" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:col-span-2" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Shipping Address</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Address" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:col-span-2" />
              <input required placeholder="City" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder={country === "Germany" ? "Bundesland" : "Province"} className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Postal Code" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input readOnly value={country} className="rounded-lg border border-input bg-muted px-4 py-3 text-sm text-muted-foreground" />
            </div>
          </div>

          <DeliveryReturnsAccordion defaultOpen="shipping" />

          {/* Discount field */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Tag className="h-4 w-4 text-primary" /> Discount Code
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={discountCode ?? ""}
                placeholder={isDiscountEligible ? "" : "Sign in to auto-apply RIDETHETIDE10"}
                className="flex-1 rounded-lg border border-input bg-muted px-4 py-3 text-sm font-mono text-foreground"
              />
              {isDiscountEligible ? (
                <span className="rounded-md bg-trust/10 px-3 py-2 text-xs font-bold text-trust">−10% APPLIED</span>
              ) : (
                <Link to="/auth" className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Sign in</Link>
              )}
            </div>
          </div>

          {/* Payment — NowPayments */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Pay securely via PayPal, credit/debit card, Apple Pay, Google Pay, SEPA bank transfer, or cryptocurrency.
              All payments processed via{" "}
              <a href="https://nowpayments.io" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary">NowPayments</a>.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {["PayPal","Visa","Mastercard","Apple Pay","Google Pay","SEPA","Revolut"].map((m) => (
                <li key={m} className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m}</li>
              ))}
              <li className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Bitcoin className="h-3 w-3" /> Crypto
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              You'll be redirected to NowPayments' secure checkout. Charged in:{" "}
              <span className="font-semibold text-foreground">{shippingMath.supported ? shippingMath.rule!.currency : "—"}</span>.
            </p>
          </div>

          <CheckoutTrustBar />

          {!shippingMath.supported && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive" role="alert">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                <div>
                  <p className="font-semibold">⚠️ {trilingual("country_blocked")}</p>
                  <p className="mt-1">{trilingual("contact_support_region")}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !shippingMath.supported}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="pay-now-button"
          >
            {busy ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {COPY.processing_payment.en} · {COPY.processing_payment.de}</>
            ) : (
              <>{COPY.pay_now.en} · {COPY.pay_now.de} — {shippingMath.supported ? formatDest(shippingMath.grandTotalDest) : "—"}</>
            )}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {trilingual("secure_checkout")}</span>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-6 h-fit">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.lineId} className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.product.name}
                      {item.variantLabel && <span className="ml-1 text-muted-foreground">· {item.variantLabel}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{format(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>{COPY.subtotal.en} / {COPY.subtotal.de}</span><span>{format(subtotal)}</span></div>
              {isDiscountEligible && (
                <div className="mt-1 flex justify-between text-sm font-semibold text-trust"><span>{discountCode} (−10%)</span><span>−{format(discountAmount)}</span></div>
              )}
              {shippingMath.supported ? (
                <div className="mt-1 flex justify-between text-sm" data-testid="checkout-shipping">
                  <span className="text-muted-foreground">
                    {COPY.shipping.en} / {COPY.shipping.de}
                    <span className="ml-1 text-[11px] text-muted-foreground/80">({shippingMath.rule!.method} · {shippingMath.rule!.days}d)</span>
                  </span>
                  {shippingMath.freeUnlocked ? (
                    <span className="font-semibold text-trust">{COPY.free.en} · {COPY.free.de}</span>
                  ) : (
                    <span className="font-semibold text-foreground">
                      {displayFromDest(shippingMath.shipDest)}
                      {currency !== shippingMath.rule!.currency && (
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">({formatDest(shippingMath.shipDest)})</span>
                      )}
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-1 text-sm text-destructive">{trilingual("country_blocked")}</div>
              )}
              <div className="mt-2 flex justify-between font-display text-lg font-bold text-foreground">
                <span>{COPY.total.en} / {COPY.total.de}</span>
                <span data-testid="checkout-total">
                  {shippingMath.supported ? displayFromDest(shippingMath.grandTotalDest) : format(totalPrice)}
                </span>
              </div>
              {shippingMath.supported && currency !== shippingMath.rule!.currency && (
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  Charged: <span className="font-semibold">{formatDest(shippingMath.grandTotalDest)}</span>
                </p>
              )}
            </div>
          </div>

          <SecurityChecklist />
        </div>
      </div>
      <div className="mt-10">
        <PaymentMethodsBanner />
      </div>
    </div>
    </>
  );
}
