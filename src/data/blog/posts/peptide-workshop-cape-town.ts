import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "peptide-workshop-cape-town",
  title: "Peptide Workshops in Cape Town: What to Expect and Why Attend",
  metaTitle: "Peptide Workshop Cape Town — Hands-On Sessions & GP Q&A",
  metaDescription: "What happens at a Cape Town peptide workshop: reconstitution practice, dosing math, bloodwork review and live GP Q&A. Honest overview.",
  keyword: "peptide workshop Cape Town",
  publishedAt: "2026-05-26",
  updatedAt: "2026-05-26",
  readingMinutes: 6,
  category: "Community",
  hero: {
    eyebrow: "Community",
    summary: "If you're new to peptides, two hours in a room with a GP and 20 other researchers will save you six months of trial and error.",
  },
  body: [
    { type: "p", text: "Books and forums only get you so far. The fastest way from \"I'm interested in peptides\" to \"I'm running a properly designed protocol\" is sitting in a room with people who've already done it. <strong>Peptide workshops in Cape Town</strong> have grown from a handful of underground meetups in 2022 to a regular calendar of structured, GP-led sessions in 2026." },
    { type: "h2", text: "What a workshop actually covers" },
    { type: "p", text: "A typical 2–3 hour Cape Town Peptide Club workshop runs roughly like this:" },
    {
      type: "ol",
      items: [
        "<strong>Brief evidence review</strong> — the published literature for the peptide(s) being covered, honestly framed",
        "<strong>Dosing math</strong> — reconstitution, mg-to-units, syringe selection (this is where most people make their first mistake)",
        "<strong>Hands-on reconstitution practice</strong> with saline vials and training syringes",
        "<strong>Injection technique demo</strong> — SC vs IM, site rotation, sharps handling",
        "<strong>Bloodwork walk-through</strong> — what to test, how to read results",
        "<strong>Live GP Q&A</strong> — typically 45 minutes, no question off-limits",
      ],
    },
    { type: "h2", text: "Why a workshop beats YouTube" },
    { type: "p", text: "Three reasons. First, watching someone reconstitute a vial in person — and doing it yourself, badly, with someone correcting you — fixes the muscle memory in a way no video can. Second, the GP Q&A surfaces the specific concerns of people like you, in your jurisdiction, with your medical aid, dealing with the same compounding pharmacies. Third, you meet your local peer network. Self-experimentation in isolation is how protocols go wrong; a network is how they get safely refined." },
    { type: "h2", text: "What to bring" },
    {
      type: "ul",
      items: [
        "Recent bloodwork (if you have any) — anonymised review is part of most sessions",
        "A notebook or tracker — there's a lot of practical detail",
        "Your specific questions, written down",
        "Realistic expectations — workshops educate, they don't prescribe",
      ],
    },
    { type: "callout", title: "Honest disclaimer", text: "Workshops do not replace medical consultation. They give you the literacy to have a useful conversation with a clinician — which is the actual goal." },
    { type: "h2", text: "Who attends" },
    { type: "p", text: "The crowd at a typical Cape Town workshop is more mixed than people expect: roughly a third recreational lifters and recovery-focused athletes, a third longevity-curious professionals in their 30s and 40s, and a third people working on a specific clinical issue (post-surgical recovery, persistent tendinopathy, sleep). It's not a bro-science crowd — most attendees have already done their reading and are looking for the practical layer on top." },
    { type: "h2", text: "Costs and frequency" },
    { type: "p", text: "Sessions run monthly in the Cape Town Peptide Club calendar. Pricing is typically R450–R900 per session depending on whether it's introductory or advanced. Members of the Club get discounted access and the recordings of past sessions." },
    { type: "h2", text: "How to sign up" },
    { type: "p", text: "The current schedule and registration runs through the Cape Town Peptide Club. The Ride The Tide blog announces upcoming sessions but the Club is the source of truth for dates and topics." },
  ],
  citations: [
    { id: "1", label: "Sikiric P et al. Pentadecapeptide BPC 157 and human medicine. Curr Pharm Des. 2014.", url: "https://pubmed.ncbi.nlm.nih.gov/24345255/" },
    { id: "2", label: "SAHPRA. Compounding regulations under Act 101 of 1965. 2023 guidance.", url: "https://www.sahpra.org.za/" },
  ],
  faqs: [
    { q: "Do I need any background to attend?", a: "No. Most introductory workshops assume zero prior experience. There's a separate advanced track for people already running protocols." },
    { q: "Will I leave with a prescription?", a: "No. Workshops are educational. A separate clinical consult with a GP is required for any prescription." },
    { q: "Are sessions recorded?", a: "Yes, for Club members. Live attendance is encouraged because the Q&A is the highest-value portion." },
    { q: "Is there a workshop for people already running protocols?", a: "Yes — the advanced sessions cover stacks, troubleshooting plateaus, and bloodwork interpretation in depth." },
  ],
  cta: "club",
  related: ["peptide-community-south-africa", "longevity-biohacker-cape-town", "bpc-157-protocol-cape-town"],
};
