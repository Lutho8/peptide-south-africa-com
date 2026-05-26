import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "cjc-1295-ipamorelin-protocol",
  title: "CJC-1295 + Ipamorelin Protocol: The GH-Axis Stack, Done Properly",
  metaTitle: "CJC-1295 Ipamorelin Protocol — Dosing, Timing, Bloodwork",
  metaDescription: "The CJC-1295 + ipamorelin protocol explained: dosing, timing, IGF-1 monitoring and cycle structure for honest research use.",
  keyword: "CJC-1295 ipamorelin protocol",
  publishedAt: "2026-05-26",
  updatedAt: "2026-05-26",
  readingMinutes: 7,
  category: "Protocols",
  hero: {
    eyebrow: "Protocol guide",
    summary: "CJC-1295 + ipamorelin is the most-run GH-axis stack in the community. Here's how to structure it, what to monitor, and what to expect.",
  },
  body: [
    { type: "p", text: "The <strong>CJC-1295 + ipamorelin protocol</strong> stacks a long-acting growth-hormone-releasing hormone (GHRH) analogue with a selective ghrelin-receptor agonist. The combination produces a stronger, more physiological pulsatile GH release than either peptide alone — which is the entire point.<sup>1</sup>" },
    { type: "h2", text: "Mechanism in one paragraph" },
    { type: "p", text: "<strong>CJC-1295</strong> is a modified GHRH(1-29) analogue. Two versions exist: CJC-1295 without DAC (Mod GRF 1-29), with a half-life of about 30 minutes; and CJC-1295 with DAC, with a half-life of 6–8 days due to albumin binding. <strong>Ipamorelin</strong> is a pentapeptide ghrelin mimetic that selectively triggers GH release without meaningfully raising cortisol or prolactin — which is its main advantage over older ghrelin mimetics.<sup>2</sup> Run together, they amplify the natural pulsatile pattern: ipamorelin opens the gate, CJC-1295 ensures GH is available to release." },
    { type: "h2", text: "Typical dosing" },
    {
      type: "ul",
      items: [
        "<strong>Ipamorelin</strong>: 200–300 mcg SC, 1–3× daily",
        "<strong>CJC-1295 no DAC (Mod GRF 1-29)</strong>: 100 mcg SC, matched to each ipamorelin dose",
        "<strong>CJC-1295 with DAC</strong>: 1–2 mg SC once or twice weekly",
        "<strong>Cycle length</strong>: 8–12 weeks, then 4-week washout",
      ],
    },
    { type: "callout", title: "DAC vs no-DAC", text: "Most experienced users prefer no-DAC for protocols because it preserves pulsatility. DAC versions produce a 'GH bleed' — continuous elevation — which deviates from physiology and may down-regulate the GH axis faster. Start with no-DAC unless you have a specific reason." },
    { type: "h2", text: "Timing matters" },
    { type: "p", text: "GH pulses are most meaningful when they don't compete with high insulin. Practical rules:" },
    {
      type: "ul",
      items: [
        "Dose at least 2 hours after the last meal, ideally fasted",
        "Don't eat for 20–30 minutes after dosing to avoid blunting the pulse",
        "A pre-bed dose is the highest-leverage single dose — it amplifies the natural sleep GH pulse",
        "If using 2–3 doses/day: morning fasted, mid-afternoon, pre-bed",
      ],
    },
    { type: "h2", text: "Bloodwork — non-negotiable" },
    { type: "p", text: "GH itself is impractical to measure (pulsatile, short half-life). <strong>IGF-1</strong> is the downstream readout that matters. Baseline within 7 days of starting; mid-cycle at week 4; end-of-washout at the cycle's end.<sup>3</sup>" },
    {
      type: "ul",
      items: [
        "<strong>IGF-1</strong> — primary outcome marker",
        "<strong>IGFBP-3</strong> — for context",
        "<strong>Fasting glucose + insulin</strong> — GH antagonises insulin; watch for drift",
        "<strong>HbA1c</strong> — quarterly if cycling repeatedly",
        "<strong>Prolactin</strong> — should not move meaningfully on this stack; if it does, the product may be misidentified",
        "<strong>Cortisol AM</strong> — should not move; same reasoning",
      ],
    },
    { type: "h2", text: "What to expect" },
    { type: "p", text: "Realistic outcomes from a well-run 10–12 week cycle in healthy adults:" },
    {
      type: "ul",
      items: [
        "<strong>Sleep</strong>: deeper, more consistent — usually the first noticeable change, often by week 1–2",
        "<strong>Recovery</strong>: improved by week 3–4",
        "<strong>Body composition</strong>: modest favourable shifts over the full cycle — not transformative",
        "<strong>IGF-1</strong>: typical rise of 30–60% from baseline; if you're not seeing this, the protocol or product isn't working",
      ],
    },
    { type: "h2", text: "Side effects and red flags" },
    {
      type: "ul",
      items: [
        "Mild injection-site reactions — common, usually self-limiting",
        "Transient flushing/light-headedness in first 5–10 minutes — common, harmless",
        "Tingling/numbness in hands — possible carpal-tunnel-like effect if IGF-1 runs high; reduce dose",
        "Fasting-glucose drift — monitor, adjust dose, take seriously",
      ],
    },
    { type: "p", text: "Stop if you experience persistent joint swelling, marked oedema, or new visual symptoms. None are common at the dose ranges above, but they are the canonical GH-excess presentation and warrant immediate clinical review." },
  ],
  citations: [
    { id: "1", label: "Sigalos JT, Pastuszak AW. The safety and efficacy of growth hormone secretagogues. Sex Med Rev. 2018.", url: "https://pubmed.ncbi.nlm.nih.gov/28526632/" },
    { id: "2", label: "Raun K et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol. 1998.", url: "https://pubmed.ncbi.nlm.nih.gov/9849822/" },
    { id: "3", label: "Clemmons DR. Consensus statement on the standardization of IGF-I assays. Clin Chem. 2011.", url: "https://pubmed.ncbi.nlm.nih.gov/21474639/" },
  ],
  faqs: [
    { q: "Is this safer than HGH?", a: "Different risk profile. Secretagogues preserve pulsatility and the negative-feedback loop, which HGH bypasses. They're not 'safe' — just more physiological in mechanism. Bloodwork still matters." },
    { q: "Can I use it for fat loss?", a: "The body-composition effects are modest. If fat loss is the primary goal, foundational training + nutrition + (where clinically appropriate) GLP-1 protocols will outperform this stack." },
    { q: "How long is the washout?", a: "4 weeks minimum. Some users go longer between cycles. Continuous use is not recommended given the receptor down-regulation concern." },
    { q: "Will my own GH production crash?", a: "Cleanly-run pulsatile protocols don't appear to suppress endogenous GH meaningfully. DAC versions used continuously are a different conversation." },
  ],
  cta: "tracker",
  related: ["peptide-bloodwork-markers-sa", "how-to-track-peptide-cycles", "peptide-dosage-calculator"],
};
