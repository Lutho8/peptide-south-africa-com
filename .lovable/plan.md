# Plan: South Africa Geo Tags + Product Schema

## 1. `index.html` head additions
Add three meta tags alongside existing meta:
```html
<meta name="geo.region" content="ZA" />
<meta name="geo.placename" content="South Africa" />
<meta property="og:locale" content="en_ZA" />
```

## 2. Product JSON-LD on product pages
Locate the product detail page component (e.g. `src/pages/ProductPage.tsx` or similar) and inject a `<Helmet>` JSON-LD script with:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<product name>",
  "image": "<product image>",
  "description": "<product description>",
  "sku": "<sku>",
  "brand": { "@type": "Brand", "name": "Peptide South Africa" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "ZAR",
    "price": "<price>",
    "availability": "https://schema.org/InStock",
    "areaServed": "ZA",
    "url": "https://peptide-south-africa.com/products/<slug>"
  }
}
```

Implementation:
- Find product page route(s) and the product data shape.
- Add a small helper or inline JSON-LD via `react-helmet-async`.
- Use real product fields (name, image, price, slug). Fallback to InStock unless an explicit stock flag exists.

## 3. Verify
- Confirm `index.html` parses (no duplicated tags).
- Confirm product page renders schema in DOM.

No other files or behavior change.