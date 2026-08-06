import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "what-are-peptides-complete-guide",
  title: "What Are Peptides? A Complete Guide for South African Researchers",
  metaTitle: "What Are Peptides? Complete Guide | Peptide South Africa",
  metaDescription: "Peptides explained from first principles — what they are, how they differ from proteins, the main research categories, and how sourcing and legality work in South Africa.",
  keyword: "peptides",
  publishedAt: "2026-08-07",
  updatedAt: "2026-08-07",
  readingMinutes: 7,
  category: "Guides",
  hero: {
    eyebrow: "Peptide basics",
    summary: "Before comparing specific compounds, it helps to have the fundamentals straight — what a peptide actually is, how the major categories differ, and what to look for in a supplier.",
  },
  body: [
    { type: "p", text: "\"Peptides\" gets used as a catch-all term covering everything from skincare ingredients to injectable metabolic research compounds, which makes it a confusing starting point if you're new to the space. Here's the grounding you need before any of the specific comparisons make sense." },
    { type: "h2", text: "What a peptide actually is" },
    { type: "p", text: "A peptide is a short chain of amino acids linked together by peptide bonds — the same chemical bond that links amino acids in any protein. The distinction is purely one of length: chains of roughly 2 to 50 amino acids are generally called peptides, while longer, more complex folded chains are called proteins. A dipeptide has 2 amino acids, a tripeptide has 3 (KPV, discussed elsewhere on our blog, is a tripeptide), and so on up to the oligopeptide and polypeptide range." },
    { type: "p", text: "This size matters practically. Small peptides are simple enough to synthesize precisely and study for a specific, targeted biological signal, whereas full proteins are structurally complex and much harder to characterize or manufacture consistently. That's a large part of why peptides specifically — rather than full proteins — dominate this research field." },
    { type: "h2", text: "The main research categories" },
    { type: "p", text: "Research peptides broadly cluster into a handful of categories based on what they're studied for:" },
    {
      type: "ul",
      items: [
        "<strong>Metabolic / GLP-1 family</strong> — GLP-1, GIP, and glucagon receptor agonists studied for appetite regulation and glucose metabolism. See our <a href=\"/blog/retatrutide-vs-tirzepatide-comparison\" class=\"text-accent underline\">Retatrutide vs. Tirzepatide comparison</a> and <a href=\"/blog/tirzepatide-vs-semaglutide-comparison\" class=\"text-accent underline\">Tirzepatide vs. Semaglutide comparison</a>.",
        "<strong>Healing & recovery</strong> — compounds like BPC-157 and TB-500, studied for tissue repair. See our <a href=\"/blog/bpc-157-south-africa\" class=\"text-accent underline\">BPC-157 in South Africa</a> guide.",
        "<strong>Growth hormone axis</strong> — GHRH analogs and secretagogues like Tesamorelin and CJC-1295/Ipamorelin.",
        "<strong>Cognitive & neuroprotective</strong> — Semax, Selank, and related compounds. See our <a href=\"/blog/brain-peptides-cognitive-health\" class=\"text-accent underline\">brain peptides research overview</a>.",
        "<strong>Mitochondrial & longevity</strong> — MOTS-C and related mitochondrial-derived peptides. See our <a href=\"/blog/mots-c-mitochondrial-peptide-south-africa\" class=\"text-accent underline\">MOTS-C research overview</a>.",
        "<strong>Skin & cosmetic</strong> — copper peptides like GHK-Cu, studied for collagen synthesis and wound healing.",
      ],
    },
    { type: "h2", text: "How peptides are typically administered" },
    { type: "p", text: "Most injectable research peptides arrive as a lyophilised (freeze-dried) powder that needs reconstituting with bacteriostatic water before use — we cover exactly how long a vial stays good before and after that step in our <a href=\"/blog/peptide-vial-shelf-life-storage\" class=\"text-accent underline\">peptide vial shelf life guide</a>. Some smaller peptides are dosed intranasally instead, which uses a completely different absorption route — see our <a href=\"/blog/brain-peptides-cognitive-health\" class=\"text-accent underline\">brain peptides piece</a> for how that works." },
    { type: "h2", text: "Legality and sourcing in South Africa" },
    { type: "p", text: "Research peptides are not registered finished medicines under the Medicines and Related Substances Act, and are sold for research purposes. Accessing them for actual use in South Africa generally happens through one of two routes: a GP-supervised compounding pathway, or direct purchase for research use. Whichever route you take, the sourcing floor should be the same regardless of compound:" },
    {
      type: "ol",
      items: [
        "Third-party HPLC purity testing, ideally ≥99%",
        "A lot-matched Certificate of Analysis (COA) — not a generic one that doesn't correspond to your actual vial",
        "Cold-chain shipping for lyophilised vials",
        "Clear, accurate labelling — no vague or unverifiable claims",
      ],
    },
    { type: "callout", title: "Why GP supervision matters", text: "Most of the peptide-selling landscape in South Africa is built around pure e-commerce — HPLC percentages, ZAR pricing, fast dispatch. Fewer suppliers build in actual clinical oversight. A GP who can review your full protocol against your health history is the single biggest safety upgrade over buying and self-administering in isolation, particularly once you start combining more than one compound." },
    { type: "h2", text: "Where to go from here" },
    { type: "p", text: "If you already know which category you're researching, our comparison and deep-dive articles above are the faster path in. If you're still getting oriented, our <a href=\"/research\" class=\"text-accent underline\">Research Hub</a> has the full peptide database, dosing calculators, and citation library, and our <a href=\"/shop\" class=\"text-accent underline\">shop</a> lists everything currently available with full purity documentation." },
  ],
  citations: [
    { id: "1", label: "Medicines and Related Substances Act 101 of 1965, compounding provisions.", url: "https://www.sahpra.org.za/" },
  ],
  faqs: [
    { q: "What's the difference between a peptide and a protein?", a: "It's a matter of chain length. Peptides are short chains of roughly 2 to 50 amino acids linked by peptide bonds. Longer, structurally folded chains are called proteins. The bond chemistry is identical — the distinction is size and complexity." },
    { q: "Are peptides legal in South Africa?", a: "Research peptides are sold for research purposes and are not registered finished medicines under SAHPRA. They're typically accessed either through a GP-led compounding pathway or direct research-use purchase, rather than a standard pharmacy prescription." },
    { q: "How do I know a peptide supplier is trustworthy?", a: "Look for third-party HPLC purity testing (ideally ≥99%), a lot-matched Certificate of Analysis specific to your batch, cold-chain shipping for lyophilised vials, and clear, non-exaggerated labelling." },
    { q: "Do all peptides need to be injected?", a: "No. Most larger peptides are dosed via subcutaneous injection after reconstitution, but some smaller peptides are formulated for intranasal delivery instead, which uses a different absorption pathway via the nasal cavity." },
  ],
  cta: "club",
  related: ["research-peptides-cape-town", "buy-peptides-cape-town", "peptide-vial-shelf-life-storage"],
};
