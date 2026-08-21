import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "retatrutide-half-life-steady-state",
  title: "Retatrutide's 144-Hour Half-Life: Why You Shouldn't Judge Your Dose After One Shot",
  metaTitle: "Retatrutide Half-Life (~6 Days): Why Week 1 Isn't Week 5",
  metaDescription:
    "Retatrutide has a ~6-day (144-hour) half-life, so weekly doses build toward steady state around week 4–5. Here's why that changes how you read your first few weeks. Educational, not medical advice.",
  keyword: "retatrutide half-life",
  publishedAt: "2026-08-12",
  updatedAt: "2026-08-12",
  readingMinutes: 6,
  category: "Clinical Research",
  hero: {
    eyebrow: "Pharmacokinetics",
    summary:
      "Everyone focuses on the dose — 1 mg, 2 mg, 4 mg. But how long retatrutide stays in your system may matter just as much. Here's the half-life, explained.",
  },
  body: [
    { type: "p", text: "A lot of people judge retatrutide by one number: the dose on the syringe. 1 mg. 2 mg. 4 mg. But personally, I think understanding <strong>how long Reta stays in your system</strong> is just as important as the number you inject." },
    { type: "h2", text: "The number most people miss: ~6 days" },
    { type: "p", text: "Retatrutide has a half-life of roughly <strong>six days — about 144 hours</strong>. In plain terms: a dose you take today doesn't just disappear before your next injection. Roughly six days later, about <em>half</em> of that exposure may still be there, and it keeps tapering down from there." },
    { type: "p", text: "That single fact is what made weekly dosing finally make sense to me. You're not starting from zero every week." },
    { type: "h2", text: "Why weekly dosing builds up" },
    { type: "p", text: "Inject once a week and the next dose lands while some of the previous one is still around. Then the next week, the same thing happens again. So over the first few weeks, the drug is gradually <strong>building toward a more stable level</strong> in your body rather than spiking and vanishing each time." },
    {
      type: "callout",
      title: "The steady-state rule",
      text: "Drugs with long half-lives take roughly 4–5 half-lives to get close to steady state. For retatrutide, that puts you somewhere around <strong>week 4–5</strong> before exposure levels off. It's a general pharmacology principle, not a promise about how you'll feel.",
    },
    { type: "h2", text: "Why week 1 and week 5 feel so different" },
    { type: "p", text: "This is also why you shouldn't be too quick to judge a dose after a single injection. Week one you think, “I barely feel anything.” Week two you're already thinking about increasing. Then week three. Then suddenly around week four or five everything feels much stronger — because you've been adding new doses while some of the previous ones were still present." },
    { type: "p", text: "That doesn't mean you won't feel anything early — you absolutely can. It just means your body may still be building consistent exposure during those first weeks." },
    { type: "h2", text: "Patience is part of the protocol" },
    { type: "p", text: "With something like Reta, patience is part of the protocol. Sometimes a dose isn't doing “nothing” — you just haven't given it enough time to fully show you what it's doing yet. Understanding the 144-hour half-life completely changed how I look at weekly dosing: Reta isn't a drug you judge day by day. You have to look at it over weeks." },
    {
      type: "callout",
      title: "Companion explainer (video)",
      text: "This article pairs with a 90-second illustrated explainer on our channel — the decay curve, the weekly build-up, and the week-4–5 steady state, animated. (Embed the video at the top of this post once it's published.)",
    },
    {
      type: "callout",
      title: "Educational only — not medical advice",
      text: "This explains pharmacokinetics, not a personal protocol. Retatrutide is an investigational compound; it is not approved for the uses discussed here. Individual responses and side effects (which often track how fast you titrate, not just the amount) vary. Decisions about starting, dosing or adjusting anything belong with a qualified clinician.",
    },
  ],
  citations: [
    {
      id: "1",
      label: "Jastreboff AM, et al. Triple–Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial. N Engl J Med. 2023.",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2301972",
    },
    {
      id: "2",
      label: "Hallare J, Gerriets V. Half Life. StatPearls (NCBI Bookshelf) — steady state is reached in ~4–5 half-lives.",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK554498/",
    },
  ],
  faqs: [
    { q: "What is retatrutide's half-life?", a: "Retatrutide's half-life is roughly 6 days (about 144 hours), which is why it's suited to once-weekly dosing." },
    { q: "When does retatrutide reach steady state?", a: "As a rule of thumb, drugs reach steady state in about 4–5 half-lives. For retatrutide that's roughly week 4–5 of consistent weekly dosing — though how you feel can change before then." },
    { q: "Why is retatrutide dosed once a week?", a: "Because the ~6-day half-life means a meaningful fraction of each dose is still present a week later, weekly injections build toward stable exposure rather than spiking and crashing daily." },
    { q: "I felt almost nothing in week one — should I increase?", a: "Not necessarily, and that's a decision for your clinician. Early weeks are when exposure is still building toward steady state, so a quiet first week doesn't mean the dose is doing nothing. This is educational information, not medical advice." },
  ],
  cta: "club",
  related: [
    "retatrutide-vs-tirzepatide-comparison",
    "retatrutide-triumph-1-phase-3-results",
    "how-to-track-peptide-cycles",
  ],
};
