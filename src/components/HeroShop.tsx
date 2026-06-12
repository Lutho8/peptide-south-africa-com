import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Star,
  Flame,
  Sparkles,
  Truck,
  FlaskConical,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { products } from "@/data/products";

const HERO_VIDEO_SRC =
  "https://player.vimeo.com/progressive_redirect/playback/1197576794/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&signature=17601266ee7e2cb1ad78cd417676683352bfc62cb32be03b087f5ee446fd2484";
const HERO_VIDEO_POSTER =
  "https://cdn.prod.website-files.com/69d7cec371c939d9bb8e2ad0/6a1f2d8a58036074a045f8dc_Rectangle%2022682%20(1).png";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

export default function HeroShop() {
  const reduce = useReducedMotion();
  const { addToCart } = useCart();
  const { user, hasFirstOrder } = useAuth();
  const { format } = useCurrency();
  const { toast } = useToast();
  const eligible = !!user && hasFirstOrder === false;

  // Hero featured product = RT3 (best seller). Price is in EUR (base currency).
  const hero = products.find((p) => p.id === "1") ?? products[0];
  const discounted = Math.round(hero.price * 0.9 * 100) / 100;

  const handleAdd = () => {
    // Hero product may have variants; pick the first as a sensible default.
    const v = hero.variants?.[0];
    addToCart(hero, v ? { variantLabel: v.label, unitPrice: v.price } : undefined);
    toast({
      title: "✓ Added to cart",
      description: eligible
        ? "RIDETHETIDE10 (10% off) auto-applied."
        : user
          ? "You've already ordered before — discount no longer eligible."
          : "Sign in to auto-apply 10% off your first order.",
    });
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Hero background video */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#0a2540]">
        <video
          src={HERO_VIDEO_SRC}
          poster={HERO_VIDEO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover opacity-70 motion-reduce:hidden"
        />
        <img
          src={HERO_VIDEO_POSTER}
          alt=""
          aria-hidden
          className="absolute inset-0 hidden h-full w-full object-cover opacity-70 motion-reduce:block"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2540]/55 via-[#0a2540]/35 to-background" />
      </div>

      <div className="container relative z-10 px-4 pb-12 pt-8 md:pb-16 md:pt-12">
        {/* OFFER RIBBON — top, full width, impossible to miss */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 flex max-w-3xl items-center justify-center gap-2 rounded-full bg-hero-gradient px-4 py-2 text-center text-xs font-semibold text-primary-foreground shadow-glow sm:text-sm"
        >
          <Tag className="h-4 w-4" />
          <span>
            {eligible
              ? <>Your <span className="font-bold">10% off</span> is auto-applied · code <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono">RIDETHETIDE10</span></>
              : user
                ? <>Welcome back · use code <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono">RIDETHETIDE10</span> on select items</>
                : <><Link to="/auth" className="underline underline-offset-2 hover:opacity-90">Sign in</Link> to auto-apply <span className="font-bold">10% off your first order</span> · code <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono">RIDETHETIDE10</span></>}
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            ≥99% HPLC tested · COA on every batch · South Africa &amp; Germany / EU
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Premium peptides.{" "}
            <span className="text-gradient">Shipped in 48 hours.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Independently HPLC-verified. Transparent EUR &amp; ZAR pricing. Discreet shipping to
            South Africa (1–3 days) and Germany / EU (4–7 days).
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <Flame className="h-3.5 w-3.5 text-destructive" /> 23 orders in last 24h
            </span>
            <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Free SA over R1,500 · EU over €75</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-trust" /> 100% lab-tested</span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-badge text-badge" /> 4.9 / 5 · 1,200+ researchers
            </span>
          </motion.div>
        </div>

        {/* Two-column product cards (Whoosh-style) */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          {[hero, secondary].map((p, idx) => (
            <motion.div
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card/90 p-5 shadow-card-hover backdrop-blur-xl"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

              <div className="mb-3 flex flex-wrap items-center gap-2">
                {p.tag && (
                  <span className="rounded-full bg-hero-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
                    {p.tag}
                  </span>
                )}
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                  {idx === 0 ? "Weight Loss" : "Recovery"}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-foreground">
                  <FlaskConical className="h-3 w-3 text-primary" /> ≥99% HPLC
                </span>
              </div>

              <div className="grid items-center gap-4 sm:grid-cols-[1fr,160px]">
                <div className="order-2 sm:order-1">
                  <Link to={`/product/${p.slug}`} className="hover:underline">
                    <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">{p.name}</h3>
                  </Link>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.shortDescription}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-foreground">
                      {p.priceRange ?? format(p.price)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/product/${p.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      Learn more
                    </Link>
                    <button
                      onClick={() => handleAdd(p)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-hero-gradient px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98]"
                    >
                      <ShoppingCart className="h-4 w-4" /> Start your protocol
                    </button>
                  </div>
                </div>
                <Link
                  to={`/product/${p.slug}`}
                  className="order-1 relative block aspect-square overflow-hidden rounded-2xl bg-muted sm:order-2"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    width={400}
                    height={400}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all peptides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category banners */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Weight Loss", href: "/shop?category=GLP" },
            { label: "Wellness & Longevity", href: "/shop?category=Longevity" },
            { label: "Recovery", href: "/shop?category=Healing" },
          ].map((c) => (
            <Link
              key={c.label}
              to={c.href}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card/80 px-5 py-4 backdrop-blur transition-all hover:bg-card"
            >
              <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{c.label}</span>
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

