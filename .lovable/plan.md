## Goal

Add a research-cited educational blog to ridethetide.site, with one post per unique target keyword. Each post ranks for its keyword, ends with a CTA to the Peptide Protocol Tracker or [Cape Town Peptide Club](https://www.capetownpeptideclub.co.za/), and ships with a per-post FAQ section + JSON-LD for AI/search extraction.

## Keywords → posts (14 unique, 2 dupes in your list collapsed)

| # | Slug | Target keyword | Angle |
|---|---|---|---|
| 1 | `peptide-protocol-tracker` | peptide protocol tracker | Why you need one, what to log, free tool |
| 2 | `bpc-157-protocol-cape-town` | BPC-157 protocol Cape Town | Dosing, sourcing locally, GP oversight |
| 3 | `how-to-track-peptide-cycles` | how to track peptide cycles | Cycle structure, journaling template |
| 4 | `peptide-bloodwork-markers-sa` | peptide bloodwork markers SA | Which labs, SA pathology providers |
| 5 | `peptide-workshop-cape-town` | peptide workshop Cape Town | Club events, what to expect, sign up |
| 6 | `longevity-biohacker-cape-town` | longevity biohacker Cape Town | Local scene, stacks, community |
| 7 | `bpc-157-tb-500-stack-guide` | BPC-157 TB-500 stack guide | Synergy, dosing, recovery use-case |
| 8 | `cjc-1295-ipamorelin-protocol` | CJC-1295 ipamorelin protocol | GH axis, dosing, timing, cycle length |
| 9 | `peptide-community-south-africa` | peptide community South Africa | Club, forums, meetups |
| 10 | `research-peptides-cape-town` | research peptides Cape Town | Sourcing standards, lab testing, legality |
| 11 | `bpc-157-south-africa` | BPC-157 South Africa | Availability, legal status, suppliers |
| 12 | `buy-peptides-cape-town` | buy peptides Cape Town | Vetting suppliers, 99% purity, COAs |
| 13 | `peptide-tracker-app` | peptide tracker app | Comparison + own tracker pitch |
| 14 | `peptide-dosage-calculator` | peptide dosage calculator | Reconstitution math, mg → IU → units |

## Post structure (every post)

1. SEO `<title>` (<60ch) + meta description (<160ch) — keyword in both
2. Hero: H1 with exact keyword, 1-line summary, last-updated date, reading time
3. 800–1,200 words, semantic HTML (one H1, structured H2/H3)
4. 4–8 inline citations to peer-reviewed sources (PubMed, journals); footnote list at end
5. Honest tone — flag what's research-only, SA legal context, no medical claims
6. Per-post FAQ (3–5 Q&A) rendered via existing accordion pattern
7. Closing CTA card: choose **Tracker** (research/log posts) or **Cape Town Peptide Club** (community/workshop posts); some posts get both
8. JSON-LD: `BlogPosting` + `FAQPage` schema
9. Related posts (3 links) for internal linking

## Site changes

```text
/blog                          → BlogIndexPage  (grid of post cards)
/blog/:slug                    → BlogPostPage   (MDX-style content from data)
```

- **Header nav**: add "Blog" link between Research and Shop
- **Footer**: add Blog column with top 5 posts
- **Sitemap**: extend `scripts/generate-sitemap.ts` + `public/sitemap.xml` with all 14 URLs
- **`public/llms.txt`**: list blog posts so AI crawlers index them
- **Homepage**: small "From the Blog" rail (3 latest) above footer

## Technical structure

```text
src/data/blog/
  index.ts                     ← exports posts array
  posts/
    peptide-protocol-tracker.ts
    bpc-157-protocol-cape-town.ts
    …14 files
src/pages/
  BlogIndexPage.tsx
  BlogPostPage.tsx
src/components/blog/
  BlogCard.tsx
  BlogFAQ.tsx                  ← wraps shadcn Accordion
  BlogCTA.tsx                  ← Tracker | Club variant
  BlogPostLayout.tsx
```

Each post file:
```ts
export const post: BlogPost = {
  slug, title, metaTitle, metaDescription, keyword,
  publishedAt, updatedAt, readingMinutes,
  hero: { eyebrow, summary },
  body: [ { type: "p" | "h2" | "h3" | "ul" | "callout" | "quote", … } ],
  citations: [ { id, label, url } ],
  faqs: [ { q, a } ],
  cta: "tracker" | "club" | "both",
  related: [slug, slug, slug],
};
```

Body rendered through a small `<BlogBody>` switch — no MDX runtime dependency, keeps bundle lean and avoids new packages.

## Content generation

Drafts written by me using public peer-reviewed sources (PubMed IDs, journal DOIs) — every citation will resolve to a real paper. Cape Town / SA specifics grounded in: SAHPRA scheduling, partner pharmacy model already in memory, and the Club URL above. No fabricated stats; where evidence is thin I'll say so explicitly.

## Out of scope (ask before adding)

- CMS / admin authoring UI (posts ship as code, easy to edit, version-controlled)
- Comments, likes, email-subscribe on blog (newsletter popup already exists site-wide)
- Translations
- Author photos beyond a single "RideTheTide Editorial" byline unless you give me a real author

## Two quick confirmations

1. Hero image per post — OK to auto-generate clean abstract/molecular visuals (fast tier) for each of the 14 posts, or use a single shared header image to save credits?
2. CTA target for "tracker" — link to existing `/research` (Peptide Protocol Pro embed) or to a different tracker URL you'll provide?
