// Single source of truth for business contact / NAP (Name, Address, Phone)
// details. Used by the LocalBusiness schema, the site footer, and the
// contact page so Google sees CONSISTENT signals everywhere (NAP consistency
// is a core local-SEO ranking factor — mismatches hurt more than omissions).
//
// ⚠️ ACTION REQUIRED: replace every FILL_ME value below with the real,
// publicly-listed details, then set `PUBLISH_NAP = true`. Until then the
// address/phone are omitted from schema and UI rather than shown as fake
// data. Once live, keep these identical to your Google Business Profile.

export const PUBLISH_NAP = false; // ← set true once the values below are real

export const businessInfo = {
  legalName: "Peptide South Africa", // FILL_ME if the registered entity differs
  streetAddress: "FILL_ME — e.g. Unit 4, 12 Example Street",
  addressLocality: "Cape Town",
  addressRegion: "Western Cape",
  postalCode: "FILL_ME — e.g. 8001",
  addressCountry: "ZA",
  // E.164 for schema/tel: links; South African mobile e.g. +27 82 123 4567
  telephone: "FILL_ME — e.g. +27821234567",
  email: "hello@peptide-south-africa.com", // FILL_ME if different
  geo: { latitude: -33.9249, longitude: 18.4241 }, // Cape Town CBD; refine to real coords
  vatNumber: "", // optional, FILL_ME if VAT-registered
};

/** PostalAddress fragment for schema.org — only includes street/postcode/phone when published. */
export function postalAddressSchema() {
  const base = {
    "@type": "PostalAddress",
    addressCountry: businessInfo.addressCountry,
    addressRegion: businessInfo.addressRegion,
    addressLocality: businessInfo.addressLocality,
  };
  if (!PUBLISH_NAP) return base;
  return {
    ...base,
    streetAddress: businessInfo.streetAddress,
    postalCode: businessInfo.postalCode,
  };
}
