import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Loader2, Landmark, CreditCard } from "lucide-react";
import CheckoutSuppliesRail from "@/components/CheckoutSuppliesRail";
import ExpressCheckoutButton from "@/components/ExpressCheckoutButton";
import MobileOrderSummaryBar from "@/components/MobileOrderSummaryBar";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { amountToFreeShipping } from "@/lib/shipping";
import { cartBundleSavings } from "@/lib/bundlePricing";
import { validateCheckout, type CheckoutForm, type CheckoutErrors, SA_PROVINCES } from "@/lib/checkoutSchema";
import { formatZAR } from "@/lib/price";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";
import {
  CHECKOUT_FORM_KEY as FORM_KEY,
  checkoutTotals,
  emptyCheckoutForm as emptyForm,
  paymentErrorMessage,
  postToPayFast,
  startPayfastCheckout,
} from "@/lib/startPayfastCheckout";

export const EFT_SESSION_KEY = "rtt_eft_instructions";

export type EftInstructionsState = {
  orderId: string;
  amount: number;
  paymentReference: string;
  bank: {
    account_name: string;
    bank: string;
    account_number: string;
    branch_code: string;
    reference: string;
  };
};

type PaymentMethod = "eft" | "payfast";

const errCopy: Record<string, string> = {
  err_name_chars: "Please enter a valid name",
  err_email: "Enter a valid email",
  err_address_short: "Enter your street address",
  err_required: "Required",
  err_postal_sa: "Enter a 4-digit postal code",
  err_region_sa: "Select a province",
};

const inputCls =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";


