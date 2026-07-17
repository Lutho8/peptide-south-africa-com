import { useEffect, useState } from "react";

/**
 * Pure-CSS scroll-driven 3D vial. Hidden on mobile + reduced-motion.
 * No Three.js — keeps bundle lean.
 */
export default function FloatingVial() {
  const [scrollY, setScrollY] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!enabled) return null;

  const rotate = scrollY * 0.25;
  const translate = scrollY * 0.3;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-4 top-12 z-10 hidden lg:block"
      style={{
        perspective: "1000px",
        transform: `translate3d(0, ${-translate}px, 0)`,
        willChange: "transform",
      }}
    >
      <div
        className="relative h-72 w-32"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotate}deg) rotateX(8deg)`,
          willChange: "transform",
          animation: "vial-float 6s ease-in-out infinite",
        }}
      >
        {/* Vial cap */}
        <div
          className="absolute left-1/2 top-0 h-10 w-20 -translate-x-1/2 rounded-t-md"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)",
            boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.3)",
          }}
        />
        {/* Vial neck */}
        <div
          className="absolute left-1/2 top-9 h-3 w-16 -translate-x-1/2"
          style={{ background: "hsl(var(--muted-foreground) / 0.4)" }}
        />
        {/* Vial body */}
        <div
          className="absolute left-1/2 top-12 h-56 w-24 -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(184,221,217,0.35))",
            backdropFilter: "blur(4px)",
            boxShadow:
              "inset 4px 0 12px rgba(255,255,255,0.6), inset -6px 0 14px rgba(15,23,42,0.08), 0 20px 40px -10px rgba(15,23,42,0.25)",
          }}
        >
          {/* Liquid (clear with light teal tint) */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                "linear-gradient(180deg, rgba(184,221,217,0.5), rgba(184,221,217,0.8))",
            }}
          />
          {/* Highlight */}
          <div className="absolute left-2 top-4 h-44 w-1.5 rounded-full bg-white/70" />
          {/* Label */}
          <div className="absolute left-1/2 top-1/2 w-20 -translate-x-1/2 -translate-y-1/2 rounded bg-white px-1 py-2 text-center shadow-sm">
            <div className="text-[7px] font-bold tracking-widest text-[#0a2540]">PEPTIDE SOUTH AFRICA</div>
            <div className="mt-0.5 font-display text-[10px] font-bold text-[#0a2540]">RT3</div>
            <div className="text-[6px] text-slate-500">≥99% HPLC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
