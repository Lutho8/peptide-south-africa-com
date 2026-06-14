import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Dropdown = { label: string; items: { label: string; to: string; external?: boolean; desc?: string }[] };

const DROPDOWNS: Dropdown[] = [
  {
    label: "Programs",
    items: [
      { label: "Weight Loss", to: "/shop?category=GLP", desc: "GLP-1 program · Retatrutide & Tirzepatide" },
      { label: "Recovery", to: "/shop?category=Healing", desc: "Tissue repair & faster recovery" },
      { label: "Longevity", to: "/shop?category=Longevity", desc: "Mitochondrial & age-better stacks" },
      { label: "Kits", to: "/shop#kits", desc: "Bundled peptide kits by goal" },
      { label: "All Programs", to: "/shop" },
    ],
  },
  {
    label: "How It Works",
    items: [
      { label: "Our Process", to: "/#how-it-works", desc: "Assess → Recommend → Activate" },
      { label: "Clinical Review", to: "/#how-it-works", desc: "GP-led, where clinically required" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    label: "Science",
    items: [
      { label: "Research Hub", to: "/research", desc: "98+ peptides, dosing, citations" },
      { label: "Lab Testing & COAs", to: "/testing", desc: "≥99% HPLC · per-batch reports" },
      { label: "Blog", to: "/blog" },
    ],
  },
];

function Wordmark() {
  return (
    <span className="flex items-baseline gap-2 leading-none">
      <span className="font-display text-[26px] tracking-tight text-foreground sm:text-[30px]">
        Peptide
      </span>
      <span className="font-display text-[26px] italic text-clay sm:text-[30px]">SA</span>
      <span aria-hidden className="hidden h-1.5 w-1.5 rounded-full bg-accent sm:inline-block" />
      <span className="eyebrow hidden text-foreground/60 md:inline">South Africa</span>
    </span>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { totalItems, setIsCartOpen } = useCart();

  const CartButton = ({ className = "" }: { className?: string }) => (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      aria-label={`Open cart (${totalItems} item${totalItems === 1 ? "" : "s"})`}
      className={`relative inline-flex items-center justify-center rounded-full border border-border p-2.5 text-foreground transition-colors hover:bg-muted ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-clay px-1 font-mono text-[10px] font-bold text-background shadow">
          {totalItems}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
      <div className="container flex h-[68px] items-center justify-between px-4">
        <Link to="/" aria-label="Peptide South Africa" className="flex items-center">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {DROPDOWNS.map((d, idx) => (
            <div
              key={d.label}
              className="relative"
              onMouseEnter={() => setOpenIdx(idx)}
              onMouseLeave={() => setOpenIdx(null)}
            >
              <button
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                {d.label} <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {openIdx === idx && (
                <div className="absolute left-0 top-full z-50 w-72 rounded-xl border border-border bg-card p-2 shadow-card-hover">
                  {d.items.map((it) =>
                    it.external ? (
                      <a
                        key={it.label}
                        href={it.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <div className="font-medium text-foreground">{it.label} ↗</div>
                        {it.desc && <div className="text-xs text-muted-foreground">{it.desc}</div>}
                      </a>
                    ) : (
                      <Link
                        key={it.label}
                        to={it.to}
                        onClick={() => setOpenIdx(null)}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <div className="font-medium text-foreground">{it.label}</div>
                        {it.desc && <div className="text-xs text-muted-foreground">{it.desc}</div>}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          <Link to="/account" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Account
          </Link>

          <Link
            to="/assessment"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-background shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            Take Assessment <ArrowRight className="h-4 w-4" />
          </Link>
          <CartButton className="ml-2" />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/assessment"
            className="rounded-full bg-clay px-3 py-2 text-xs font-bold text-background"
          >
            Assessment
          </Link>
          <CartButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-card p-4 lg:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/assessment" onClick={() => setMobileOpen(false)} className="rounded-full bg-clay px-3 py-3 text-center text-sm font-bold text-background">
              Take Assessment →
            </Link>
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">Programs</Link>
            {DROPDOWNS.map((d) => (
              <details key={d.label} className="rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-foreground">
                  {d.label}
                </summary>
                <div className="flex flex-col gap-1 border-t border-border px-3 py-2">
                  {d.items.map((it) =>
                    it.external ? (
                      <a key={it.label} href={it.to} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm text-muted-foreground">
                        {it.label} ↗
                      </a>
                    ) : (
                      <Link key={it.label} to={it.to} onClick={() => setMobileOpen(false)} className="py-1.5 text-sm text-muted-foreground">
                        {it.label}
                      </Link>
                    )
                  )}
                </div>
              </details>
            ))}
            <Link to="/account" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">
              My Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
