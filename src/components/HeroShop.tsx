import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Star,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Truck,
  FlaskConical,
  ShoppingCart,
} from "lucide-react";

import { products } from "@/data/products";
import ShaderBackdrop from "@/components/ShaderBackdrop";

const HERO_VIDEO_SRC =
  "https://player.vimeo.com/progressive_redirect/playback/1197576794/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&signature=17601266ee7e2cb1ad78cd417676683352bfc62cb32be03b087f5ee446fd2484";
const HERO_VIDEO_POSTER =
  "https://cdn.prod.website-files.com/69d7cec371c939d9bb8e2ad0/6a1f2d8a58036074a045f8dc_Rectangle%2022682%20(1).png";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

export default function HeroShop() {
  const reduce = useReducedMotion();
  const { addToCart } = useCart();
  const { format } = useCurrency();
  const { toast } = useToast();

  // Hero featured products: RT3 (Weight Loss) + BPC/TB-500 (Recovery).
  const hero = products.find((p) => p.id === "1") ?? products[0];
  const secondary = products.find((p) => p.id === "6") ?? products.find((p) => p.id === "3") ?? products[1];

  const handleAdd = (p: typeof hero) => {
    if (!p.inStock) return;
    const v = p.variants?.[0];
    addToCart(p, v ? { variantLabel: v.label, unitPrice: v.price } : undefined);
    toast({
      title: "✓ Added to cart",
      description: "Your selection is ready in the cart.",
    });
  };


  return (
    <section className="relative isolate overflow-hidden">
      {/* Hero background video — full bleed, dark scrim for legibility on mobile */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#0a2540]">
        <ShaderBackdrop variant="dark" className="opacity-80" />
        <video
          src={HERO_VIDEO_SRC}
          poster={HERO_VIDEO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover opacity-60 motion-reduce:hidden"
        />
        <img
          src={HERO_VIDEO_POSTER}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 hidden h-full w-full object-cover opacity-60 motion-reduce:block"
        />

        {/* Strong dark scrim on mobile for text contrast, softer on desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2540]/85 via-[#0a2540]/70 to-background md:from-[#0a2540]/60 md:via-[#0a2540]/40" />
      </div>

      <div className="container relative z-10 px-4 pb-10 pt-6 md:pb-16 md:pt-12">
        {/* Headline — white text over video for contrast */}
        <div className="mx-auto max-w-4xl text-center">

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 font-display text-[2.25rem] font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl"
          >
            South Africa&rsquo;s{" "}
            <span className="bg-gradient-to-r from-[#5eead4] to-[#00d4aa] bg-clip-text text-transparent">peptide-first telehealth</span>{" "}
            platform.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-3 max-w-2xl text-[15px] font-semibold leading-relaxed text-white/90 sm:mt-4 sm:text-lg"
          >
            We focus on getting you results through clinician-guided pathways.
          </motion.p>

          {/* One clear next step for first-time visitors */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mx-auto mt-6 flex w-full max-w-md justify-center"
          >
            <Link
              to="/quiz"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-7 py-3.5 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
            >
              New to peptides? Start here <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-white/85 sm:text-xs"
          >
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00d4aa]" /> Prices include VAT — what you see is what you pay
            </span>
            <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Free shipping over R1,500</span>
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" /> HPCSA-registered GP review on all orders
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> 4.9 · 1,200+
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
                {!p.inStock && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
                    Out of Stock
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
                      View {p.name} details
                    </Link>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={!p.inStock}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-hero-gradient px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ShoppingCart className="h-4 w-4" /> {p.inStock ? "Start your protocol" : "Out of Stock"}
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
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Weight Loss", href: "/shop?category=GLP" },
            { label: "Wellness & Longevity", href: "/shop?category=Longevity" },
            { label: "Recovery", href: "/shop?category=Healing" },
            { label: "Pets", href: "https://pets.peptide-south-africa.com/", external: true },
          ].map((c) =>
            c.external ? (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-border bg-card/80 px-5 py-4 backdrop-blur transition-all hover:bg-card"
              >
                <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{c.label} ↗</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <Link
                key={c.label}
                to={c.href}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card/80 px-5 py-4 backdrop-blur transition-all hover:bg-card"
              >
                <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{c.label}</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
