## Plan: Multi-pack pricing + "Text Us" WhatsApp section

### 1. Multi-pack pricing on products
- Extend `Product.variants` in `src/data/products.ts` so each peptide has 3 standard packs: **3-Pack**, **5-Pack**, **10-Pack** with ZAR pricing and `perMg` derived price + per-pack stock count.
- New shape per variant: `{ label, price, perMg?, stock?, pack: 3|5|10 }`.
- Apply to all in-stock injectable peptides (BPC-157, TB-500, CJC-1295/Ipamorelin, GHK-Cu, Retatrutide/RT3, Tirzepatide, Semaglutide, etc.). Bundles/guides stay single-SKU.

### 2. ProductCard — pack picker (matches screenshot)
- Update `src/components/ProductCard.tsx` to render a 3-column pack grid below the price showing **Pack name · price · R/mg · "X Avail"**.
- Selecting a pack updates the highlighted card and the Add-to-Cart action passes the chosen variant. Default selection = 5-Pack (best value).
- Keep COA/HPLC trust row and stock badge intact.

### 3. PDP variant section
- `ProductPage.tsx` already supports variants; surface the new `pack`, `perMg`, and per-variant `stock` (e.g. "Only 2 left in 3-Pack"). Minor styling tweak — no logic rewrite.

### 4. "Text Us" homepage section
- New `src/components/TextUsSection.tsx`: left side headline "Text us, our dedicated team is here to help" + sub-copy + teal "Text Us →" button (wa.me link). Right side: 2 chat bubbles ("Hey, can I get some help?" / "Hey, this is Lutho. How can I help you?") — pure CSS bubbles, no avatars.
- Insert into `HomePage.tsx` above the footer / after the support videos section.

### 5. Floating button — replace WhatsApp FAB
- Refactor `src/components/WhatsAppButton.tsx` → `TextUsFAB.tsx`: same wa.me deep link but pill-shaped with "Text us" label + chat icon, teal background, matching the section CTA. Keep position fixed bottom-right above safe-area inset.

### Technical notes
- WhatsApp number reused from existing `WhatsAppButton.tsx` constant (`491624747159`) — extract to `src/lib/contact.ts` so section + FAB share one source.
- No backend, no migrations, no new deps.

### Out of scope
- Real inventory sync per pack (stock counts are static demo numbers).
- Live chat widget / Twilio.
- Catalog expansion with brand-new SKUs.

### Files
**New:** `src/components/TextUsSection.tsx`, `src/components/TextUsFAB.tsx`, `src/lib/contact.ts`
**Edited:** `src/data/products.ts`, `src/components/ProductCard.tsx`, `src/pages/HomePage.tsx`, `src/App.tsx` (swap FAB), possibly `src/pages/ProductPage.tsx` for pack labels
**Deleted:** `src/components/WhatsAppButton.tsx` (replaced)