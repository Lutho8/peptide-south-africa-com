
# Simplify Cart & Checkout — Keeps-Inspired

Goal: strip visual/textual clutter; keep only what drives conversion. Match the calm, whitespace-heavy, single-column feel of keeps.com/express while preserving our navy/teal medical-luxury tokens and ZAR + PayFast flow.

## Principles (borrowed from Keeps)
- One column, generous whitespace, one primary CTA per screen.
- No bilingual EN/DE labels, no countdown timers, no marketing chrome inside the cart.
- Discounts shown as a single "Special Offer −Rxx" line, not a promo card.
- Subtotal only; "Shipping & taxes calculated at checkout".
- One "We also recommend" upsell — a single tile with a "+" add button, not a full FBT grid.
- Checkout: contact + address in one card, payment trust as a small line, one big Pay button.

## Cart Drawer (`src/components/CartDrawer.tsx`)
Keep: line items with vial tile (unchanged tokens), qty stepper, remove, subtotal, checkout CTA.

Remove:
- `CartCountdown` banner
- Bilingual EN/DE labels — English only
- Free-shipping progress bar block + "Customers also add" nudge line
- "Sign in to auto-apply PEPTIDESA10" upsell card
- Discount line duplication — collapse into single "Special Offer −Rxx"
- "Cart → Shipping → Pay" micro-stepper text
- `FrequentlyBoughtTogether` full grid
- Separate "View Cart" secondary button

Add / replace:
- Header: "My Cart" centered, close (X) top right (like Keeps).
- Single "Special Offer" red line when any discount/bundle savings apply (sum of bundleSavings + discountAmount).
- Subtotal + one line: "Shipping & taxes calculated at checkout".
- Single black "CHECKOUT" CTA (still using our `bg-hero-gradient` token — no hardcoded colors).
- One compact "We also recommend" tile below CTA: pick top FBT suggestion, image + name + price + circular "+" add. Reuses `FrequentlyBoughtTogether` data source but new compact single-item render (`variant="single"`), or inline map of first suggestion.

## Cart Page (`src/pages/CartPage.tsx`)
Same treatment as drawer:
- Remove `CartCountdown`, `FreeShippingBar`, bilingual copy, PEPTIDESA10 upsell card, secure-checkout tagline duplication, mobile sticky bar (drawer + main CTA already suffice).
- Summary shows: Subtotal, Special Offer (if any), "Shipping & taxes calculated at checkout", Total omitted until checkout (Keeps pattern) OR keep Total but drop shipping/tax rows.
- Keep one "We also recommend" tile below summary.

## Checkout Page (`src/pages/CheckoutPage.tsx`)
Consolidate the six card stack into a tight, single-column form:

Remove:
- `CheckoutStepper` header
- `CartCountdown` compact timer
- Standalone "Shipping" info card (rule + method text)
- `FreeShippingBar`
- `DeliveryReturnsAccordion` (move to footer link only)
- Discount Code card (auto-applied is invisible; show as inline "Special Offer" row in summary)
- Payment card's long paragraph + method chip list + PayFast blurb
- `CheckoutTrustBar`, `SecurityChecklist`, `PaymentMethodsBanner` (keep a single small "🔒 Secure checkout · PayFast · ZAR" line under the CTA)
- Bilingual COPY strings — English only

Keep / restructure into 2 cards:
1. **Contact** — email only first (Keeps pattern), then first/last name.
2. **Shipping address** — address, city, province, postal code (country locked ZA, rendered as small caption not an input).

Order summary (right column on desktop, collapsible on mobile above CTA):
- Line items with vial tile, qty, unit total.
- Special Offer −Rxx (single row combining bundleSavings + discountAmount).
- Subtotal, Shipping (Free if unlocked else R89), Total.
- Keep `CheckoutSuppliesRail` (it's already the "we recommend" pattern) — but tighten copy: "Add reconstitution supplies" only, remove "Inline add" chip.

CTA:
- Single full-width "Pay Rxx" button (existing gradient token).
- Below: one line "🔒 SSL · PayFast · ZAR" — no trust grid, no accordion.

## Trust/compliance elsewhere
Not removed from product/home pages — only stripped from cart+checkout surfaces where they hurt conversion. The medical-luxury trust architecture stays on PDP and homepage sections.

## Files touched
- `src/components/CartDrawer.tsx` — rewrite body per above.
- `src/pages/CartPage.tsx` — rewrite summary + remove sticky bar + bilingual.
- `src/pages/CheckoutPage.tsx` — collapse to 2 form cards + summary + single CTA; drop trust/timer/stepper/accordion imports.
- `src/components/FrequentlyBoughtTogether.tsx` — add `variant="single"` render mode (image + name + price + "+" button), used inside cart drawer/page.
- No changes to `vialDesign.ts` tokens, PayFast function, schema, or data.

## Guardrails
- All vial tiles keep `VIAL_TEST_ID` + `vialTileFrameClasses` (vial-tokens-guard test stays green).
- No hardcoded colors introduced — reuse existing semantic tokens (`bg-hero-gradient`, `text-trust`, `text-destructive` for "Special Offer" red).
- Brand Guard: no new copy referencing removed brand terms.
- Existing Vitest suites (`checkout-supplies-rail`, `vial-branding`, `vial-tokens-guard`) continue to pass; adjust `CartPage`/`CartDrawer` selectors only if tests reference removed nodes (none currently do per repo search).

## Out of scope
- ERP/inventory/SMS retention work (tracked in earlier multi-phase plan).
- Payment provider changes.
- Redesigning PDP or homepage.
