export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title?: string; text: string }
  | { type: "quote"; text: string; cite?: string };

export interface Citation {
  id: string;
  label: string;
  url: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export type CTAVariant = "club";

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keyword: string;
  publishedAt: string; // ISO
  updatedAt: string;
  readingMinutes: number;
  hero: { eyebrow: string; summary: string };
  body: Block[];
  citations: Citation[];
  faqs: FAQ[];
  cta: CTAVariant;
  related: string[]; // slugs
  category: string;
}
