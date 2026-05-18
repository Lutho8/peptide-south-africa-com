import { useLocation } from "react-router-dom";

export type Market = "de" | "za" | "default";

export interface MarketInfo {
  market: Market;
  lang: "de" | "en";
  currency: "EUR" | "ZAR";
  basePath: "" | "/de" | "/za";
}

export const SITE_URL = "https://www.ridethetide.site";

export function detectMarket(pathname: string): Market {
  const seg = pathname.split("/")[1];
  if (seg === "de") return "de";
  if (seg === "za") return "za";
  return "default";
}

export function marketInfo(market: Market): MarketInfo {
  if (market === "de") return { market, lang: "de", currency: "EUR", basePath: "/de" };
  if (market === "za") return { market, lang: "en", currency: "ZAR", basePath: "/za" };
  return { market: "default", lang: "en", currency: "EUR", basePath: "" };
}

/** Prefix a generic path (e.g. "/shop") with the active market base. */
export function marketPath(path: string, market: Market): string {
  const base = marketInfo(market).basePath;
  if (path === "/") return base || "/";
  return `${base}${path}`;
}

/** Strip the leading /de or /za from a pathname so it can be re-prefixed. */
export function stripMarket(pathname: string): string {
  if (pathname.startsWith("/de/")) return pathname.slice(3);
  if (pathname.startsWith("/za/")) return pathname.slice(3);
  if (pathname === "/de" || pathname === "/za") return "/";
  return pathname;
}

export function useMarket(): MarketInfo {
  const { pathname } = useLocation();
  return marketInfo(detectMarket(pathname));
}

/** Build the three reciprocal hreflang alternates for a generic path. */
export function buildAlternates(genericPath: string) {
  const def = `${SITE_URL}${genericPath === "/" ? "" : genericPath}` || `${SITE_URL}/`;
  const de = `${SITE_URL}/de${genericPath === "/" ? "" : genericPath}`;
  const za = `${SITE_URL}/za${genericPath === "/" ? "" : genericPath}`;
  return [
    { hrefLang: "en", href: def },
    { hrefLang: "en-ZA", href: za },
    { hrefLang: "de-DE", href: de },
    { hrefLang: "x-default", href: def },
  ];
}
