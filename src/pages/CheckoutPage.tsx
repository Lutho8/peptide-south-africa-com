import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock, Tag, CreditCard, Loader2, Truck } from "lucide-react";
import CartCountdown from "@/components/CartCountdown";
import SecurityChecklist from "@/components/SecurityChecklist";
import CheckoutTrustBar from "@/components/CheckoutTrustBar";
import DeliveryReturnsAccordion from "@/components/DeliveryReturnsAccordion";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import FreeShippingBar from "@/components/FreeShippingBar";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { COPY, t as tCopy, type CopyKey } from "@/lib/copy";
import {
  SHIPPING_RULES,
  amountToFreeShipping,
  getShippingCost,
} from "@/lib/shipping";
import { validateCheckout, type CheckoutForm, type CheckoutErrors, SA_PROVINCES } from "@/lib/checkoutSchema";
import { formatZAR } from "@/lib/price";

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

/** Build & auto-submit an HTML form to PayFast. */
function postToPayFast(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const { items, subtotal, totalPrice, discountAmount, discountCode, isDiscountEligible, clearCart } = useCart();
  const { user, refreshOrders } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

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

  const errText = (key?: string): string | undefined => {
    if (!key) return undefined;
    if ((COPY as Record<string, unknown>)[key]) return tCopy(key as CopyKey);
    return key;
  };

  // Shipping math (ZAR only).
  const shippingMath = useMemo(() => {
    const rule = SHIPPING_RULES["South Africa"];
    const ship = getShippingCost(totalPrice, "South Africa") ?? 0;
    const grandTotal = totalPrice + ship;
    const remaining = amountToFreeShipping(totalPrice);
    return { rule, ship, grandTotal, freeUnlocked: ship === 0, remaining };
  }, [totalPrice]);

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
    const result = validateCheckout(form);
    if (result.ok === false) {
      setErrors(result.errors);
      toast({ title: "Check your details", description: tCopy("fix_form"), variant: "destructive" });
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLInputElement>("[aria-invalid='true']");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to complete checkout.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setBusy(true);
    try {
      const description = items
        .map((i) => `${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
        .join(", ")
        .slice(0, 500);

      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: Math.round(shippingMath.grandTotal * 100) / 100,
          discount_code: discountCode,
          status: "pending",
          currency: "ZAR",
          order_description: description,
          shipping_country: "South Africa",
          shipping_method: shippingMath.rule.method,
          shipping_cost: Math.round(shippingMath.ship * 100) / 100,
          shipping_currency: "ZAR",
          free_shipping_applied: shippingMath.freeUnlocked,
        })
        .select("id")
        .single();
      if (orderErr || !orderRow) throw orderErr ?? new Error("Failed to create order");

      const origin = window.location.origin;
      const amount = Math.round(shippingMath.grandTotal * 100) / 100;

      const { data, error: fnErr } = await supabase.functions.invoke("payfast-create-payment", {
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
      if (fnErr) throw new Error(fnErr.message);
      if (!data || data.error) throw new Error(data?.error || "Payment could not be started");
      if (!data.actionUrl || !data.fields) throw new Error("Invalid PayFast response");

      await refreshOrders();
      await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      clearCart();
      postToPayFast(data.actionUrl, data.fields);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment could not be started";
      toast({
        title: "Payment unavailable",
        description: msg.includes("not configured") || msg.includes("503")
          ? tCopy("payment_unavailable")
          : msg,
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  const showFreeNudge =
    !shippingMath.freeUnlocked &&
    shippingMath.remaining > 0 &&
    shippingMath.remaining <= shippingMath.rule.freeOver * 0.25;

  return (
    <>
    <SEO title="Checkout" description="Complete your secure peptide order — discreet packaging, shipping across South Africa." path="/checkout" noindex />
    <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
    <div className="container py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
        <CartCountdown variant="compact" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handlePay} className="lg:col-span-2 flex flex-col gap-6">

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Truck className="h-4 w-4 text-primary" /> Shipping
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              🇿🇦 {tCopy("local_courier_sa")}<br />
              <span className="font-semibold text-foreground">
                {shippingMath.freeUnlocked ? "Free" : formatZAR(shippingMath.rule.flat)}{" "}
                <span className="font-normal text-muted-foreground">(Free over R1,500)</span>
              </span>
            </p>
            {showFreeNudge && (
              <p className="mt-2 rounded-md bg-trust/10 px-3 py-2 text-xs font-semibold text-trust">
                Add {formatZAR(shippingMath.remaining)} more to unlock free shipping
              </p>
            )}
          </div>

          <FreeShippingBar subtotalZar={totalPrice} />

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Contact Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <input required placeholder="First Name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                  aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "err-firstName" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive" />
                {errors.firstName && <p id="err-firstName" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.firstName)}</p>}
              </div>
              <div>
                <input required placeholder="Last Name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                  aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "err-lastName" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive" />
                {errors.lastName && <p id="err-lastName" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.lastName)}</p>}
              </div>
              <div className="sm:col-span-2">
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive" />
                {errors.email && <p id="err-email" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.email)}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Shipping Address</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <input required placeholder="Address" value={form.address1} onChange={(e) => setField("address1", e.target.value)}
                  aria-invalid={!!errors.address1} aria-describedby={errors.address1 ? "err-address1" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive" />
                {errors.address1 && <p id="err-address1" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.address1)}</p>}
              </div>
              <div>
                <input required placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)}
                  aria-invalid={!!errors.city} aria-describedby={errors.city ? "err-city" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive" />
                {errors.city && <p id="err-city" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.city)}</p>}
              </div>
              <div>
                <select required value={form.region} onChange={(e) => setField("region", e.target.value)}
                  aria-invalid={!!errors.region} aria-describedby={errors.region ? "err-region" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive">
                  <option value="">Select Province</option>
                  {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.region && <p id="err-region" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.region)}</p>}
              </div>
              <div>
                <input required inputMode="numeric" placeholder="Postal Code (e.g. 8001)" value={form.postalCode}
                  onChange={(e) => setField("postalCode", e.target.value)} aria-invalid={!!errors.postalCode}
                  aria-describedby={errors.postalCode ? "err-postalCode" : undefined}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive" />
                {errors.postalCode && <p id="err-postalCode" role="alert" className="mt-1 text-xs text-destructive">{errText(errors.postalCode)}</p>}
              </div>
              <div className="sm:col-span-2">
                <input readOnly value="South Africa" className="w-full rounded-lg border border-input bg-muted px-4 py-3 text-sm text-muted-foreground" />
              </div>
            </div>
          </div>

          <DeliveryReturnsAccordion defaultOpen="shipping" />

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Tag className="h-4 w-4 text-primary" /> Discount Code
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <input readOnly value={discountCode ?? ""} placeholder={isDiscountEligible ? "" : "Sign in to auto-apply RIDETHETIDE10"}
                className="flex-1 rounded-lg border border-input bg-muted px-4 py-3 text-sm font-mono text-foreground" />
              {isDiscountEligible ? (
                <span className="rounded-md bg-trust/10 px-3 py-2 text-xs font-bold text-trust">−10% APPLIED</span>
              ) : (
                <Link to="/auth" className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Sign in</Link>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Pay securely via credit/debit card, Instant EFT, SnapScan, Zapper, Mobicred or Masterpass.
              All payments processed via{" "}
              <a href="https://www.payfast.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary">PayFast</a>.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {["Visa","Mastercard","Instant EFT","Capitec Pay","SnapScan","Zapper","Mobicred","Masterpass"].map((m) => (
                <li key={m} className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              You'll be redirected to PayFast's secure checkout. Charged in <span className="font-semibold text-foreground">ZAR</span>.
            </p>
          </div>

          <CheckoutTrustBar />

          <button type="submit" disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="pay-now-button">
            {busy ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {tCopy("processing_payment")}</>
            ) : (
              <>{tCopy("pay_now")} — {formatZAR(shippingMath.grandTotal)}</>
            )}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {tCopy("secure_checkout")}</span>
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
                  <span className="text-sm font-semibold text-foreground">{formatZAR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>{tCopy("subtotal")}</span><span>{formatZAR(subtotal)}</span></div>
              {isDiscountEligible && (
                <div className="mt-1 flex justify-between text-sm font-semibold text-trust"><span>{discountCode} (−10%)</span><span>−{formatZAR(discountAmount)}</span></div>
              )}
              <div className="mt-1 flex justify-between text-sm" data-testid="checkout-shipping">
                <span className="text-muted-foreground">
                  {tCopy("shipping")}
                  <span className="ml-1 text-[11px] text-muted-foreground/80">({shippingMath.rule.method} · {shippingMath.rule.days}d)</span>
                </span>
                {shippingMath.freeUnlocked ? (
                  <span className="font-semibold text-trust">{tCopy("free")}</span>
                ) : (
                  <span className="font-semibold text-foreground">{formatZAR(shippingMath.ship)}</span>
                )}
              </div>
              <div className="mt-2 flex justify-between font-display text-lg font-bold text-foreground">
                <span>{tCopy("total")}</span>
                <span data-testid="checkout-total">{formatZAR(shippingMath.grandTotal)}</span>
              </div>
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
