## 1. Checkout copy and CTA labels

`src/pages/CheckoutPage.tsx`

- Heading: "Checkout" → "Almost there" with a one-line subhead "Two quick steps and your order ships from Cape Town."
- Section headings become next-step language: "Contact" → "1. Where should we send your confirmation?", "Shipping address" → "2. Where should we deliver?"
- One primary button only per viewport (desktop inline, mobile sticky — never both visible). Label: `Place order · R X,XXX`, busy state `Taking you to payment…`.
- Trust line under the CTA condensed to a single line: "Secure payment · PayFast · ZAR".
- Error toast copy: "Almost — check the highlighted fields."

## 2. Sticky mobile Order Summary bar

New `src/components/MobileOrderSummaryBar.tsx`, used on the checkout page (mobile only):

- Single collapsed line pinned above the sticky pay button: `Total R X,XXX` on the right, `Subtotal · Discount` condensed on the left, plus a chevron.
- Tapping expands a small sheet showing Subtotal, Special Offer, Shipping, Total.
- Stays visible while scrolling; safe-area padding respected; hidden at `lg` where the sidebar summary already shows.

## 3. Trim the checkout form

Keep only: email, first name, last name, address, city, province, postal code. Remove any non-essential inputs and inline helper paragraphs that add height (e.g. the delivery blurb moves into the province row as small text). Fields collapse into a single card so the page is one short column on mobile instead of two stacked cards.

## 4. Express checkout (PayFast fast lane)

- New `src/components/ExpressCheckoutButton.tsx`: a dark, full-width "Express checkout" button with a small wallet/lock glyph row and the caption "Apple Pay, Capitec Pay, instant EFT & card on the next screen".
- Behaviour: if the shopper is signed in and has a saved profile with name/email/address, it creates the order and posts straight to PayFast — skipping the form entirely. If details are missing or they are signed out, it routes to `/auth` (or `/checkout` with fields focused) instead of failing.
- Placement: top of the cart drawer above the standard CHECKOUT button, and top of the checkout page above the form, with a "or enter details manually" divider.
- The order-creation + PayFast invoke logic currently inline in `CheckoutPage` gets extracted into a shared `src/lib/startPayfastCheckout.ts` so the drawer and page use the same path. No changes to the edge function.

## 5. Homepage EcosystemSection

`src/components/EcosystemSection.tsx` already carries the "One Ecosystem. Three Properties." heading and the three cards (Cape Town Peptide Club, the highlighted Peptides4Pets card with the PSA PETS eyebrow and pet-waitlist link, Peptide South Africa). I will verify the copy matches your text exactly and correct any drift; no structural change expected.

## Technical notes

- No new dependencies, no processor change: express checkout is a fast lane into the existing PayFast hosted page, which surfaces Apple Pay and other wallets itself.
- Vial thumbnails in the summary keep using the `vialDesign.ts` tokens so the token guard test keeps passing.
- Existing `data-testid` hooks (`pay-now-button`, `checkout-total`, `checkout-shipping`) are preserved for the Playwright and vitest suites.
