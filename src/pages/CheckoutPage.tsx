import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Lock, Loader2, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { cartBundleSavings } from "@/lib/bundlePricing";
import { currentOffer, trackCheckoutEntry, trackEvent } from "@/lib/analytics";
import { validateCheckout, type CheckoutForm, type CheckoutErrors, SA_PROVINCES } from "@/lib/checkoutSchema";
import { formatZAR } from "@/lib/price";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";
import {
  CHECKOUT_CONSENT_STATEMENTS,
  CHECKOUT_POLICY_VERSION,
} from "../../supabase/functions/_shared/checkout-consent";
import {
  CHECKOUT_FORM_KEY as FORM_KEY,
  EFT_SESSION_KEY,
  checkoutTotals,
  emptyCheckoutForm as emptyForm,
  paymentErrorMessage,
  startEftCheckout,
} from "@/lib/eftCheckout";

const errCopy: Record<string, string> = {
  err_name_chars: "Please enter a valid name",
  err_email: "Enter a valid email",
  err_address_short: "Enter your street address",
  err_required: "Required",
  err_postal_sa: "Enter a 4-digit postal code",
  err_region_sa: "Select a province",
  err_consent_required: "Required to place a research-use order",
};

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";


export default function CheckoutPage() {
  const { items, subtotal, totalPrice, clearCart } = useCart();
  const bundleSavings = cartBundleSavings(items);
  const specialOffer = Math.round(bundleSavings * 100) / 100;
  const { user, refreshOrders } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");

  const [form, setForm] = useState<CheckoutForm>(() => {
    if (typeof window === "undefined") return emptyForm;
    try {
      const raw = window.sessionStorage.getItem(FORM_KEY);
      if (!raw) return { ...emptyForm, email: user?.email ?? "" };
      const parsed = JSON.parse(raw) as Partial<CheckoutForm>;
      const versionMatches = parsed.consentPolicyVersion === CHECKOUT_POLICY_VERSION;
      return {
        ...emptyForm,
        ...parsed,
        ...(!versionMatches ? {
          researchPurchaseAcknowledged: false,
          marketingConsent: false,
        } : {}),
        consentPolicyVersion: CHECKOUT_POLICY_VERSION,
        email: parsed.email || user?.email || "",
      };
    } catch {
      return emptyForm;
    }
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const entryTracked = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!items.length || entryTracked.current) return;
    entryTracked.current = true;
    trackCheckoutEntry();
  }, [items.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const setField = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const errText = (key?: string) => (key ? errCopy[key] ?? key : undefined);

  const shippingMath = useMemo(
    () => checkoutTotals(totalPrice),
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

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkoutForm = e.currentTarget;
    const result = validateCheckout(form);
    if (result.ok === false) {
      setErrors(result.errors);
      requestAnimationFrame(() => {
        const field = checkoutForm.querySelector<HTMLElement>("[aria-invalid='true']");
        field?.focus({ preventScroll: true });
        field?.scrollIntoView({ block: "center" });
      });
      return;
    }
    setBusy(true);
    const offer = currentOffer();
    trackEvent({ event: "checkout_started", props: { displayed_price_zar: shippingMath.grandTotal, item_count: items.length, ...(offer ? { offer_id: offer.offer_id } : {}) } });
    try {
      const state = await startEftCheckout({ items, form, partnerCode });
      try {
        window.sessionStorage.setItem(EFT_SESSION_KEY, JSON.stringify(state));
        window.sessionStorage.setItem(FORM_KEY, JSON.stringify({
          ...form,
          researchPurchaseAcknowledged: false,
          marketingConsent: false,
        }));
      } catch {
        /* storage unavailable */
      }
      // Order success must not depend on account refresh or cart cleanup.
      if (user) {
        void refreshOrders().catch(() => {});
        void Promise.resolve(supabase.from("cart_snapshots").delete().eq("user_id", user.id)).catch(() => {});
      }
      clearCart();
      navigate("/checkout/eft-instructions", { state });
    } catch (err) {
      toast({
        title: "Checkout unavailable",
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

      <div className="container max-w-5xl py-4 pb-32 md:py-12 lg:pb-12">
        <div className="mb-4 text-center md:mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your delivery details, then pay by EFT in your banking app.
          </p>
        </div>

        {!user && <p className="mb-4 text-center text-sm text-muted-foreground">No account needed. Already have one? <Link className="text-primary underline" to="/auth?redirect=/checkout">Sign in</Link></p>}
        <div className="grid gap-4 lg:grid-cols-[1fr_400px] lg:gap-8">
          <div className="flex flex-col gap-6">
            <form id="checkout-form" onSubmit={handlePay} className="flex flex-col gap-6 [&_input]:scroll-mb-32 [&_select]:scroll-mb-32">
              <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
                <h2 className="font-display text-base font-semibold text-foreground">
                  1. Where should we send your confirmation?
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="block space-y-1 text-sm font-medium"><span>Email address</span>
                      <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                        aria-invalid={!!errors.email} className={inputCls} />
                    </label>
                    {errors.email && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.email)}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block space-y-1 text-sm font-medium"><span>First name</span>
                        <input required autoComplete="given-name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                          aria-invalid={!!errors.firstName} className={inputCls} />
                      </label>
                      {errors.firstName && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.firstName)}</p>}
                    </div>
                    <div>
                      <label className="block space-y-1 text-sm font-medium"><span>Last name</span>
                        <input required autoComplete="family-name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                          aria-invalid={!!errors.lastName} className={inputCls} />
                      </label>
                      {errors.lastName && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.lastName)}</p>}
                    </div>
                  </div>
                </div>

                <h2 className="mt-8 font-display text-base font-semibold text-foreground">
                  2. Where should we deliver?
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="block space-y-1 text-sm font-medium"><span>Street address</span>
                      <input required autoComplete="street-address" value={form.address1} onChange={(e) => setField("address1", e.target.value)}
                        aria-invalid={!!errors.address1} className={inputCls} />
                    </label>
                    {errors.address1 && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.address1)}</p>}
                  </div>
                  <div className="grid gap-3 min-[400px]:grid-cols-2">
                    <div>
                      <label className="block space-y-1 text-sm font-medium"><span>City</span>
                        <input required autoComplete="address-level2" value={form.city} onChange={(e) => setField("city", e.target.value)}
                          aria-invalid={!!errors.city} className={inputCls} />
                      </label>
                      {errors.city && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.city)}</p>}
                    </div>
                    <div>
                      <label htmlFor="checkout-province" className="mb-1 block text-sm font-medium">Province</label>
                      <select id="checkout-province" required autoComplete="address-level1" value={form.region} onChange={(e) => setField("region", e.target.value)}
                        aria-invalid={!!errors.region} className={inputCls}>
                        <option value="">Select province</option>
                        {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.region && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.region)}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block space-y-1 text-sm font-medium"><span>Postal code</span>
                      <input required inputMode="numeric" autoComplete="postal-code" value={form.postalCode}
                        onChange={(e) => setField("postalCode", e.target.value)} aria-invalid={!!errors.postalCode} className={inputCls} />
                    </label>
                    {errors.postalCode && <p role="alert" className="mt-1 text-xs text-destructive">{errText(errors.postalCode)}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">Delivery across South Africa. Dispatch follows payment verification; delivery timing depends on your location.</p>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                  3. Research purchase acknowledgement
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Please confirm these purchase terms to continue. Marketing updates are optional.
                </p>
                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3.5">
                    <input
                      type="checkbox"
                      checked={form.researchPurchaseAcknowledged}
                      onChange={(event) => setField("researchPurchaseAcknowledged", event.target.checked)}
                      aria-invalid={!!errors.researchPurchaseAcknowledged}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="space-y-2 text-xs leading-relaxed text-foreground">
                      <span className="block">{CHECKOUT_CONSENT_STATEMENTS.age}</span>
                      <span className="block">{CHECKOUT_CONSENT_STATEMENTS.researchUse}</span>
                      <span className="block">{CHECKOUT_CONSENT_STATEMENTS.nonHumanUse}</span>
                      <span className="block">{CHECKOUT_CONSENT_STATEMENTS.reportScope}</span>
                    </span>
                  </label>
                </div>
                {errors.researchPurchaseAcknowledged && (
                  <p role="alert" className="mt-3 text-xs font-medium text-destructive">
                    Confirm the research purchase acknowledgement to continue.
                  </p>
                )}

                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Optional marketing consent
                  </p>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                    <input
                      type="checkbox"
                      checked={form.marketingConsent}
                      onChange={(event) => setField("marketingConsent", event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="text-xs leading-relaxed text-foreground">{CHECKOUT_CONSENT_STATEMENTS.marketing}</span>
                  </label>
                </div>

              </section>

              <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                  <Landmark className="h-4 w-4 text-primary" /> 4. Payment — EFT (direct bank transfer)
                </h2>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary bg-primary/5 p-4 ring-2 ring-ring">
                  <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Pay by EFT — no card fees</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Pay directly from your banking app (Capitec, FNB, Standard Bank, Absa, Nedbank, TymeBank — any SA bank).
                      Place your order and we will show you our bank details and your unique payment reference on the next screen.
                      Your order will await payment while your transfer clears.
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Pay in <span className="font-semibold text-foreground">ZAR</span>. We prepare your order for dispatch after payment is verified.
                </p>
              </section>

              <details>
                <summary className="cursor-pointer text-sm text-muted-foreground">Have a partner code?</summary>
                <label className="mt-3 block space-y-1 text-sm">
                  <span>Partner code (optional)</span>
                  <input value={partnerCode} onChange={e => setPartnerCode(e.target.value)} maxLength={80} className={inputCls} />
                </label>
                <p className="mt-1 text-xs text-muted-foreground">This credits the partner who referred you. Your total stays the same.</p>
              </details>

              <button type="submit" disabled={busy}
                className="hidden lg:inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="pay-now-button">
                {busy
                  ? (<><Loader2 className="h-4 w-4 animate-spin" /> Reserving your order…</>)
                  : (<><Landmark className="h-4 w-4" /> Place order — get EFT details · {formatZAR(shippingMath.grandTotal)}</>)}
              </button>
              <p className="hidden lg:flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Secure checkout · EFT bank transfer · ZAR
              </p>
            </form>
          </div>

          <aside className="order-first flex flex-col gap-4 lg:order-none">
            <button
              type="button"
              className="flex min-h-12 items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2 text-left text-sm font-semibold lg:hidden"
              aria-expanded={summaryOpen}
              aria-controls="checkout-order-summary"
              onClick={() => setSummaryOpen((open) => !open)}
            >
              <span>Order summary</span>
              <span className="flex items-center gap-2">
                {formatZAR(shippingMath.grandTotal)}
                <ChevronDown className={`h-4 w-4 ${summaryOpen ? "rotate-180" : ""}`} aria-hidden />
              </span>
            </button>
            <div id="checkout-order-summary" className={`${summaryOpen ? "block" : "hidden"} rounded-lg border border-border bg-card p-4 sm:p-6 lg:block`}>
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
                    <span>Pack savings (included)</span><span>{formatZAR(specialOffer)}</span>
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

          </aside>
        </div>

        {/* Mobile sticky pay bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <button type="submit" form="checkout-form" disabled={busy} aria-describedby="mobile-payment-next"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-3 py-2 text-center font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
            {busy
              ? (<><Loader2 className="h-4 w-4 animate-spin" /> Reserving your order…</>)
              : (<>Place order · {formatZAR(shippingMath.grandTotal)}</>)}
          </button>
          <p id="mobile-payment-next" className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Get your EFT details next
          </p>
        </div>
      </div>

    </>
  );
}
