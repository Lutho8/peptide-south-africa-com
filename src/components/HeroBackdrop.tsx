/**
 * Cinematic light-mode hero backdrop.
 * Layered animated gradients + drifting molecule grid + soft orbs.
 * No video needed — pure CSS so it ships fast and never fails to load.
 * Respects prefers-reduced-motion.
 */
export default function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* base soft gradient (light) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #eef5ff 50%, #f4f9ff 100%)",
        }}
      />

      {/* drifting conic + radial color washes */}
      <div
        className="absolute inset-0 motion-safe:animate-[backdrop-drift_28s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(50% 40% at 18% 20%, hsl(217 91% 60% / 0.18), transparent 60%), radial-gradient(45% 35% at 82% 30%, hsl(195 85% 48% / 0.22), transparent 60%), radial-gradient(60% 45% at 50% 95%, hsl(217 91% 60% / 0.14), transparent 65%)",
          filter: "saturate(1.1)",
        }}
      />

      {/* soft floating orbs */}
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full opacity-60 blur-3xl motion-safe:animate-[orb-float_18s_ease-in-out_infinite]"
        style={{ background: "hsl(195 85% 70% / 0.55)" }}
      />
      <div
        className="absolute right-[-6rem] top-1/3 h-96 w-96 rounded-full opacity-50 blur-3xl motion-safe:animate-[orb-float-2_22s_ease-in-out_infinite]"
        style={{ background: "hsl(217 91% 70% / 0.45)" }}
      />

      {/* molecule grid (animated SVG) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07] motion-safe:animate-[molecule-pan_40s_linear_infinite]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hex" width="56" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M28 2 L52 16 L52 48 L28 62 L4 48 L4 16 Z"
              fill="none"
              stroke="hsl(217 91% 30%)"
              strokeWidth="1"
            />
            <circle cx="28" cy="32" r="1.5" fill="hsl(217 91% 30%)" />
          </pattern>
        </defs>
        <rect width="200%" height="200%" fill="url(#hex)" />
      </svg>

      {/* subtle scanline shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-40 opacity-50 motion-safe:animate-[shimmer-sweep_9s_linear_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.55), transparent)",
        }}
      />

      {/* bottom fade into page */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(180deg, transparent, hsl(var(--background)))",
        }}
      />
    </div>
  );
}
