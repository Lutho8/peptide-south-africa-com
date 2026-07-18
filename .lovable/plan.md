## Goal

Lock in the white + light-teal "medical luxury" vial aesthetic everywhere a vial appears — shop cards, product detail page, 3D `FloatingVial` mock — via shared design tokens, and guard it with snapshot tests so a stray gradient can't regress the look.

## Scope

1. **Shared vial design tokens** (`src/index.css` + `tailwind.config.ts`)
   - Add semantic CSS variables under `:root`:
     - `--vial-surface` (white studio bg), `--vial-surface-tint` (very pale teal), `--vial-accent` (light teal ~ `174 40% 78%`), `--vial-accent-strong` (deeper teal for the box band/dot), `--vial-label-ink` (brand navy for label text), `--vial-cap` (silver/aluminum gradient stops), `--vial-glass` (clear-glass tint), `--vial-liquid` (teal-tinted meniscus).
     - `--vial-shadow` (soft directional studio shadow), `--vial-border` (hairline slate), `--vial-radius`.
     - `--gradient-vial-box`, `--gradient-vial-glass`, `--gradient-vial-liquid`, `--gradient-vial-cap`.
   - Expose in `tailwind.config.ts` as `colors.vial.*`, `boxShadow.vial`, `backgroundImage['vial-box' | 'vial-glass' | 'vial-liquid' | 'vial-cap']` so components consume tokens, not hex.
   - No changes to the site's navy/teal chrome tokens — vial tokens are additive.

2. **`FloatingVial` refresh** (`src/components/FloatingVial.tsx`)
   - Replace inline `linear-gradient(...)` / `rgba(...)` values with the new tokens.
   - Tighten the cap (silver crimp, subtle inner shadow), thin teal rule under the wordmark, deeper teal meniscus, softer studio shadow — matches the reference framing.
   - Keep the existing scroll-driven transform, reduced-motion guard, and desktop-only visibility.

3. **Product card vial framing** (`src/components/ProductCard.tsx`)
   - Wrap the `<img>` in a token-driven "studio plate": `bg-vial-surface`, subtle teal accent bar on the right edge of the image container, `shadow-vial`, hairline border.
   - Image itself is unchanged (already regenerated last turn) — the frame is what unifies cards whose renders vary slightly in framing.
   - No layout/spacing changes elsewhere on the card.

4. **Product detail page** (`src/pages/ProductPage.tsx` + `src/components/ProductImageZoom.tsx`)
   - Apply the same studio-plate treatment to the media gallery hero and thumbnails.
   - Restyle any vial-adjacent callouts (purity chip, COA chip, batch/lot line) to sit on the white/teal plate using vial tokens where they overlap the image, keeping typography and copy intact.
   - Zoom lens border + backdrop use `--vial-accent` instead of hard-coded colors.

5. **Snapshot / visual regression coverage** (`src/test/`)
   - Add `src/test/vial-branding.test.tsx`:
     - Renders `FloatingVial` (forcing `enabled=true` by stubbing `matchMedia`) → serializer snapshot of the DOM + inline styles. Asserts key token class/style fragments are present (`bg-vial-surface`, `shadow-vial`, `PEPTIDE SOUTH AFRICA` label, teal rule).
     - Renders `ProductCard` with a fixture product → snapshot of the image frame subtree, plus explicit `expect(...).toHaveClass('bg-vial-surface')` / `shadow-vial` assertions so a regression to raw hex fails loudly.
   - Uses the existing Vitest + Testing Library setup (`src/test/setup.ts`, `vitest.config.ts`) — no new deps.

## Out of scope

- No changes to product copy, pricing, SKUs, categories, cart, checkout, auth, or ERP.
- No re-generation of the 16 vial JPGs — last turn's renders stay; this pass unifies the *frame* around them and the 3D mock.
- No change to global navy/teal brand tokens or site chrome.

## Technical notes

- All new tokens live in `@layer base :root` in `src/index.css` (HSL triplets), mirrored into `tailwind.config.ts` under `theme.extend`. Components consume via Tailwind utilities (`bg-vial-surface`, `shadow-vial`, `bg-vial-box`) — no inline hex.
- `FloatingVial` keeps its pure-CSS 3D approach; only style values swap to `hsl(var(--vial-*))` / `var(--gradient-vial-*)`.
- Snapshot files land under `src/test/__snapshots__/` (Vitest default). Failing snapshots surface in the existing `bunx vitest run` pipeline.
