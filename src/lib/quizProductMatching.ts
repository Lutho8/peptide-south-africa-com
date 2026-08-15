import type { Product } from "@/data/products";

const PRODUCT_ALIASES: Record<string, string[]> = {
  "rt3-reta": ["retatrutide", "rt3", "reta"],
  "tz2-tirz": ["tirzepatide", "tz2", "tirz"],
  "bpc-tb500-blend": ["bpc157", "tb500", "bpc157tb500", "bpctb500", "healingstack"],
  "ghk-cu-50mg": ["ghkcu", "copperpeptide"],
  "mots-c": ["motsc"],
  "thymosin-alpha-1": ["thymosinalpha1", "ta1"],
  glow70: ["glowblend", "glow70"],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function matchProtocolProducts(
  peptides: { name: string }[],
  catalog: Product[],
): Product[] {
  const seen = new Set<string>();
  const matches: Product[] = [];

  for (const peptide of peptides) {
    const target = normalize(peptide.name);
    const product = catalog.find((candidate) => {
      const name = normalize(candidate.name);
      const slug = normalize(candidate.slug);
      if (name.includes(target) || target.includes(name) || slug.includes(target) || target.includes(slug)) {
        return true;
      }
      return (PRODUCT_ALIASES[candidate.slug] ?? []).some((alias) => target.includes(alias) || alias.includes(target));
    });

    if (product && !seen.has(product.id)) {
      seen.add(product.id);
      matches.push(product);
    }
  }

  return matches;
}
