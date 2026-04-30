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
import CursorOrb from "./CursorOrb";
import HeroBackdrop from "./HeroBackdrop";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { formatZAR } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

export default function HeroShop() {
  const reduce = useReducedMotion();
  const { addToCart } = useCart();
  const { user, hasFirstOrder } = useAuth();
  const { toast } = useToast();
  const eligible = !!user && hasFirstOrder === false;

  // Hero featured product = RT3 (best seller)
  const hero = products.find((p) => p.id === "1") ?? products[0];
  const discounted = Math.round(hero.price * 0.9);

  const handleAdd = () => {
    addToCart(hero);
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
      <HeroBackdrop />
      <div className="hidden md:block">
        <CursorOrb />
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

        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* LEFT — copy + CTAs */}
          <div className="lg:col-span-7">
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
              ≥99% HPLC tested · COA on every batch · South Africa
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
              className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Independently HPLC-verified. Transparent ZAR pricing. Discreet
              shipping from South Africa — order today, on its way tomorrow.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/shop"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-hero-gradient px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <ShoppingCart className="relative h-5 w-5" />
                <span className="relative">Buy Now</span>
                <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-6 py-4 text-base font-semibold text-foreground backdrop-blur transition-all hover:bg-muted"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Find My Protocol
              </Link>
            </motion.div>

            {/* urgency + trust micro-row */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Flame className="h-3.5 w-3.5 text-destructive" /> 23 orders in last 24h
              </span>
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Free shipping over R1,500
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-trust" /> 100% lab-tested
              </span>
            </motion.div>

            {/* social proof */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-4 flex items-center gap-3 text-sm"
            >
              <div className="flex">
                {Array(5).fill(null).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-badge text-badge" />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9 / 5</span>
              <span className="text-muted-foreground">1,200+ SA researchers</span>
            </motion.div>
          </div>

          {/* RIGHT — featured product offer card */}
          <motion.aside
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/90 p-5 shadow-card-hover backdrop-blur-xl">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-hero-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
                  Best Seller
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold text-foreground">
                  <FlaskConical className="h-3 w-3 text-primary" /> ≥99% HPLC
                </span>
              </div>

              <Link
                to={`/product/${hero.slug}`}
                className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
              >
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </Link>

              <div className="mt-4">
                <Link to={`/product/${hero.slug}`} className="hover:underline">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {hero.name}
                  </h3>
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {hero.shortDescription}
                </p>

                <div className="mt-4 flex items-end gap-3">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {formatZAR(discounted)}
                  </p>
                  <p className="pb-1 text-sm text-muted-foreground line-through">
                    {formatZAR(hero.price)}
                  </p>
                  <span className="ml-auto rounded-full bg-trust/10 px-2 py-0.5 text-[10px] font-bold text-trust">
                    SAVE 10%
                  </span>
                </div>

                <button
                  onClick={handleAdd}
                  className="group mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-hero-gradient py-3.5 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart {eligible && "— Save 10%"}
                </button>

                <Link
                  to={`/product/${hero.slug}`}
                  className="mt-2 block text-center text-xs font-semibold text-primary hover:underline"
                >
                  View product details →
                </Link>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  In stock · ships today · COA included
                </p>
              </div>
            </div>

            <Link
              to="/shop"
              className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all peptides <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
