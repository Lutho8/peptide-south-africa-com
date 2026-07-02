import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ChevronDown, Info, Layers, ShoppingCart, Sparkles, Truck, X } from "lucide-react";
import { products, type Product } from "@/data/products";
import {
  CURATED_STACKS,
  MIX_BUNDLE_TIERS,
  allocateMixLinePrices,
  quoteMixBundle,
  resolveStackProducts,
  singleVialPrice,
  type MixBundleSize,
} from "@/lib/bundlePricing";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

/** One selector slot: a product slug or empty. */
type Slot = string | "";

const selectableProducts = products; // full catalog; out-of-stock rendered disabled

function emptySlots(size: MixBundleSize, prefill: Slot[] = []): Slot[] {
  const slots: Slot[] = Array(size).fill("");
  prefill.slice(0, size).forEach((s, i) => (slots[i] = s));
  return slots;
}

export default function BuildYourStackPage() {
  const [searchParams] = useSearchParams();
  const prefillSlug = searchParams.get("prefill") ?? "";
  const validPrefill = products.some((p) => p.slug === prefillSlug) ? prefillSlug : "";

  const [size, setSize] = useState<MixBundleSize>(5);
  const [slots, setSlots] = useState<Slot[]>(() => emptySlots(5, validPrefill ? [validPrefill] : []));
  const [added, setAdded] = useState(false);

  const { addBundleToCart } = useCart();
  const { format } = useCurrency();
  const { toast } = useToast();

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), []);
  const selected = slots.map((s) => (s ? bySlug.get(s) : undefined));
  const filledCount = selected.filter(Boolean).length;
  const complete = filledCount === size;
  const outOfStockSlots = selected
    .map((p, i) => (p && !p.inStock ? i : -1))
    .filter((i) => i >= 0);

  const tier = MIX_BUNDLE_TIERS[size];
  const runningSubtotal = selected.reduce((s, p) => s + (p ? singleVialPrice(p) : 0), 0);
  const runningTotal = Math.round(runningSubtotal * tier.multiplier);
  const runningSavings = runningSubtotal - runningTotal;

  const switchSize = (next: MixBundleSize) => {
    if (next === size) return;
    setSize(next);
    setSlots((prev) => emptySlots(next, prev));
  };

  const setSlot = (index: number, slug: Slot) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? slug : s)));
  };

  const applyStack = (stackId: string) => {
    const stack = CURATED_STACKS.find((s) => s.id === stackId);
    if (!stack) return;
    if (size !== 5) switchSize(5);
    setSlots(emptySlots(5, stack.slugs));
  };

  const handleAdd = () => {
    if (!complete) {
      toast({
        title: `Pick ${size - filledCount} more vial${size - filledCount === 1 ? "" : "s"}`,
        description: `A ${size}-pack needs exactly ${size} vials — mix any products you like.`,
      });
      return;
    }
    if (outOfStockSlots.length > 0) {
      toast({
        title: "Swap out-of-stock items to continue",
        description: "One or more selected vials are currently out of stock — highlighted below.",
        variant: "destructive",
      });
      return;
    }
    const selection = selected as Product[];
    const prices = allocateMixLinePrices(selection, size);
    addBundleToCart(
      selection.map((p, i) => ({
        product: p,
        unitPrice: prices[i],
        compareAtPrice: singleVialPrice(p),
      })),
      { label: `${tier.label} (${tier.discountPct}% Off)`, discountPct: tier.discountPct },
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const quote = complete && outOfStockSlots.length === 0
    ? quoteMixBundle(selected as Product[], size)
    : undefined;

  return (
    <div className="pb-28 md:pb-0">
      <SEO
        title="Build Your Own Peptide Stack | 5-Pack 20% Off · 10-Pack 30% Off"
        description="South Africa's only peptide pick & mix. Choose any 5 vials for 20% off or any 10 for 30% off. VAT-inclusive pricing, free nationwide shipping, 99%+ HPLC purity."
        path="/build-your-stack"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Build Your Own Peptide Stack",
          description: "Pick & mix peptide bundles — 5-Pack at 20% off, 10-Pack at 30% off.",
        }}
      />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Build Your Stack" }]} />

      {/* Hero strip */}
      <section className="border-b border-border bg-hero-gradient">
        <div className="container px-4 py-10 text-center md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> The only pick &amp; mix in SA
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-primary-foreground sm:text-4xl md:text-5xl">
            Build Your Own Stack
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
            Pick any {size} vials from the catalog — mix products or repeat your favourite —
            and save {tier.discountPct}% off single-vial pricing. Prices include VAT.
          </p>
          <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-1 rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur">
            {(Object.keys(MIX_BUNDLE_TIERS) as unknown as MixBundleSize[]).map((s) => {
              const n = Number(s) as MixBundleSize;
              return (
                <button
                  key={n}
                  onClick={() => switchSize(n)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    size === n
                      ? "bg-card text-foreground shadow-card"
                      : "text-primary-foreground/80 hover:text-primary-foreground"
                  }`}
                >
                  {n}-Pack · {MIX_BUNDLE_TIERS[n].discountPct}% off
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-curated stacks — swipeable row on mobile */}
      <section className="container px-4 pt-8">
        <h2 className="font-display text-lg font-bold text-foreground">Quick-start stacks</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Tap a curated 5-pack to auto-fill your slots, then tweak anything you like.
        </p>
        <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {CURATED_STACKS.map((stack) => {
            const stackProducts = resolveStackProducts(stack).filter((p): p is Product => !!p);
            const q = stackProducts.length === 5 ? quoteMixBundle(stackProducts, 5) : undefined;
            const hasOOS = stackProducts.some((p) => !p.inStock);
            return (
              <button
                key={stack.id}
                onClick={() => applyStack(stack.id)}
                className="min-w-[240px] snap-start rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover sm:min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold text-foreground">{stack.name}</span>
                  <Layers className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{stack.tagline}</p>
                <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">
                  {stackProducts.map((p) => p.name.split(" ")[0]).join(" + ")}
                </p>
                {q && (
                  <p className="mt-2 font-mono text-sm font-bold text-primary">
                    {format(q.total)}{" "}
                    <span className="text-[10px] font-semibold text-trust">save {format(q.savings)}</span>
                  </p>
                )}
                {hasOOS && (
                  <p className="mt-1 text-[10px] font-medium text-amber-600">
                    Includes items awaiting restock — swap after selecting
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Builder */}
      <section className="container grid gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-foreground">
            Choose your {size} vials
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {slots.map((slug, i) => {
              const p = slug ? bySlug.get(slug) : undefined;
              const oos = p && !p.inStock;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 transition-colors ${
                    oos ? "border-amber-500/60 bg-amber-500/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {p ? (
                      <img src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </div>
                    )}
                    <div className="relative flex-1">
                      <select
                        aria-label={`Vial ${i + 1}`}
                        value={slug}
                        onChange={(e) => setSlot(i, e.target.value)}
                        className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-9 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Vial {i + 1} — choose a peptide…</option>
                        {selectableProducts.map((sp) => (
                          <option key={sp.slug} value={sp.slug} disabled={!sp.inStock}>
                            {sp.name} — R{singleVialPrice(sp).toLocaleString("en-ZA")}
                            {!sp.inStock ? " (out of stock)" : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {p && (
                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="font-mono text-sm font-bold text-foreground">
                          {format(singleVialPrice(p))}
                        </p>
                        <p className="font-mono text-[10px] text-trust">
                          → {format(Math.round(singleVialPrice(p) * tier.multiplier))} in pack
                        </p>
                      </div>
                    )}
                    {slug && (
                      <button
                        onClick={() => setSlot(i, "")}
                        aria-label={`Clear vial ${i + 1}`}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {oos && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                      <Info className="h-3.5 w-3.5" /> {p!.name} is out of stock — swap it to continue.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary (desktop side panel) */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-bold text-foreground">Your {size}-Pack</h3>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Vials selected</span>
              <span className="font-semibold text-foreground">{filledCount} / {size}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Single-vial subtotal</span>
              <span className={runningSubtotal > 0 ? "line-through" : ""}>{format(runningSubtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>{tier.label} ({tier.discountPct}% off)</span>
              <span data-testid="mix-total">{format(runningTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-trust">
              <span>You Save</span>
              <span data-testid="mix-savings">{format(runningSavings)}</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!complete || outOfStockSlots.length > 0}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {added ? (
              <><CheckCircle className="h-4 w-4" /> Added to Cart!</>
            ) : (
              <><ShoppingCart className="h-4 w-4" /> Add {size}-Pack to Cart{quote ? ` — ${format(quote.total)}` : ""}</>
            )}
          </button>
          <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-trust" /> Free shipping — every pack clears the R1,500 threshold</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-trust" /> Prices include VAT — what you see is what you pay</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-trust" /> 99%+ HPLC tested by Janoshik — COA on every batch</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-trust" /> First order? PEPTIDESA10 stacks another 10% on top</span>
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground">
            For research purposes only. Not for human use or consumption.{" "}
            <Link to="/shop" className="text-primary hover:underline">Prefer single vials or 3-packs? Shop the catalog →</Link>
          </p>
        </aside>
      </section>

      {/* Sticky mobile total bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur lg:hidden">
        <div className="container flex items-center justify-between gap-3 px-1">
          <div>
            <p className="font-display text-base font-bold text-foreground">{format(runningTotal)}</p>
            <p className="text-[10px] font-semibold text-trust">
              {runningSavings > 0 ? `You Save ${format(runningSavings)}` : `${filledCount}/${size} vials selected`}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!complete || outOfStockSlots.length > 0}
            className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98] disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" /> {added ? "Added!" : `Add ${size}-Pack`}
          </button>
        </div>
      </div>
    </div>
  );
}
