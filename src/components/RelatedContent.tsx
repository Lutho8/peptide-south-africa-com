import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface RelatedLink {
  label: string;
  href: string;
  description: string;
}

interface RelatedContentProps {
  title?: string;
  links: RelatedLink[];
}

export default function RelatedContent({ title = "Related Resources", links }: RelatedContentProps) {
  if (!links.length) return null;

  return (
    <aside className="border-t border-border bg-card py-12">
      <div className="container px-4">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group flex flex-col rounded-xl border border-border bg-background p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover"
            >
              <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary">
                {link.label}
              </h3>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{link.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Learn more <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
