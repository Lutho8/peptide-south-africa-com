import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "how-to-track-peptide-cycles",
  title: "How to Track Peptide Cycles Properly (Without Becoming a Spreadsheet Person)",
  metaTitle: "How to Track Peptide Cycles — A Practical Framework",
  metaDescription: "A simple, research-backed framework for tracking peptide cycles: structure, fields to log, bloodwork timing, and exit criteria.",
  keyword: "how to track peptide cycles",
  publishedAt: "2026-05-26",
  updatedAt: "2026-05-26",
  readingMinutes: 6,
  category: "Tools",
  hero: {
    eyebrow: "Method",
    summary: "Cycles aren't a vibe. They're an experiment with a start, an end, and a measurable hypothesis. Here's the framework that works.",
  },
  body: [
    { type: "p", text: "The most common mistake we see in protocol logs is treating a peptide cycle like a vitamin: start it, take it, stop when the vial is empty. That's not a cycle — that's drift. <strong>Tracking peptide cycles</strong> properly means treating each one as a discrete experiment with a defined start, end, hypothesis, and exit criteria." },
    { type: "h2", text: "The five components of a cycle" },
    {
      type: "ol",
      items: [
        "<strong>Hypothesis.</strong> One sentence. \"BPC-157 250 mcg/day SC for 28 days will reduce my shoulder pain from 6/10 to ≤2/10.\"",
        "<strong>Protocol.</strong> Peptide, dose, frequency, route, site rotation, duration.",
        "<strong>Baseline.</strong> Bloodwork + subjective scores captured in the 7 days before starting.",
        "<strong>Daily log.</strong> Dose confirmation, subjective score, side effects, training load.",
        "<strong>Exit review.</strong> Repeat bloodwork + comparison to hypothesis at end of cycle.",
      ],
    },
    { type: "h2", text: "Cycle structure" },
    { type: "p", text: "Most peptide protocols in the published self-experiment literature follow a basic on/off pattern.<sup>1</sup> A standard structure looks like:" },
    {
      type: "ul",
      items: [
        "<strong>Loading phase</strong> (optional): 7–14 days at full dose to establish response",
        "<strong>Maintenance phase</strong>: 14–28 days at the same or slightly reduced dose",
        "<strong>Washout</strong>: 14–28 days completely off — this is where you observe what reverts",
        "<strong>Re-evaluation</strong>: Decide whether to repeat, modify, or discontinue",
      ],
    },
    { type: "callout", title: "Washout matters", text: "Skipping washout is the easiest way to fool yourself. If you can't tell what reverts when you stop, you can't tell what the peptide is actually doing." },
    { type: "h2", text: "What to log every day" },
    { type: "p", text: "Friction is the enemy of adherence. A 2-minute daily log beats a 20-minute weekly one. The minimum:" },
    {
      type: "ul",
      items: [
        "Dose taken (yes/no, time, site)",
        "Subjective score 1–10 for the primary outcome",
        "Subjective score 1–10 for sleep",
        "Side effects (free-text, even just \"none\")",
        "Notable confounders (alcohol, illness, missed sleep)",
      ],
    },
    { type: "h2", text: "Bloodwork timing" },
    { type: "p", text: "Three time points: baseline (within 7 days of starting), mid-cycle (week 3–4 for cycles longer than 6 weeks), and end-of-washout (not end-of-cycle — you want to see what stuck).<sup>2</sup> Always use the same lab; inter-lab variation for markers like IGF-1 is real.<sup>3</sup>" },
    { type: "h2", text: "Exit criteria" },
    { type: "p", text: "Define what would make you stop early <em>before you start</em>. Common ones: significant adverse event, no measurable change in primary outcome by mid-cycle, abnormal bloodwork. Writing these down in advance protects you from sunk-cost reasoning later." },
    { type: "h2", text: "The honest read at the end" },
    { type: "p", text: "When the cycle ends, compare actual to predicted. If you hit your hypothesis, great — note the protocol and repeat. If you didn't, the question is whether to adjust dose, swap the peptide, or accept that this one doesn't work for you. All three are valid answers. Sticking with a protocol that didn't move the needle because you 'invested in it' is the most expensive mistake in this space." },
  ],
  citations: [
    { id: "1", label: "Karlsson J et al. The therapeutic potential of BPC 157. Med Hypotheses. 2020.", url: "https://pubmed.ncbi.nlm.nih.gov/31881477/" },
    { id: "2", label: "Sigalos JT, Pastuszak AW. Safety and efficacy of growth hormone secretagogues. Sex Med Rev. 2018.", url: "https://pubmed.ncbi.nlm.nih.gov/28526632/" },
    { id: "3", label: "Clemmons DR. Consensus statement on IGF-1 measurement. Clin Chem. 2011.", url: "https://pubmed.ncbi.nlm.nih.gov/21474639/" },
  ],
  faqs: [
    { q: "How long should a cycle be?", a: "Most evidence-based protocols are 4–8 weeks. Shorter than 4 weeks rarely gives enough signal; longer than 8 weeks without a break adds risk without clear benefit." },
    { q: "Can I run two peptides at once?", a: "Yes, but introduce them one at a time across separate cycles so you can attribute effects. Stacking without isolating is how protocols become superstitions." },
    { q: "What if I miss a dose?", a: "Log it. Don't double-dose. A missed dose is data, not a failure." },
    { q: "Do I need to repeat bloodwork every cycle?", a: "Baseline + end-of-washout, yes. If you're running back-to-back cycles of the same peptide at the same dose, you can extend the interval to every second cycle." },
  ],
  related: [],
  cta: "club",
};
