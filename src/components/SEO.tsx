import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.ridethetide.site";
const SITE_NAME = "Ride The Tide";
const DEFAULT_OG = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8baac3f7-3ee8-4976-8c38-ac9d73046bbc/id-preview-8fd492ca--444b5a36-70e0-4613-a86e-bcb50367db3d.lovable.app-1774135344354.png";
const DEFAULT_KEYWORDS =
  "peptides South Africa, peptides Cape Town, buy peptides online, research peptides, retatrutide, tirzepatide, BPC-157, GHK-Cu, tesamorelin, fat loss peptides, healing peptides, GLP-1 peptides";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  keywords?: string;
  lang?: "en";
  alternates?: { hrefLang: string; href: string }[];
}

export default function SEO({
  title,
  description,
  path = "",
  image = DEFAULT_OG,
  type = "website",
  noindex = false,
  jsonLd,
  keywords = DEFAULT_KEYWORDS,
  lang = "en",
  alternates,
}: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const altTags = alternates ?? [
    { hrefLang: "en-ZA", href: url },
    { hrefLang: "en", href: url },
    { hrefLang: "x-default", href: url },
  ];

  return (
    <Helmet>
      <html lang={lang} />

      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="distribution" content="global" />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />}

      {altTags.map((a) => (
        <link key={a.hrefLang} rel="alternate" hrefLang={a.hrefLang} href={a.href} />
      ))}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_ZA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Geo — Cape Town */}
      <meta name="geo.region" content="ZA-WC" />
      <meta name="geo.placename" content="Cape Town, South Africa" />
      <meta name="geo.position" content="-33.9249;18.4241" />
      <meta name="ICBM" content="-33.9249, 18.4241" />

      {ldArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
