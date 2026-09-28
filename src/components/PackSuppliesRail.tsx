import { Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { packSupplies } from "@/data/packSupplies";
import { BAC_SLUG, BAC_NOTICE } from "../../supabase/functions/_shared/catalog-release";
import { VIAL_TEST_ID, vialTileFrameClasses, vialAccentBarSmClasses } from "@/lib/vialDesign";
export default function PackSuppliesRail() {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const { format } = useCurrency();
  if (!items.length) return null;
  const bac = packSupplies[BAC_SLUG];
  const current = items.find((item) => item.product.slug === BAC_SLUG);
  return <section className="my-3 rounded-lg border border-primary/25 bg-primary/[0.03] p-4" data-testid="pack-supplies-rail">
    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Optional product recommendation</p>
    <div className="mt-3 flex items-center gap-3">
      <Link to={`/product/${BAC_SLUG}`} className={`${vialTileFrameClasses} block h-20 w-20 shrink-0`} data-testid={VIAL_TEST_ID} aria-label="View BAC water 10 ml product">
        <span aria-hidden className={vialAccentBarSmClasses} />
        <img src={bac.image} alt="BAC water 10 ml" width={80} height={80} className="h-full w-full object-contain" loading="lazy" />
      </Link>
      <div>
        <h2 className="font-display text-base font-semibold"><Link to={`/product/${BAC_SLUG}`} className="hover:underline">BAC water 10 ml</Link></h2>
        <p className="mt-1 text-sm font-semibold text-primary">{format(bac.price)} per vial</p>
        <p className="mt-1 text-xs text-muted-foreground">Sold separately. Add only if needed.</p>
      </div>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{BAC_NOTICE}</p>
    <p className="mt-1 text-xs text-muted-foreground">Only paid add-ons count towards the free-delivery threshold.</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {!current ? <button type="button" onClick={() => addToCart(bac, { silent: true })} className="min-h-[44px] rounded-lg border border-primary px-4 text-sm font-semibold text-primary" aria-label="Add BAC water 10 ml">Add BAC water - {format(bac.price)}</button> : <>
        <button type="button" aria-label="Decrease BAC water quantity" onClick={() => updateQuantity(current.lineId, current.quantity - 1)} className="min-h-[44px] min-w-[44px] rounded-lg border p-3"><Minus className="h-4 w-4" /></button>
        <span aria-live="polite" className="px-2 text-sm font-semibold">{current.quantity} vial{current.quantity === 1 ? "" : "s"} - {format(current.quantity * bac.price)}</span>
        <button type="button" aria-label="Increase BAC water quantity" disabled={current.quantity >= 99} onClick={() => updateQuantity(current.lineId, current.quantity + 1)} className="min-h-[44px] min-w-[44px] rounded-lg border p-3"><Plus className="h-4 w-4" /></button>
        <button type="button" aria-label="Remove BAC water" onClick={() => removeFromCart(current.lineId)} className="min-h-[44px] rounded-lg border px-3 text-xs">Remove</button>
      </>}
    </div>
  </section>;
}
