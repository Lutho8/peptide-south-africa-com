// Single source of truth for business contact / NAP (Name, Address, Phone)
// details. Used by the LocalBusiness schema, the site footer, and the
// contact page so Google sees CONSISTENT signals everywhere (NAP consistency
// is a core local-SEO ranking factor — mismatches hurt more than omissions).
//
// Keep these identical to the Google Business Profile at all times.
//
// telephone is the South African (+27) primary public contact line — matches
// the Google Business Profile. Keep in sync with GBP if it ever changes.

export const PUBLISH_NAP = true;

export const businessInfo = {
  legalName: "Peptide South Africa",
  streetAddress: "De Buurt, Richwood",
  addressLocality: "Milnerton",
  addressRegion: "Western Cape",
  postalCode: "7441",
  addressCountry: "ZA",
  // E.164 format for schema.org / tel: links.
  telephone: "+27641344646",
  telephoneDisplay: "+27 64 134 4646",
  email: "hello@peptide-south-africa.com", // FILL_ME if different
  geo: { latitude: -33.8686, longitude: 18.5426 }, // Richwood / Milnerton, Cape Town
  vatNumber: "", // optional, FILL_ME if VAT-registered
};

/** PostalAddress fragment for schema.org — full detail once published. */
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
