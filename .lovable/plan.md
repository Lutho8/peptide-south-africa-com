# Plan: Hero restructure, nav cleanup, Whoosh-style sections & Affiliate program

## 1. Header / Nav cleanup (`src/components/Header.tsx`)
- Remove `Research`, `Blog`, `FAQ` from desktop & mobile nav.
- Keep: Home, Shop, Tracker, Club, Get Started, plus new **Affiliate** link.
- Mirror Whoosh top-nav structure with category dropdowns: **Weight Loss ▾**, **Wellness & Longevity ▾**, **Recovery ▾**, **About**, **Explore ▾** (Explore contains the moved Research/Blog/FAQ + Quiz + Fat-Loss Protocol).
- Dropdowns are simple hover/click menus (Radix/shadcn `NavigationMenu` already available via shadcn).

## 2. Footer (`src/components/Footer.tsx`)
- Add a "Learn" column linking to Research, Blog, FAQ, Tracker, Club, Affiliate.
- Keep existing legal/shipping/contact columns intact.

## 3. Hero restructure (`src/components/HeroShop.tsx`)
Replace the current 7/5 split layout (copy left, single product right) with a **Whoosh-style two-column product layout under a single headline**:
- Keep the video background, offer ribbon, headline ("Premium peptides. Shipped in 48 hours."), subhead, trust bullets.
- Below the headline row, render **two equal product cards side-by-side** (stack on mobile):
  - Card A (left): **RT3 (Reta)** — Best Seller — Weight Loss tag
  - Card B (right): **BPC-157** (or next best product from `data/products`) — Recovery tag
- Each card: small category chips, product name, one-line description, "Learn More" + "Buy Now" CTAs, vial image on the right (matches Whoosh).
- Below cards: centered "View all peptides →" link.
- Below that: 3 category banner tiles (full-bleed row) — **Weight Loss · Wellness & Longevity · Recovery** → link to filtered `/shop?category=…`.

## 4. New Whoosh-mirrored category sections on Home (`src/pages/HomePage.tsx`)
Add three new section components after existing hero/support videos:
- `<CategoryShowcase category="weight-loss" />` — headline, copy, 2–3 product cards (Tirzepatide/Reta/Semaglutide analogues), CTA "Explore Weight Loss".
- `<CategoryShowcase category="longevity" />` — NAD+, CJC-1295/Ipamorelin, Epitalon.
- `<CategoryShowcase category="recovery" />` — BPC-157, TB-500, BPC+TB stack.

One reusable `src/components/CategoryShowcase.tsx` driven by props (title, blurb, productIds, accent image/video).

## 5. Affiliate Program (new page) — better than blankpeptides.com/affiliate
New route `/affiliate` → `src/pages/AffiliatePage.tsx`. Sections:
1. **Hero** — "Earn with Ride The Tide" + "Apply in 60 seconds" CTA.
2. **Commission tiers** (better than blank's flat 15%):
   - Starter: **20%** on first €1,000 / R20k volume
   - Pro: **25%** + recurring on repeat orders
   - Elite (1k+ followers / clinic / coach): **30%** + custom code + co-marketing
3. **What you get** grid: real-time dashboard, 60-day cookie (vs blank's 30), monthly payouts (PayPal / EFT / USDT), free product for content, swipe-file of creatives, dedicated affiliate manager on WhatsApp.
4. **How it works** — 4 steps (Apply → Get approved → Share link → Get paid).
5. **Who it's for** — coaches, GPs, biohackers, gym owners, content creators.
6. **Earnings calculator** — slider: avg referrals/month × AOV → estimated monthly $.
7. **Leaderboard preview** (top 5 anonymized).
8. **FAQ** — payouts, tax, attribution, banned tactics.
9. **Apply form** — name, email, channel (IG/YT/clinic/blog), audience size, link, message → posts to a new `affiliate_applications` table with RLS (insert-only for anyone, select for admins).
10. **Terms summary** + link to full T&Cs.

Add link in Header (top-level), Footer (Learn column), and Home page bottom banner.

## 6. Backend (Lovable Cloud) for affiliate applications
Migration creating `public.affiliate_applications`:
- columns: id, created_at, name, email, channel, audience_size, link, message, status (pending/approved/rejected)
- GRANT INSERT to `anon` + `authenticated`; SELECT/UPDATE to admin role only.
- Enable RLS; policies: anyone can INSERT; only admins (`has_role`) can SELECT/UPDATE.

## 7. Out of scope
- Building a full affiliate dashboard / link generator / payout engine (would require auth + tracking infra). The page captures applications and explains the program; live tracking can come later.
- Changes to ridethetide.info — separate site.
- Re-hosting Whoosh videos.

## Technical summary
- Files created: `src/components/CategoryShowcase.tsx`, `src/pages/AffiliatePage.tsx`, `supabase/migrations/<ts>_affiliate_applications.sql`.
- Files edited: `Header.tsx`, `Footer.tsx`, `HeroShop.tsx`, `HomePage.tsx`, `App.tsx` (route).
- No business-logic changes to cart / products / pricing.