export default function CheckoutPage() {
  const { items, subtotal, totalPrice, clearCart } = useCart();
  const bundleSavings = cartBundleSavings(items);
  const specialOffer = Math.round(bundleSavings * 100) / 100;
  const { user, refreshOrders } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("eft");

  const [form, setForm] = useState<CheckoutForm>(() => {
    if (typeof window === "undefined") return emptyForm;
    try {
      const raw = window.sessionStorage.getItem(FORM_KEY);
      if (!raw) return { ...emptyForm, email: user?.email ?? "" };
      const parsed = JSON.parse(raw) as Partial<CheckoutForm>;
      return { ...emptyForm, ...parsed, email: parsed.email || user?.email || "" };
    } catch {
      return emptyForm;
    }
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const setField = <K extends keyof CheckoutForm>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const errText = (key?: string) => (key ? errCopy[key] ?? key : undefined);

  const shippingMath = useMemo(
    () => ({ ...checkoutTotals(totalPrice), remaining: amountToFreeShipping(totalPrice) }),
    [totalPrice],
  );

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">Browse Products</Link>
      </div>
    );
  }

  /**
   * Pay by EFT (Capitec Business): create the order row (same shape as the
   * PayFast helper), ask eft-create-order for a unique payment reference and
   * the bank details, then route to the instructions page. Falls back to the
   * PayFast card flow when EFT isn't configured server-side yet.
   */
  const startEftCheckout = async () => {
    if (!user) return;
    const totals = checkoutTotals(totalPrice);
    const description = items
      .map((i) => `${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
      .join(", ")
      .slice(0, 500);

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: totals.grandTotal,
        discount_code: null,
        status: "pending",
        currency: "ZAR",
        order_description: description,
        shipping_country: "South Africa",
        shipping_method: totals.rule.method,
        shipping_cost: Math.round(totals.ship * 100) / 100,
        shipping_currency: "ZAR",
        free_shipping_applied: totals.freeUnlocked,
      })
      .select("id")
      .single();
    if (orderErr || !orderRow) throw orderErr ?? new Error("Failed to create order");

    const amount = totals.grandTotal;
    const { data, error: fnErr } = await supabase.functions.invoke("eft-create-order", {
      body: {
        orderId: orderRow.id,
        amount,
        itemName: description.slice(0, 100) || "Peptide South Africa order",
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      },
    });

    const status = (fnErr as { context?: Response } | null)?.context?.status;
    const eftUnavailable =
      status === 503 ||
      (typeof data?.error === "string" && data.error.toLowerCase().includes("not configured"));
    if (eftUnavailable) {
      // EFT env vars not set server-side yet — fall back to PayFast with a notice.
      toast({
        title: "EFT unavailable right now",
        description: "We've switched you to secure card payment via PayFast instead.",
      });
      // The order row already exists, so reuse the hosted-payment function
      // directly instead of creating a second order.
      const origin = window.location.origin;
      const { data: pfData, error: pfErr } = await supabase.functions.invoke("payfast-create-payment", {
        body: {
          orderId: orderRow.id,
          amount,
          itemName: description.slice(0, 100) || "Peptide South Africa order",
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          returnUrl: `${origin}/checkout/success?order_id=${orderRow.id}`,
          cancelUrl: `${origin}/checkout/cancel?order_id=${orderRow.id}`,
        },
      });
      if (pfErr) throw new Error(pfErr.message);
      if (!pfData || pfData.error) throw new Error(pfData?.error || "Payment could not be started");
      if (!pfData.actionUrl || !pfData.fields) throw new Error("Invalid PayFast response");
      await refreshOrders();
      await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      clearCart();
      postToPayFast(pfData.actionUrl, pfData.fields);
      return;
    }
    if (fnErr) throw new Error(fnErr.message);
    if (!data || data.error) throw new Error(data?.error || "EFT order could not be started");
    if (!data.payment_reference || !data.bank) throw new Error("Invalid EFT response");

    const state: EftInstructionsState = {
      orderId: orderRow.id,
      amount,
      paymentReference: data.payment_reference,
      bank: data.bank,
    };
    try {
      window.sessionStorage.setItem(EFT_SESSION_KEY, JSON.stringify(state));
    } catch { /* storage unavailable — router state still works */ }

    await refreshOrders();
    await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
    clearCart();
    navigate("/checkout/eft-instructions", { state });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCheckout(form);
    if (result.ok === false) {
      setErrors(result.errors);
      toast({ title: "Almost there", description: "Check the highlighted fields.", variant: "destructive" });
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLInputElement>("[aria-invalid='true']");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (!user) {
      toast({ title: "Sign in to finish", description: "One quick step before payment.", variant: "destructive" });
      navigate("/auth?next=/checkout");
      return;
    }
    setBusy(true);
    try {
      if (method === "eft") {
        await startEftCheckout();
        return;
      }
      await startPayfastCheckout({
        userId: user.id,
        items,
        totalPrice,
        form,
        onBeforeRedirect: async () => {
          await refreshOrders();
          await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
          clearCart();
        },
      });
    } catch (err) {
      toast({
        title: "Payment unavailable",
        description: paymentErrorMessage(err),
        variant: "destructive",
      });
      setBusy(false);
    }
  };


  return (
    <>
      <SEO title="Checkout" description="Complete your secure peptide order — discreet packaging, shipping across South Africa." path="/checkout" noindex />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      {/* Sticky mobile order summary */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md lg:hidden">
        <MobileOrderSummaryBar
          subtotal={subtotal}
          specialOffer={specialOffer}
          shipping={shippingMath.ship}
          freeShipping={shippingMath.freeUnlocked}
          total={shippingMath.grandTotal}
        />
      </div>

      <div className="container max-w-5xl py-8 pb-32 md:py-12 lg:pb-12">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Almost there</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Two quick steps and your order ships from Cape Town.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-6">
            <div>
              <ExpressCheckoutButton />
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or enter details manually</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </div>

            <form id="checkout-form" onSubmit={handlePay} className="flex flex-col gap-6">
              <section className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-display text-base font-semibold text-foreground">
                  1. Where should we send your confirmation?
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <input required type="email" autoComplete="email" aria-label="Email address" placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                      aria-invalid={!!errors.email} className={inputCls} />
                    {errors.email && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.email)}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input required autoComplete="given-name" aria-label="First name" placeholder="First name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                        aria-invalid={!!errors.firstName} className={inputCls} />
                      {errors.firstName && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.firstName)}</p>}
                    </div>
                    <div>
                      <input required autoComplete="family-name" aria-label="Last name" placeholder="Last name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                        aria-invalid={!!errors.lastName} className={inputCls} />
                      {errors.lastName && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.lastName)}</p>}
                    </div>
                  </div>
                </div>

                <h2 className="mt-8 font-display text-base font-semibold text-foreground">
                  2. Where should we deliver?
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <input required autoComplete="street-address" aria-label="Street address" placeholder="Street address" value={form.address1} onChange={(e) => setField("address1", e.target.value)}
                      aria-invalid={!!errors.address1} className={inputCls} />
                    {errors.address1 && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.address1)}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input required autoComplete="address-level2" aria-label="City" placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)}
                        aria-invalid={!!errors.city} className={inputCls} />
                      {errors.city && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.city)}</p>}
                    </div>
                    <div>
                      <select required aria-label="Province" value={form.region} onChange={(e) => setField("region", e.target.value)}
                        aria-invalid={!!errors.region} className={inputCls}>
                        <option value="">Province</option>
                        {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.region && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.region)}</p>}
                    </div>
                  </div>
                  <div>
                    <input required inputMode="numeric" autoComplete="postal-code" aria-label="Postal code" placeholder="Postal code" value={form.postalCode}
                      onChange={(e) => setField("postalCode", e.target.value)} aria-invalid={!!errors.postalCode} className={inputCls} />
                    {errors.postalCode && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.postalCode)}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">Delivered across South Africa in 1–3 business days.</p>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                  <CreditCard className="h-4 w-4 text-primary" /> 3. How would you like to pay?
                </h2>
                <div className="mt-4 flex flex-col gap-3" role="radiogroup" aria-label="Payment method">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                      method === "eft"
                        ? "border-primary bg-primary/5 ring-2 ring-ring"
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value="eft"
                      checked={method === "eft"}
                      onChange={() => setMethod("eft")}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Landmark className="h-4 w-4 text-primary" />
                        Pay by EFT (Capitec) — no card fees
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        Pay directly from your banking app. We'll show you our Capitec Business account
                        details and a unique reference right after you place your order.
                      </span>
                      <span className="mt-2 inline-block rounded-md bg-trust/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-trust">
                        Recommended
                      </span>
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                      method === "payfast"
                        ? "border-primary bg-primary/5 ring-2 ring-ring"
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value="payfast"
                      checked={method === "payfast"}
                      onChange={() => setMethod("payfast")}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Pay by card / PayFast
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        Credit/debit card, Instant EFT, SnapScan, Zapper, Mobicred or Masterpass via{" "}
                        <a href="https://www.payfast.co.za" target="_blank" rel="noopener noreferrer"
                          className="font-semibold text-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}>PayFast</a>.
                        You'll be redirected to PayFast's secure checkout.
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {["Visa","Mastercard","Instant EFT","Capitec Pay","SnapScan","Zapper"].map((m) => (
                          <span key={m} className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m}</span>
                        ))}
                      </span>
                    </span>
                  </label>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Charged in <span className="font-semibold text-foreground">ZAR</span>. Your order is reserved while payment is arranged.
                </p>
              </section>

              <button type="submit" disabled={busy}
                className="hidden lg:inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="pay-now-button">
                {busy
                  ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>)
                  : method === "eft"
                    ? (<><Landmark className="h-4 w-4" /> Place order — get EFT details · {formatZAR(shippingMath.grandTotal)}</>)
                    : (<>Place order · {formatZAR(shippingMath.grandTotal)}</>)}
              </button>
              <p className="hidden lg:flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Secure payment · EFT or PayFast · ZAR
              </p>
            </form>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold text-foreground">Your order</h2>
              <div className="mt-4 flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.lineId} className="flex items-center gap-3">
                    <span className={`${vialTileFrameClasses} block h-12 w-12 shrink-0`} data-testid={VIAL_TEST_ID}>
                      <span aria-hidden className={vialAccentBarSmClasses} />
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantLabel && <>{item.variantLabel} · </>}Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatZAR(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                {specialOffer > 0 && (
                  <div className="flex justify-between font-semibold text-destructive">
                    <span>Special Offer</span><span>−{formatZAR(specialOffer)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span className="text-foreground">{formatZAR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground" data-testid="checkout-shipping">
                  <span>Shipping</span>
                  {shippingMath.freeUnlocked
                    ? <span className="font-semibold text-trust">Free</span>
                    : <span className="text-foreground">{formatZAR(shippingMath.ship)}</span>}
                </div>
                <div className="flex justify-between pt-2 font-display text-base font-bold text-foreground">
                  <span>Total</span><span data-testid="checkout-total">{formatZAR(shippingMath.grandTotal)}</span>
                </div>
              </div>
            </div>

            <CheckoutSuppliesRail />
          </aside>
        </div>

        {/* Mobile sticky pay bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <button type="submit" form="checkout-form" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient py-3.5 font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
            {busy
              ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>)
              : method === "eft"
                ? (<>Place order — get EFT details · {formatZAR(shippingMath.grandTotal)}</>)
                : (<>Place order · {formatZAR(shippingMath.grandTotal)}</>)}
          </button>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Secure payment · EFT or PayFast · ZAR
          </p>
        </div>
      </div>

    </>
  );
}
