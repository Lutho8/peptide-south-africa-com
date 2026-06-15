## Scope (this round)

Quick-wins + premium UX upgrade. ERP/SMS/ads/SOPs/inventory backend is **deferred** to a phased plan after this lands.

---

## 1. Fix Google login (400 "provider is not enabled")

- Enable Lovable Cloud **managed Google OAuth** (`configure_social_auth providers=["google"]`, keep email enabled).
- Migrate `src/pages/AuthPage.tsx` from `supabase.auth.signInWithOAuth("google", …)` to `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
- Add "Continue with Google" button on both sign-in and sign-up tabs; handle `result.error` / `result.redirected` correctly.

## 2. Rebrand vials & box renders (AI-generated)

- Generate fresh **navy + teal Peptide South Africa label** vial+box renders via `imagegen` (premium tier for label legibility) for: BPC-157, TB-500, Retatrutide, Tirzepatide, Semaglutide, CJC-1295/Ipamorelin, GHK-Cu, NAD+, Selank, Sermorelin, MOTS-c, Epitalon.
- One shared label template (logo top, peptide name in display font, monospace LOT/PURITY/STORE strip at bottom, "Research use only — South Africa").
- Save each to `src/assets/vials/<slug>.png.asset.json` via `lovable-assets`. Update `src/data/products.ts` image fields.
- Replace `src/components/FloatingVial.tsx` source image with new icon-only render.

## 3. Mobile-first polish

- Header: ensure icon-only logo + condensed cart/menu under `md`, larger 44px tap targets.
- Product grid: 2-up on mobile, sticky add-to-cart bar inside PDP.
- Cart drawer: full-height sheet on mobile, larger qty steppers.
- Hero typography clamp; collapse decorative sections on `sm` to reduce TTI.
- Audit `src/components/StickyMobileCTA.tsx` for safe-area inset + bottom-nav overlap.
- Run Lighthouse-style pass: lazy-load non-critical images, `loading="lazy"` everywhere, defer `FloatingTrustBadge` mount until idle.

## 4. Legal copy — new business name

Update all references to "Ride The Tide" → **Peptide South Africa (Pty) Ltd** in:
- `src/pages/PrivacyPolicyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/pages/RefundPolicyPage.tsx`
- `src/pages/ShippingPolicyPage.tsx`
- `src/pages/ImpressumPage.tsx`
- Footer legal line, cookie consent text, age-verification modal.
- Replace contact email/domain references with `legal@peptide-south-africa.com`, `support@peptide-south-africa.com`.
- POPIA controller block updated to new entity.

## 5. Premium UX upgrade (DirectPeptides-benchmarked, trust architecture)

- **PDP refresh**: lab-report card above the fold (HPLC %, mass-spec match, batch, COA download), "Tested by Janoshik / Auriga" badges row, monospace facts strip already in place — extend to include manufacture date, sterility, endotoxin <0.5 EU/mg.
- **Cart drawer redesign**: 3 panels — line items, "Frequently bought together" rail, "Order summary" with free-shipping progress.
- **Frequently Bought Together** (PDP + cart drawer):
  - New component `src/components/FrequentlyBoughtTogether.tsx`.
  - Hard-coded curated pairs in `src/data/bundles.ts` (e.g. BPC-157 ↔ TB-500, Retatrutide ↔ B12, any peptide ↔ Bac Water + Syringe Kit).
  - One-click "Add 3 to cart" with bundle discount line.
- **Post-add upsell modal**: `src/components/PostAddUpsellModal.tsx` fires after `addToCart`, shows bacteriostatic water, insulin syringes, sharps bin, alcohol swabs as one-tap adds; dismissible, max once per session.
- **Premium signals throughout**: replace "discount" framing with "member pricing", add "Compounded under GP oversight" badge, "Cold-chain shipped from Johannesburg" line in cart, payment-method strip (PayFast, EFT, Card) in checkout.

## 6. Memory updates

- Add `mem://features/cart-upsell` — FBT rules, post-add modal rules.
- Add `mem://legal/entity` — "Peptide South Africa (Pty) Ltd" canonical name.
- Update `mem://brand/identity` with new vial asset paths.

---

## Out of scope (next phased plan)

ERP backend, fulfilment workflows, customer DB beyond auth, SMS/email automation engine, ad-account integrations, payment-processing workarounds, SOPs, inventory system, retention machine. I'll write a dedicated multi-phase plan for these once this round ships — they're a multi-week build involving new tables (inventory, shipments, SMS queue, automation rules), edge functions (SMS sender via connector, email drip, reorder reminders), and admin dashboards.

## Files

**Edit**: `src/pages/AuthPage.tsx`, `src/pages/{Privacy,Terms,Refund,Shipping,Impressum}Page.tsx`, `src/pages/ProductPage.tsx`, `src/components/{Header,CartDrawer,FloatingVial,StickyMobileCTA,Footer,AgeVerificationModal,CookieConsent}.tsx`, `src/data/products.ts`.
**Create**: `src/components/FrequentlyBoughtTogether.tsx`, `src/components/PostAddUpsellModal.tsx`, `src/data/bundles.ts`, `src/assets/vials/*.png.asset.json` (~12 files), memory files.
**Tools**: `supabase--configure_social_auth`, `imagegen--generate_image` (×12, premium tier).
