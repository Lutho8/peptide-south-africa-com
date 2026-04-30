import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  FlaskConical,
  CreditCard,
  Star,
  Flame,
  Sparkles,
} from "lucide-react";
import CursorOrb from "./CursorOrb";
import FloatingVial from "./FloatingVial";
import { products } from "@/data/products";

const stats = [
  { label: "Compounds", value: products.length.toString(), icon: FlaskConical },
  { label: "Purity", value: "≥99% HPLC", icon: ShieldCheck },
  { label: "SA Shipping", value: "1–3 days", icon: Truck },
  { label: "Pay", value: "Card · EFT · Crypto", icon: CreditCard },
];

export default function HeroShop() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-card via-background to-card">
      {/* ambient layers */}
      <CursorOrb />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(50% 40% at 85% 30%, hsl(var(--accent) / 0.18), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <FloatingVial />

      <div className="container relative z-10 px-4 pb-10 pt-10 md:pb-14 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* LEFT — copy + CTAs */}
          <div className="lg:col-span-7">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              ≥99% HPLC tested · COA on every batch · South Africa
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Research-grade peptides.{" "}
              <span className="text-gradient">Delivered in 48 hours.</span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Every batch independently HPLC-verified. Transparent ZAR pricing.
              Shipped discreetly from South Africa — no customs gambling, no markup mystery.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/shop"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-hero-gradient px-7 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Shop Peptides</span>
                <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition-all hover:bg-muted"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Find My Protocol
              </Link>
            </motion.div>

            {/* urgency ribbon */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Flame className="h-3.5 w-3.5 text-destructive" /> 23 orders in last 24h
              </span>
              <span>Free shipping over R1,500</span>
              <span className="rounded-full bg-trust/10 px-2 py-0.5 font-semibold text-trust">
                Code RIDETHETIDE10 · 10% off
              </span>
            </motion.div>

            {/* mini social proof */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-5 flex items-center gap-3 text-sm"
            >
              <div className="flex">
                {Array(5).fill(null).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-badge text-badge" />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9 / 5</span>
              <span className="text-muted-foreground">from 1,200+ South African researchers</span>
            </motion.div>
          </div>

          {/* RIGHT — trust stat tiles (Vril-style) */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-background/70 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                >
                  <div
                    aria-hidden
                    className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "hsl(var(--primary) / 0.4)" }}
                  />
                  <s.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/shop"
              className="mt-3 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-all hover:bg-primary/10"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  New
                </p>
                <p className="font-display text-base font-semibold text-foreground">
                  RT3 Triple Agonist now in stock
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
