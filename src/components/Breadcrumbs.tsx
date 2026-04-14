import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import JsonLd from "./JsonLd";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://tide-shop-clone.lovable.app${c.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="container px-4 pt-4 pb-2">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {c.href && i < crumbs.length - 1 ? (
                <Link to={c.href} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
