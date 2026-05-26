import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "bpc-157-south-africa",
  title: "BPC-157 in South Africa: Legal Status, Sourcing and Honest Use",
  metaTitle: "BPC-157 South Africa — Legality, Suppliers & Prescriptions",
  metaDescription: "Is BPC-157 legal in South Africa? How to access it legitimately, what suppliers to trust, and how Cape Town's compounding network works.",
  keyword: "BPC-157 South Africa",
  publishedAt: "2026-05-26",
  updatedAt: "2026-05-26",
  readingMinutes: 6,
  category: "Sourcing",
  hero: {
    eyebrow: "Sourcing & legality",
    summary: "BPC-157 isn't a registered medicine in SA. Here's the honest read on legal access, sourcing, and what to demand from a supplier.",
  },
  body: [
    { type: "p", text: "<strong>BPC-157 in South Africa</strong> sits in an interesting regulatory position. It's not registered with SAHPRA as a finished medicine, but it is accessible through compounding pharmacies on prescription, and through clearly-labelled research-use channels. Here's the honest version of how it works in 2026." },
    { type: "h2", text: "Legal status" },
    { type: "p", text: "BPC-157 is not currently registered under the Medicines and Related Substances Act 101 of 1965 as a finished pharmaceutical. However, the same Act permits compounding pharmacies to prepare medicines on prescription from a registered medical practitioner for an individual patient.<sup>1</sup> This is the route Cape Town's clinical network uses." },
    { type: "p", text: "The research-use channel is a separate path: peptides sold and labelled for laboratory research are legal to sell and possess, but explicitly not for human use. Researchers actually planning to administer the peptide — as opposed to running benchtop assays — should use the prescription route." },
    { type: "h2", text: "Where to source" },
    {
      type: "ul",
      items: [
        "<strong>Compounding pharmacies (prescription)</strong> — the cleanest route. Cape Town has several pharmacies experienced with peptide compounding, all of whom work with the Ride The Tide medical network.",
        "<strong>Research-use suppliers</strong> — legal for sale and possession, but vet rigorously. Demand the lot-matched COA.",
        "<strong>Import as a private individual</strong> — legally and logistically painful. The local supply chain is mature enough that direct import is rarely worth it in 2026.",
      ],
    },
    { type: "h2", text: "The sourcing standard" },
    { type: "p", text: "Regardless of channel, the floor is the same:" },
    {
      type: "ol",
      items: [
        "Third-party HPLC purity ≥99%",
        "Mass-spec identity confirmation",
        "Lot-matched COA from an independent lab",
        "Cold-chain shipping for lyophilised vials",
        "Endotoxin and bacterial test results if intended for injection",
      ],
    },
    { type: "callout", title: "Why the prescription route wins for most people", text: "You get traceable supply, a clinician who can intervene, and bloodwork as part of the workflow. The price premium is usually 20–30% — worth it for the safety floor." },
    { type: "h2", text: "Cost in SA" },
    { type: "p", text: "Typical 2026 pricing for compounded BPC-157 5mg vials sits roughly at R650–R950 per vial depending on pharmacy and quantity. Research-use vials run R450–R700. A full 4–6 week cycle at standard doses uses 2–4 vials." },
    { type: "h2", text: "Storage and handling" },
    {
      type: "ul",
      items: [
        "Lyophilised vials: refrigerate (2–8°C), stable for 12+ months",
        "Reconstituted: refrigerate, use within 2–4 weeks",
        "Bacteriostatic water is the standard reconstitution diluent (preservative-containing)",
        "Insulin syringes (28–31 gauge, 0.5 mL) are standard for SC administration",
      ],
    },
    { type: "h2", text: "Red flags when buying" },
    {
      type: "ul",
      items: [
        "No COA, or generic COA that doesn't match the lot on the vial",
        "Prices significantly below the local market median",
        "Supplier won't say where the peptide was manufactured",
        "Vials arrive warm or without cold-chain packaging",
        "Marketing language that makes medical claims about BPC-157",
      ],
    },
    { type: "h2", text: "What to do if you're new" },
    {
      type: "ol",
      items: [
        "Read our <a href=\"/blog/bpc-157-protocol-cape-town\" class=\"text-accent underline\">BPC-157 protocol guide</a>",
        "Book a consult with a peptide-experienced GP — the Ride The Tide network maintains a referral list",
        "Get baseline bloodwork",
        "Source via the compounding pharmacy your GP recommends",
        "Set up a tracker before your first dose",
      ],
    },
  ],
  citations: [
    { id: "1", label: "Medicines and Related Substances Act 101 of 1965, compounding provisions.", url: "https://www.sahpra.org.za/" },
    { id: "2", label: "Sikiric P et al. Brain-gut axis and pentadecapeptide BPC 157. Curr Neuropharmacol. 2016.", url: "https://pubmed.ncbi.nlm.nih.gov/27226072/" },
    { id: "3", label: "Janoshik Analytical. Peptide purity testing reports.", url: "https://www.janoshik.com/" },
  ],
  faqs: [
    { q: "Is BPC-157 a schedule medicine in SA?", a: "It's not a scheduled finished medicine. It's accessible via compounding pharmacies on prescription from a registered medical practitioner." },
    { q: "Can I bring BPC-157 into SA from abroad?", a: "Importing as a private individual is legally and logistically complicated. The local supply chain is mature; importing is rarely worth the friction." },
    { q: "What's the typical cost per vial?", a: "Roughly R650–R950 for compounded 5mg vials in 2026; R450–R700 for research-use vials. A standard 4–6 week cycle uses 2–4 vials." },
    { q: "Can my regular GP write the script?", a: "If they're comfortable with it, yes. If not, the Ride The Tide network can refer you to clinicians familiar with peptide protocols." },
  ],
  cta: "both",
  related: ["bpc-157-protocol-cape-town", "buy-peptides-cape-town", "research-peptides-cape-town"],
};
