import clinicalResearchImage from "@/assets/funnel-hero-1.jpg";
import comparisonImage from "@/assets/funnel-hero-2.jpg";
import protocolsImage from "@/assets/funnel-hero-3.jpg";
import communityImage from "@/assets/funnel-hero-4.jpg";
import sourcingImage from "@/assets/funnel-hero-5.jpg";
import peptideCheatSheetImage from "@/assets/blog/peptide-cheat-sheet-south-africa-1200x675.webp";
import southAfricaGlp1RecallImage from "@/assets/blog/south-africa-glp-1-recall-2026-1200x675.webp";
import southAfricaMedicineImportRulesImage from "@/assets/blog/south-africa-medicine-import-rules-2026-1200x675.webp";
import peptidesSouthAfricanSportWada2026Image from "@/assets/blog/peptides-south-african-sport-wada-2026-1200x675.webp";

const imagesBySlug: Record<string, string> = {
  "glp-1-blood-tests-women-south-africa": new URL('../assets/blog/glp-1-blood-tests-women-1200x675.webp', import.meta.url).href,
  "glp-1-blood-tests-men-south-africa": new URL('../assets/blog/glp-1-blood-tests-men-1200x675.webp', import.meta.url).href,
  "peptide-cheat-sheet-south-africa": peptideCheatSheetImage,
  "south-africa-glp-1-recall-2026": southAfricaGlp1RecallImage,
  "south-africa-medicine-import-rules-2026": southAfricaMedicineImportRulesImage,
  "peptides-south-african-sport-wada-2026": peptidesSouthAfricanSportWada2026Image,
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
