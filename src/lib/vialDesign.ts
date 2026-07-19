/**
 * Shared vial-branding tokens.
 *
 * Every vial-adjacent surface (product cards, PDP gallery, 3D mock,
 * cart line items, checkout summary) imports its class strings from
 * here so the white + light-teal "medical luxury" studio look stays
 * identical across the site. All values resolve to the CSS variables
 * defined in `src/index.css` under `--vial-*` — this module never
 * introduces raw hex colours.
 */

export const VIAL_TEST_ID = "vial-frame" as const;

/** Base studio plate — white surface, hairline border, soft shadow. */
const FRAME_BASE =
  "relative overflow-hidden bg-vial-surface shadow-vial";

/** Card variant (used on ProductCard). Border via `ring` matches current markup. */
export const vialCardFrameClasses =
  `${FRAME_BASE} aspect-square rounded-t-lg ring-1 ring-vial-border`;

/** Zoom variant (used on PDP media gallery). Border via `border`. */
export const vialZoomFrameClasses =
  `group ${FRAME_BASE} rounded-xl border border-vial-border`;

/** Compact tile variant (used in cart drawer / cart page / checkout summary). */
export const vialTileFrameClasses =
  `${FRAME_BASE} rounded-md ring-1 ring-vial-border`;

/** Teal accent band running down the right edge of the studio plate. */
export const vialAccentBarClasses =
  "pointer-events-none absolute inset-y-0 right-0 w-2 bg-vial-accent";

/** Thicker accent bar used on the larger PDP zoom frame. */
export const vialAccentBarLgClasses =
  "pointer-events-none absolute inset-y-0 right-0 w-2.5 bg-vial-accent";

/** Slim accent bar for small tiles. */
export const vialAccentBarSmClasses =
  "pointer-events-none absolute inset-y-0 right-0 w-1 bg-vial-accent";

/** Small teal dot echoing the physical box marker. */
export const vialAccentDotClasses =
  "pointer-events-none absolute right-1 top-3 h-1.5 w-1.5 rounded-full bg-vial-accent-strong";

/** Larger dot used on the PDP zoom frame. */
export const vialAccentDotLgClasses =
  "pointer-events-none absolute right-1.5 top-4 h-2 w-2 rounded-full bg-vial-accent-strong";

/** "Hover to zoom" / "Tap to zoom" pill on the PDP frame. */
export const vialZoomChipClasses =
  "absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-vial-surface/90 px-3 py-1.5 text-xs font-medium text-vial-ink backdrop-blur-sm";

/** White label plate inside the 3D FloatingVial mock. */
export const vialLabelPlateClasses =
  "absolute left-1/2 top-1/2 w-20 -translate-x-1/2 -translate-y-1/2 rounded bg-vial-surface px-1 py-2 text-center shadow-sm";

export type VialFrameSize = "sm" | "md" | "lg";

/**
 * Pick a frame + accent bar + dot bundle by size. Callers stamp
 * `data-testid={VIAL_TEST_ID}` on the returned frame element.
 */
export function vialFrame(size: VialFrameSize = "md"): {
  frame: string;
  bar: string;
  dot: string;
} {
  switch (size) {
    case "sm":
      return {
        frame: vialTileFrameClasses,
        bar: vialAccentBarSmClasses,
        dot: vialAccentDotClasses,
      };
    case "lg":
      return {
        frame: vialZoomFrameClasses,
        bar: vialAccentBarLgClasses,
        dot: vialAccentDotLgClasses,
      };
    case "md":
    default:
      return {
        frame: vialCardFrameClasses,
        bar: vialAccentBarClasses,
        dot: vialAccentDotClasses,
      };
  }
}
