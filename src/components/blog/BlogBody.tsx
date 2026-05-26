import type { Block } from "@/data/blog/types";

export default function BlogBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="mt-10 mb-4 font-display text-3xl font-bold text-foreground">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-6 mb-3 font-display text-xl font-semibold text-foreground">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p
                key={i}
                className="mb-5 text-base leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: b.text }}
              />
            );
          case "ul":
            return (
              <ul key={i} className="mb-5 ml-6 list-disc space-y-2 text-muted-foreground">
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="mb-5 ml-6 list-decimal space-y-2 text-muted-foreground">
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
                ))}
              </ol>
            );
          case "callout":
            return (
              <aside
                key={i}
                className="my-6 rounded-xl border-l-4 border-accent bg-accent/5 p-5"
              >
                {b.title && <p className="mb-2 font-semibold text-foreground">{b.title}</p>}
                <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: b.text }} />
              </aside>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-6 border-l-4 border-primary pl-5 italic text-muted-foreground"
              >
                "{b.text}"
                {b.cite && <footer className="mt-2 text-sm not-italic text-muted-foreground/70">— {b.cite}</footer>}
              </blockquote>
            );
        }
      })}
    </div>
  );
}
