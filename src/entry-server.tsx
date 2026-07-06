// Server-side render entry used ONLY by scripts/prerender.mjs at build time.
// Renders the full app for a given path to an HTML string, plus the Helmet
// head tags (title, meta, JSON-LD) so crawlers receive fully-populated pages.
//
// The client entry (main.tsx) is unchanged and still hydrates normally in the
// browser — this file is never shipped to users.
import { renderToString } from "react-dom/server";
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

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <AppShell />
        </StaticRouter>
      </HelmetProvider>
    </QueryClientProvider>,
  );

  const h = helmetContext.helmet;
  return {
    html,
    head: {
      title: h?.title.toString() ?? "",
      meta: h?.meta.toString() ?? "",
      link: h?.link.toString() ?? "",
      script: h?.script.toString() ?? "",
    },
  };
}
