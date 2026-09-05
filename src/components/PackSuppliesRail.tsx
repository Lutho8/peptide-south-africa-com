import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { packSupplies, PACK_SUPPLY_SLUGS } from "@/data/packSupplies";
import { recommendedBacWaterQuantity, type PackSupplySlug } from "../../supabase/functions/_shared/pricing";

function qualifyingPacks(items: ReturnType<typeof useCart>["items"]): Array<3 | 5 | 10> {
  const packs: Array<3 | 5 | 10> = [];
  const seenBundles = new Set<string>();
  for (const item of items) {
    if (item.bundleId) {
      if (seenBundles.has(item.bundleId)) continue;
      seenBundles.add(item.bundleId);
      const size = items.filter((candidate) => candidate.bundleId === item.bundleId).length;
      if (size === 5 || size === 10) packs.push(size);
      continue;
    }
    if (/^3-pack$/i.test(item.variantLabel ?? "")) packs.push(...Array(item.quantity).fill(3));
  }
  return packs;
}

export default function PackSuppliesRail() {
  const { items, addToCart } = useCart();
  const { format } = useCurrency();
  const packs = useMemo(() => qualifyingPacks(items), [items]);
  if (packs.length === 0) return null;

  const standardLimit = packs.length;
  const bacWaterLimit = packs.reduce((total, pack) => total + recommendedBacWaterQuantity(pack), 0);
  const addRecommended = (slug: PackSupplySlug, limit: number) => {
    const existing = items.find((item) => item.product.slug === slug)?.quantity ?? 0;
    for (let quantity = existing; quantity < limit; quantity += 1) addToCart(packSupplies[slug], { silent: true });
  };

  return (
    <section className="rounded-lg border border-primary/25 bg-primary/[0.03] p-4" data-testid="pack-supplies-rail">
      <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Pack-only supplies</p>
      <h2 className="mt-1 font-display text-base font-semibold text-foreground">Complete your qualifying peptide pack</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        These supplies are available only with your 3-, 5-, or 10-pack peptide purchase and are not sold separately.
      </p>
      <ul className="mt-3 space-y-3">
        {PACK_SUPPLY_SLUGS.map((slug) => {
          const supply = packSupplies[slug];
          const limit = slug === "bac-water-bacteriostatic" ? bacWaterLimit : standardLimit;
          const current = items.find((item) => item.product.slug === slug)?.quantity ?? 0;
          return (
            <li key={slug} className="flex items-center gap-3">
              <img src={supply.image} alt="" className="h-11 w-11 rounded-md object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{supply.name}</p>
                <p className="text-[11px] text-muted-foreground">Recommended: {limit} · {format(supply.price)} each</p>
              </div>
              <button type="button" onClick={() => addRecommended(slug, limit)} disabled={current >= limit}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/5 disabled:cursor-default disabled:opacity-60"
                aria-label={`Add ${limit} ${supply.name} to order`}>
                <Plus className="h-3 w-3" /> {current >= limit ? `Added ${current}` : `Add ${limit}`}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
