# Market-aware cart flow + mobile sticky ATC bar

## 1. Market-aware product/cart navigation

**`src/components/ProductCard.tsx`**
- Replace `<Link to={\`/product/${slug}\`}>` and `navigate(\`/product/${slug}\`)` calls with `marketPath(...)` (already partially done for the main card link — extend to the "Select Size" navigate that targets `#variants`, the "View" link, the out-of-stock navigate, and the image link).

**`src/components/FeaturedProductRail.tsx`**
- Import `useMarket` + `marketPath`. Rewrite the two `<Link to={\`/product/${p.slug}\`}>` and the "View all" `/shop` link to use `marketPath`.

**`src/pages/ProductPage.tsx`**
- "Back to Shop" link and any related-product navigation use `marketPath(..., market)`.
- Related `<ProductCard>` already inherits market via `useMarket`, no extra change.

**`src/components/CartDrawer.tsx`**
- "Continue Shopping" button and the cart/checkout CTAs (see file lines 60-108) need `marketPath` for `/cart` and `/checkout`.

**`src/components/Header.tsx` + `src/components/Footer.tsx`**
- Audit remaining hard-coded `/cart`, `/shop`, `/product/...` and rewrite via `marketPath`.

## 2. Dedicated market routes for cart + checkout

**`src/App.tsx`** — add:
```tsx
<Route path="/de/cart" element={<CartPage />} />
<Route path="/za/cart" element={<CartPage />} />
<Route path="/de/checkout" element={<CheckoutPage />} />
<Route path="/za/checkout" element={<CheckoutPage />} />
<Route path="/de/checkout/success" element={<CheckoutSuccessPage />} />
<Route path="/za/checkout/success" element={<CheckoutSuccessPage />} />
<Route path="/de/checkout/cancel" element={<CheckoutCancelPage />} />
<Route path="/za/checkout/cancel" element={<CheckoutCancelPage />} />
```

**`src/pages/CartPage.tsx` + `CheckoutPage.tsx`**
- Use `useMarket()` to:
  - Set `<SEO>` `lang` + alternates via `buildAlternates('/cart')` / `'/checkout'`.
  - All internal `navigate()` / `<Link>` to `/cart`, `/checkout`, `/checkout/success`, `/checkout/cancel`, `/shop` go through `marketPath`.
- `CheckoutPage` country default: prefer market over currency — `market === 'de' ? 'Germany' : market === 'za' ? 'South Africa' : (currency==='ZAR'?'South Africa':'Germany')`.
- Pass `market` (or current pathname prefix) into the Stripe/NowPayments `success_url` / `cancel_url` so the user returns to the same market subpath.

**`CurrencyContext.tsx`** — already syncs currency from market; no change.

## 3. Mobile sticky add-to-cart bar on ProductPage

New component **`src/components/StickyProductCTA.tsx`**:
- Props: `product`, `variantLabel`, `price`, `inStock`, `onAdd`.
- Fixed bottom bar, `md:hidden`, shown after scrolling past the primary in-page ATC button (use IntersectionObserver on a ref passed in, or simple `window.scrollY > 500`).
- Layout: small product thumbnail + name (truncated) + selected variant label + price on the left; high-contrast primary CTA "Add to cart" / "Select size" / "Notify me" on the right using `bg-hero-gradient text-primary-foreground shadow-glow`.
- Safe-area inset padding (`pb-[env(safe-area-inset-bottom)]`).
- Respect existing `StickyMobileCTA` which currently only shows on `/`, so they won't overlap; add a guard so it's hidden on `/cart`, `/checkout`.

**`src/pages/ProductPage.tsx`**
- Render `<StickyProductCTA>` with current `selectedVariant` price/label, hooked into the existing `handleAdd`.

## 4. Sitemap

**`scripts/generate-sitemap.ts`** — add `/cart` and `/checkout` to the noindex/excluded list (they're transactional; don't expose hreflang siblings). No public sitemap change needed.

## Out of scope
- Translating CartPage / CheckoutPage body copy to German.
- Persisting market into the cart payload beyond the URL.
- Server-side geo redirect.
