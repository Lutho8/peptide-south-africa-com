import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Loader2 } from "lucide-react";
import CheckoutSuppliesRail from "@/components/CheckoutSuppliesRail";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import {
  SHIPPING_RULES,
  amountToFreeShipping,
  getShippingCost,
} from "@/lib/shipping";
import { cartBundleSavings } from "@/lib/bundlePricing";
import { validateCheckout, type CheckoutForm, type CheckoutErrors, SA_PROVINCES } from "@/lib/checkoutSchema";
import { formatZAR } from "@/lib/price";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";

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

const errCopy: Record<string, string> = {
  err_name_chars: "Please enter a valid name",
  err_email: "Enter a valid email",
  err_address_short: "Enter your street address",
  err_required: "Required",
  err_postal_sa: "Enter a 4-digit postal code",
  err_region_sa: "Select a province",
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

const inputCls =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";

export default function CheckoutPage() {
  const { items, subtotal, totalPrice, discountAmount, clearCart } = useCart();
  const bundleSavings = cartBundleSavings(items);
  const specialOffer = Math.round((bundleSavings + discountAmount) * 100) / 100;
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

  const errText = (key?: string) => (key ? errCopy[key] ?? key : undefined);

  const shippingMath = useMemo(() => {
    const rule = SHIPPING_RULES["South Africa"];
    const ship = getShippingCost(totalPrice, "South Africa") ?? 0;
    return { rule, ship, grandTotal: totalPrice + ship, freeUnlocked: ship === 0, remaining: amountToFreeShipping(totalPrice) };
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
      toast({ title: "Check your details", description: "Please fix the highlighted fields.", variant: "destructive" });
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
          discount_code: null,
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
          ? "Payment is temporarily unavailable. Please try again shortly."
          : msg,
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" description="Complete your secure peptide order — discreet packaging, shipping across South Africa." path="/checkout" noindex />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <div className="container max-w-5xl py-8 pb-28 md:py-12 lg:pb-12">
        <h1 className="mb-8 text-center font-display text-3xl font-bold text-foreground">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <form id="checkout-form" onSubmit={handlePay} className="flex flex-col gap-6">
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold text-foreground">Contact</h2>
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                    aria-invalid={!!errors.email} className={inputCls} />
                  {errors.email && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.email)}</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input required placeholder="First name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                      aria-invalid={!!errors.firstName} className={inputCls} />
                    {errors.firstName && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.firstName)}</p>}
                  </div>
                  <div>
                    <input required placeholder="Last name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                      aria-invalid={!!errors.lastName} className={inputCls} />
                    {errors.lastName && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.lastName)}</p>}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold text-foreground">Shipping address</h2>
              <p className="mt-1 text-xs text-muted-foreground">Delivered in South Africa · 1–3 business days</p>
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <input required placeholder="Address" value={form.address1} onChange={(e) => setField("address1", e.target.value)}
                    aria-invalid={!!errors.address1} className={inputCls} />
                  {errors.address1 && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.address1)}</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input required placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)}
                      aria-invalid={!!errors.city} className={inputCls} />
                    {errors.city && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.city)}</p>}
                  </div>
                  <div>
                    <select required value={form.region} onChange={(e) => setField("region", e.target.value)}
                      aria-invalid={!!errors.region} className={inputCls}>
                      <option value="">Province</option>
                      {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.region && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.region)}</p>}
                  </div>
                </div>
                <div>
                  <input required inputMode="numeric" placeholder="Postal code" value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value)} aria-invalid={!!errors.postalCode} className={inputCls} />
                  {errors.postalCode && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.postalCode)}</p>}
                </div>
              </div>
            </section>

            <button type="submit" disabled={busy}
              className="hidden lg:inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="pay-now-button">
              {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>) : (<>Pay {formatZAR(shippingMath.grandTotal)}</>)}
            </button>
            <p className="hidden lg:flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Secure checkout · PayFast · ZAR
            </p>
          </form>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold text-foreground">Order</h2>
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
            {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>) : (<>Pay {formatZAR(shippingMath.grandTotal)}</>)}
          </button>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Secure · PayFast · ZAR
          </p>
        </div>
      </div>
    </>
  );
}
