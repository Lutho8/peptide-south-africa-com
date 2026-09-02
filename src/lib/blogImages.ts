import clinicalResearchImage from "@/assets/funnel-hero-1.jpg";
import comparisonImage from "@/assets/funnel-hero-2.jpg";
import protocolsImage from "@/assets/funnel-hero-3.jpg";
import communityImage from "@/assets/funnel-hero-4.jpg";
import sourcingImage from "@/assets/funnel-hero-5.jpg";
import peptideCheatSheetImage from "@/assets/blog/peptide-cheat-sheet-south-africa-1200x675.webp";
import southAfricaGlp1RecallImage from "@/assets/blog/south-africa-glp-1-recall-2026-1200x675.webp";

const imagesBySlug: Record<string, string> = {
  "peptide-cheat-sheet-south-africa": peptideCheatSheetImage,
  "south-africa-glp-1-recall-2026": southAfricaGlp1RecallImage,
};

const imagesByCategory: Record<string, string> = {
  "Clinical Research": clinicalResearchImage,
  "Comparison Guide": comparisonImage,
  Protocols: protocolsImage,
  Community: communityImage,
  Sourcing: sourcingImage,
  Bloodwork: clinicalResearchImage,
  Guides: communityImage,
  "Storage & handling": sourcingImage,
  Tools: protocolsImage,
  "South African Regulation": sourcingImage,
};

export function getBlogImage(category: string, slug?: string): string {
  if (slug && imagesBySlug[slug]) return imagesBySlug[slug];
  return imagesByCategory[category] ?? communityImage;
}
