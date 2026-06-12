import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { products, type Product } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  eyebrow: string;
  title: string;
  blurb: string;
  productIds: string[];
  shopHref: string;
  accent?: "weight-loss" | "longevity" | "recovery";
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  "weight-loss": "from-[#0a2540] to-[#1a4d6e]",
  longevity: "from-[#003d3a] to-[#00665e]",
  recovery: "from-[#3a1f0b] to-[#7a4a1a]",
};

export default function CategoryShowcase({ eyebrow, title, blurb, productIds, shopHref, accent = "weight-loss" }: Props) {
  const { format } = useCurrency();
  const items = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <section className={`relative isolate overflow-hidden bg-gradient-to-br ${ACCENT[accent]} text-white`}>
      <div className="container px-4 py-16 md:py-24">
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight md:text-5xl">{title}</h2>
          </div>
          <p className="text-base text-white/80 md:text-lg">{blurb}</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white/10 p-5 backdrop-blur transition-all hover:bg-white/15"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-black/20">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                {p.tag && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {p.tag}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-white/75">{p.shortDescription}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-base font-semibold">
                  {p.priceRange ?? format(p.price)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 group-hover:underline">
                  View {p.name} <ArrowRight className="h-4 w-4" />
                </span>

              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to={shopHref}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Explore {title} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
