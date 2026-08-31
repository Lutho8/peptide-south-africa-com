import type { Block } from "@/data/blog/types";
import { toHeadingId } from "@/lib/blogHeadings";

export default function BlogBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 id={toHeadingId(b.text)} key={i} className="scroll-mt-24 mt-10 mb-4 font-display text-3xl font-bold text-foreground">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 id={toHeadingId(b.text)} key={i} className="scroll-mt-24 mt-6 mb-3 font-display text-xl font-semibold text-foreground">
                {b.text}
              </h3>
            );
          case "table":
            return (
              <div key={i} className="my-7 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  {b.caption && <caption className="bg-muted/40 px-4 py-3 text-left font-semibold text-foreground">{b.caption}</caption>}
                  <thead className="bg-primary/10 text-foreground">
                    <tr>
                      {b.headers.map((header) => (
                        <th key={header} scope="col" className="border-b border-border px-4 py-3 font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/70 align-top last:border-0">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 leading-relaxed text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: cell }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
