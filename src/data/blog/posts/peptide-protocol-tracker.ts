import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "peptide-protocol-tracker",
  title: "Peptide Protocol Tracker: A Simple Framework You Can Run in a Notebook",
  metaTitle: "Peptide Protocol Tracker — Log Doses, Sites & Outcomes (SA Guide)",
  metaDescription:
    "A practical peptide protocol tracker template South African researchers can run in a notebook or spreadsheet. Fields, cadence, and review cycles that hold up.",
  keyword: "peptide protocol tracker",
  publishedAt: "2026-06-02",
  updatedAt: "2026-06-02",
  readingMinutes: 5,
  category: "Tools",
  hero: {
    eyebrow: "Method",
    summary:
      "You don't need an app. You need a repeatable structure: what you took, when, where you injected, and what changed. Here's the tracker template we use.",
  },
  body: [
    {
      type: "p",
      text: "A <strong>peptide protocol tracker</strong> is just a disciplined log — a way to turn a cycle into an experiment you can review honestly at the end. A cheap notebook or a Google Sheet is enough. What matters is that the same fields get captured every day, at roughly the same time, for the full cycle.",
    },
    { type: "h2", text: "The eight fields that matter" },
    {
      type: "ol",
      items: [
        "<strong>Date &amp; time of dose</strong> — timestamped, not \"morning\".",
        "<strong>Peptide &amp; dose</strong> — mcg or mg, and the reconstitution ratio so the maths is auditable.",
        "<strong>Route &amp; site</strong> — SC / IM, plus which quadrant (rotate to avoid nodules).",
        "<strong>Primary outcome score</strong> — 1–10 on the thing you're actually trying to change.",
        "<strong>Sleep score</strong> — 1–10, first thing after waking.",
        "<strong>Side effects</strong> — free text, log \"none\" on clean days so blanks aren't ambiguous.",
        "<strong>Confounders</strong> — alcohol, illness, travel, missed training.",
        "<strong>Notes</strong> — anything else you'd want to remember at week 4.",
      ],
    },
    { type: "h2", text: "Cadence" },
    {
      type: "p",
      text: "Daily entries take under two minutes if the template is set up in advance. Add a weekly 5-minute review where you scan the last 7 rows for trends, and a full mid-cycle review at week 3–4.",
    },
    {
      type: "callout",
      title: "Print it, don't just save it",
      text: "A printed tracker on the fridge gets filled in. A tracker inside an app three taps deep does not. Choose the medium that actually gets used.",
    },
    { type: "h2", text: "The review that closes the loop" },
    {
      type: "p",
      text: "At end of washout, sit down with the log and answer three questions in writing: did the primary outcome move, were the side effects tolerable, and would you run it again unchanged. Any protocol that can't survive that review shouldn't be repeated.",
    },
    { type: "h2", text: "Template you can copy" },
    {
      type: "ul",
      items: [
        "Header row: Date | Time | Peptide | Dose | Route | Site | Outcome (1–10) | Sleep (1–10) | Side effects | Confounders | Notes",
        "One row per dose event — not per day, per dose.",
        "Colour the row red if a dose was missed, so misses are visible at a glance during review.",
      ],
    },
    {
      type: "p",
      text: "For the underlying framework this tracker slots into — hypothesis, exit criteria, and bloodwork timing — see our companion guide on tracking peptide cycles properly.",
    },
  ],
  citations: [
    {
      id: "1",
      label: "Ioannidis JPA. The reproducibility wars in the self-experimentation era. BMJ. 2019.",
      url: "https://pubmed.ncbi.nlm.nih.gov/31699700/",
    },
  ],
  faqs: [
    {
      q: "Do I need an app to track a peptide protocol?",
      a: "No. A notebook or a spreadsheet works as well as any app, provided the same fields get captured every day. The tool that actually gets used is the right one.",
    },
    {
      q: "How long should I keep the log after a cycle ends?",
      a: "Keep it indefinitely. Old cycle logs are the single most useful input when deciding whether to repeat a protocol months or years later.",
    },
    {
      q: "What if I miss a day of logging?",
      a: "Leave the row blank rather than backfilling from memory. Backfilled data is worse than no data because it looks reliable.",
    },
  ],
  related: ["how-to-track-peptide-cycles", "peptide-dosage-calculator", "peptide-bloodwork-markers-sa"],
  cta: "club",
};
