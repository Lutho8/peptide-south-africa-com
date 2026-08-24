// Server-side render entry used ONLY by scripts/prerender.mjs at build time.
// Renders the full app for a given path to an HTML string, plus the Helmet
// head tags (title, meta, JSON-LD) so crawlers receive fully-populated pages.
//
// The client entry (main.tsx) is unchanged and still hydrates normally in the
// browser — this file is never shipped to users.
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppShell from "./AppShell";

export interface RenderResult {
  html: string;
  head: {
    title: string;
    meta: string;
    link: string;
    script: string;
  };
}

export function render(url: string): Promise<RenderResult> {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  const app = (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <AppShell />
        </StaticRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );

  return new Promise((resolve, reject) => {
    let html = "";
    const output = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
    });

    output.on("finish", () => {
      const h = helmetContext.helmet;
      resolve({
        html,
        head: {
          title: h?.title.toString() ?? "",
          meta: h?.meta.toString() ?? "",
          link: h?.link.toString() ?? "",
          script: h?.script.toString() ?? "",
        },
      });
    });
    output.on("error", reject);

    const { pipe } = renderToPipeableStream(app, {
      onAllReady() {
        pipe(output);
      },
      onShellError(error) {
        reject(error);
      },
      onError(error) {
        console.error("Prerender stream error", error);
      },
    });
  });
}
