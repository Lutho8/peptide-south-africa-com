# Vial Design Tokens — Contributor Guide

**Every vial-branded surface on the site (product cards, PDP media gallery, cart tiles, checkout summary thumbnails, the 3D FloatingVial mock) MUST source its styling from `src/lib/vialDesign.ts`.** This keeps the white + light-teal "medical luxury" packaging visually identical across the whole app and makes the design centrally themeable.

## The rule

Do **not** inline any of these class literals in your component:

- `bg-vial-*`
- `shadow-vial`
- `ring-vial-*`
- `border-vial-*`
- `text-vial-*`

Do **not** hardcode the test id string. Import `VIAL_TEST_ID` and stamp `data-testid={VIAL_TEST_ID}` on the frame element.

## Which token do I use?

| Surface | Import |
| --- | --- |
| Product card thumbnail | `vialFrame("md")` — returns `{ frame, bar, dot }` |
| PDP media gallery / zoom | `vialFrame("lg")` — or the raw `vialZoomFrameClasses`, `vialAccentBarLgClasses`, `vialAccentDotLgClasses`, `vialZoomChipClasses` |
| Cart drawer tile · Cart page tile · Checkout summary thumbnail | `vialFrame("sm")` — or the raw `vialTileFrameClasses`, `vialAccentBarSmClasses` |
| 3D FloatingVial mock (internal glass/cap markup) | Raw `bg-vial-*` classes are allowed **inside FloatingVial only** — every other consumer must go through the token module. |

Minimal example for a new checkout-style tile:

```tsx
import { VIAL_TEST_ID, vialFrame } from "@/lib/vialDesign";

export function SupplyTile({ product }: { product: Product }) {
  const { frame, bar } = vialFrame("sm");
  return (
    <span className={`${frame} block h-12 w-12`} data-testid={VIAL_TEST_ID}>
      <span aria-hidden className={bar} />
      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
    </span>
  );
}
```

## Guards that will fail your build

- `src/test/vial-tokens-guard.test.ts` — Vitest static-analysis guard. Fails the build if any of the tracked components inline raw `bg-vial-*` / `shadow-vial` / `ring-vial-*` / `border-vial-*` / `text-vial-*` classes, or use `data-testid="vial-frame"` as a string literal instead of the `VIAL_TEST_ID` constant.
- `tests/vial-visual.spec.ts` — Playwright visual regression. Snapshots the PDP gallery frame, cart drawer tile, cart page tile, and checkout summary tile. Any pixel drift outside the token system fails CI.

Regenerate snapshots deliberately after an intentional design change:

```bash
bunx playwright test tests/vial-visual.spec.ts --update-snapshots
```

## Adding a new vial-branded consumer

1. Import from `@/lib/vialDesign` — never redeclare classes.
2. Stamp `data-testid={VIAL_TEST_ID}` on the frame element.
3. Register the file path in `TARGETS` (and, if it's a flat consumer, `FLAT_TARGETS`) inside `src/test/vial-tokens-guard.test.ts`.
4. Add a Playwright locator + snapshot to `tests/vial-visual.spec.ts` if the surface is user-visible.

## Source of truth

`src/lib/vialDesign.ts` is the only place raw vial class strings live. Colour, shadow, and border values themselves are semantic CSS variables in `src/index.css` under `--vial-*` and wired through `tailwind.config.ts`.
