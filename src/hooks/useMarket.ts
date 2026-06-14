export type Market = "default" | "de" | "za";

export interface MarketInfo {
  market: Market;
  lang: "en";
  currency: "ZAR";
  basePath: "";
}

export const SITE_URL = "https://www.peptide-south-africa.com";

const INFO: MarketInfo = {
  market: "default",
  lang: "en",
  currency: "ZAR",
  basePath: "",
};

export function detectMarket(_pathname: string): Market {
  return "default";
}

export function marketInfo(_market: Market): MarketInfo {
  return INFO;
}

/** Identity — no market prefix is ever added. */
export function marketPath(path: string, _market?: Market): string {
  return path;
}

/** Identity — no market prefix to strip. */
export function stripMarket(pathname: string): string {
  return pathname;
}

export function useMarket(): MarketInfo {
  return INFO;
}

/** Single canonical entry per page; no localized alternates. */
export function buildAlternates(genericPath: string) {
  const href = `${SITE_URL}${genericPath === "/" ? "" : genericPath}` || `${SITE_URL}/`;
  return [
    { hrefLang: "en-ZA", href },
    { hrefLang: "en", href },
    { hrefLang: "x-default", href },
  ];
}
