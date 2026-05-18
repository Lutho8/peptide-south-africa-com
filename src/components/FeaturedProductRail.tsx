import { Link } from "react-router-dom";
import { ShoppingCart, FlaskConical, ShieldCheck, ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";

const FEATURED_IDS = ["1", "6", "7", "2", "4", "3"];

export default function FeaturedProductRail() {
  const { addToCart } = useCart();
  const { format } = useCurrency();
  const featured = FEATURED_IDS
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section className="relative border-y border-border bg-card/50 py-8 md:py-10">
      <div className="container px-4">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Best Sellers
            </span>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Add to cart in one click
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
          <div className="flex gap-4 snap-x snap-mandatory">
            {featured.map((p, i) => {
              const lowStock = i === 1; // fake scarcity on second card
              return (
                <article
                  key={p.id}
                  className="group relative flex w-[260px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <Link to={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.tag && (
                      <span className="absolute left-2 top-2 rounded-full bg-hero-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow-glow">
                        {p.tag}
                      </span>
                    )}
                    {p.purity && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                        <FlaskConical className="h-3 w-3 text-primary" /> {p.purity} HPLC
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <Link to={`/product/${p.slug}`} className="hover:underline">
                      <h3 className="font-display text-base font-semibold text-foreground">{p.name}</h3>
                    </Link>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {p.shortDescription}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[10px] font-medium">
                      <span className="inline-flex items-center gap-1 text-trust">
                        <ShieldCheck className="h-3 w-3" /> COA Verified
                      </span>
                      <span className={lowStock ? "text-destructive" : "text-trust"}>
                        {lowStock ? "Only 4 left" : "In stock · ships today"}
                      </span>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div>
                        <p className="font-display text-lg font-bold text-foreground">
                          {format(p.price)}
                        </p>
                        {p.priceRange && (
                          <p className="text-[10px] text-muted-foreground">{p.priceRange}</p>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        aria-label={`Add ${p.name} to cart`}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
