import { Helmet } from "react-helmet-async";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Emits JSON-LD structured data via Helmet so it is present in server-rendered
 * / prerendered HTML (crawlers read it without executing JS). Previously this
 * injected a <script> through document.head in a useEffect, which never ran
 * during build-time prerender — so Product/Offer schema was invisible to
 * Google. Rendering through Helmet fixes that and still works client-side.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <Helmet>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
