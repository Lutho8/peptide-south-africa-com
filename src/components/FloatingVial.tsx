import { useEffect, useState } from "react";

/**
 * Pure-CSS scroll-driven 3D vial. Hidden on mobile + reduced-motion.
 * All styling flows from the shared `--vial-*` tokens in `src/index.css`
 * so the white + light-teal medical/luxury look stays consistent across
 * the site (product cards, PDP gallery, this 3D mock).
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
      data-testid="floating-vial"
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
        {/* Silver crimp cap */}
        <div
          className="absolute left-1/2 top-0 h-10 w-20 -translate-x-1/2 rounded-t-md bg-vial-cap"
          style={{ boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.25)" }}
        />
        {/* Neck */}
        <div className="absolute left-1/2 top-9 h-3 w-16 -translate-x-1/2 bg-vial-cap opacity-70" />
        {/* Glass body */}
        <div
          className="absolute left-1/2 top-12 h-56 w-24 -translate-x-1/2 overflow-hidden rounded-2xl border border-vial-border bg-vial-glass shadow-vial"
        >
          {/* Teal-tinted liquid */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-vial-liquid" />
          {/* Glass highlight */}
          <div className="absolute left-2 top-4 h-44 w-1.5 rounded-full bg-white/70" />
          {/* Label — white plate with navy ink + thin teal rule */}
          <div className="absolute left-1/2 top-1/2 w-20 -translate-x-1/2 -translate-y-1/2 rounded bg-vial-surface px-1 py-2 text-center shadow-sm">
            <div className="text-[7px] font-bold tracking-widest text-vial-ink">
              PEPTIDE SOUTH AFRICA
            </div>
            <div className="mx-auto mt-1 h-px w-8 bg-vial-accent-strong" />
            <div className="mt-1 font-display text-[10px] font-bold text-vial-ink">RT3</div>
            <div className="text-[6px] text-slate-500">≥99% HPLC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
