import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "peptide-injection-site-rotation-guide",
  title: "Where to Inject Peptides: A Practical Site Rotation Guide",
  metaTitle: "Peptide Injection Sites & Rotation Guide South Africa",
  metaDescription: "Most subcutaneous peptides go into the same handful of sites — but rotating them properly is what actually prevents lumps, scar tissue, and inconsistent absorption. Here's how to do it right.",
  keyword: "where to inject peptides",
  publishedAt: "2026-08-07",
  updatedAt: "2026-08-07",
  readingMinutes: 5,
  category: "Protocols",
  hero: {
    eyebrow: "Technique & safety",
    summary: "The single strongest modifiable risk factor for injection-site problems isn't the compound — it's not rotating where you inject it.",
  },
  body: [
    { type: "p", text: "Most research peptides — GLP-1/GIP compounds, BPC-157, growth-hormone secretagogues among them — are administered subcutaneously, meaning into the fat layer just under the skin rather than into muscle. The technique itself is simple. The part people skip is rotation, and it's the part that actually determines whether the site holds up over months of use." },
    { type: "h2", text: "Why rotation is the part that matters" },
    { type: "p", text: "Injecting repeatedly into the same small spot causes lipohypertrophy — a buildup of thickened, rubbery fatty tissue at the injection site. It's well studied in insulin therapy, where a consensus review of the literature found inadequate site rotation to be the single strongest modifiable risk factor, and one study found lipohypertrophy in 64.4% of insulin users who didn't rotate consistently.<sup>1</sup>" },
    { type: "p", text: "Beyond the physical lump, the real practical problem is absorption. Scarred, thickened tissue absorbs compounds more slowly and less predictably than healthy tissue — so a dose that's been calculated properly can behave inconsistently simply because of where it landed, not because of anything wrong with the compound itself." },
    { type: "callout", title: "The good news", text: "Lipohypertrophy is generally reversible if caught early. Checking the site before every injection — for firmness, lumps, or unusual texture — and simply not injecting into an area that already feels off is most of the battle." },
    { type: "h2", text: "Where to inject" },
    { type: "p", text: "The standard subcutaneous sites, in rough order of how commonly they're used:" },
    {
      type: "ul",
      items: [
        "<strong>Abdomen</strong> — either side of the navel, avoiding a 2-inch radius directly around it. The most commonly used site, largely because it's the easiest to reach and see.",
        "<strong>Outer thigh</strong> — the front and outer portion, avoiding the inner thigh where major blood vessels sit closer to the surface.",
        "<strong>Upper glutes / love handles</strong> — the flank area above the hip, useful for adding rotation variety.",
        "<strong>Back of the upper arm</strong> — commonly used but harder to reach solo without help pinching the area.",
      ],
    },
    { type: "h2", text: "A simple rotation system" },
    { type: "p", text: "You don't need anything elaborate — a consistent pattern is what matters, not a specific one. A practical approach used widely in both insulin and GLP-1 injection guidance:" },
    {
      type: "ol",
      items: [
        "Pick at least 4 sites you can comfortably reach (commonly: left abdomen, right abdomen, left thigh, right thigh).",
        "Within each site, mentally divide it into a grid and move to a new spot each time, keeping at least a couple of centimetres — roughly a finger-width — from your last injection.",
        "Once you've used every spot in a region, move to the next region entirely rather than starting the same grid over immediately.",
        "If you're injecting daily rather than weekly, expand to 6–8 sites so each one gets more recovery time between uses.",
      ],
    },
    { type: "h2", text: "Basic technique" },
    {
      type: "ul",
      items: [
        "Wash your hands, then clean the chosen site with an alcohol swab and let it air-dry fully before injecting.",
        "Inspect the site first — don't inject into anything that feels firm, lumpy, or unusually warm.",
        "Most subcutaneous peptide injections with a short needle use a straight, 90-degree angle. If you're using a longer needle or have less subcutaneous fat, a pinched-skin technique at a shallower angle is more appropriate — check your specific device or vial's instructions rather than assuming.",
        "Never reuse a needle. A dull needle causes more tissue trauma per injection, which compounds the rotation problem rather than helping it.",
      ],
    },
    { type: "p", text: "None of this replaces guidance specific to your compound, dose, or device — for that, see our <a href=\"/blog/peptide-dosage-calculator\" class=\"text-accent underline\">reconstitution and dosing guide</a>, or talk to your prescribing GP directly." },
  ],
  citations: [
    { id: "1", label: "Consensus recommendations on lipohypertrophy: insights from an international panel of experts. 2026.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0168822726003219" },
  ],
  faqs: [
    { q: "How far apart should injection sites be?", a: "At least a couple of centimetres — roughly a finger-width — between consecutive injections, and ideally a fresh spot within your rotation grid each time rather than the same point repeatedly." },
    { q: "What does lipohypertrophy feel like?", a: "A firm, rubbery, or lumpy area under the skin at a repeatedly-used injection site. It's often not obviously visible early on, which is why checking by touch before each injection matters more than checking by eye alone." },
    { q: "Is lipohypertrophy permanent?", a: "Generally no — it's reversible if you stop injecting into the affected area and let it recover, especially if caught early. Continuing to inject into an already-affected site is what makes it worse and less predictable to absorb from." },
    { q: "Do all peptides use the same injection technique?", a: "Most research peptides are subcutaneous, but needle length, angle, and pinch technique can vary by device and by how much subcutaneous fat you have at the site. Check your specific product's instructions rather than assuming one technique fits every vial." },
  ],
  cta: "club",
  related: ["peptide-dosage-calculator", "how-to-track-peptide-cycles", "peptide-vial-shelf-life-storage"],
};
