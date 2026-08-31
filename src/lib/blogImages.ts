import clinicalResearchImage from "@/assets/funnel-hero-1.jpg";
import comparisonImage from "@/assets/funnel-hero-2.jpg";
import protocolsImage from "@/assets/funnel-hero-3.jpg";
import communityImage from "@/assets/funnel-hero-4.jpg";
import sourcingImage from "@/assets/funnel-hero-5.jpg";

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
};

export function getBlogImage(category: string): string {
  return imagesByCategory[category] ?? communityImage;
}
