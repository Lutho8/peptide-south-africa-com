import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "tirzepatide-vs-semaglutide-comparison",
  title: "Tirzepatide vs Semaglutide: A Research-Backed Comparison for Weight Loss",
  metaTitle: "Tirzepatide vs Semaglutide — Efficacy, Side Effects & Evidence",
  metaDescription:
    "Side-by-side comparison of tirzepatide and semaglutide for weight loss: mechanism, head-to-head trial data, side effects, dosing and how to choose.",
  keyword: "tirzepatide vs semaglutide",
  publishedAt: "2026-06-12",
  updatedAt: "2026-06-12",
  readingMinutes: 9,
  category: "Comparison Guide",
  hero: {
    eyebrow: "Comparison guide",
    summary:
      "Tirzepatide and semaglutide are the two most-discussed GLP-1-class peptides for weight loss. Here is what the head-to-head clinical evidence actually shows — efficacy, side effects, dosing and how to decide which one fits your protocol.",
  },
  body: [
    {
      type: "p",
      text: "<strong>Tirzepatide</strong> (the active in Mounjaro and Zepbound) and <strong>semaglutide</strong> (the active in Ozempic and Wegovy) are the two GLP-1-class peptides driving the global weight-loss conversation. Both have completed large randomised trials, both are prescribed off-label and on-label for obesity, and both are widely researched. They are not, however, equivalent — they differ in receptor activity, in head-to-head weight loss, in tolerability profile, and in how the dose is titrated. This guide compares them on the evidence that matters for protocol design.",
    },
    { type: "h2", text: "Mechanism: single vs dual incretin agonism" },
    {
      type: "p",
      text: "<strong>Semaglutide</strong> is a selective GLP-1 receptor agonist. It mimics the gut hormone glucagon-like peptide-1, which slows gastric emptying, increases satiety, and improves glucose-dependent insulin secretion.<sup>1</sup>",
    },
    {
      type: "p",
      text: "<strong>Tirzepatide</strong> is a dual GIP/GLP-1 receptor agonist — it activates both glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptors from a single molecule. GIP appears to add complementary effects on lipid metabolism and energy expenditure, and the dual mechanism is the mechanistic basis for the larger weight loss seen in trials.<sup>2</sup>",
    },
    {
      type: "callout",
      title: "Why the receptor difference matters",
      text: "Dual GIP/GLP-1 agonism (tirzepatide) consistently outperforms GLP-1-only agonism (semaglutide) on weight loss in head-to-head data — but with a similar gastrointestinal side-effect class.",
    },
    { type: "h2", text: "Head-to-head efficacy: SURMOUNT and STEP" },
    {
      type: "p",
      text: "The cleanest comparison comes from the <strong>SURPASS-2</strong> trial in type 2 diabetes, where tirzepatide 15 mg produced an average weight loss of <strong>11.2 kg</strong> over 40 weeks versus <strong>5.7 kg</strong> for semaglutide 1 mg.<sup>3</sup> In obesity specifically, the <strong>SURMOUNT-1</strong> trial of tirzepatide reported mean weight loss of <strong>20.9%</strong> at the 15 mg dose over 72 weeks; the comparable <strong>STEP-1</strong> trial of semaglutide 2.4 mg reported <strong>14.9%</strong> over 68 weeks.<sup>4,5</sup>",
    },
    {
      type: "p",
      text: "A 2024 retrospective real-world cohort of 18,000+ adults (Truveta dataset) found tirzepatide users were <strong>76% more likely</strong> to achieve ≥15% weight loss at one year compared with semaglutide users, after matching for baseline BMI and diabetes status.<sup>6</sup>",
    },
    { type: "h3", text: "Approximate weight loss at maximum dose" },
    {
      type: "ul",
      items: [
        "<strong>Tirzepatide 15 mg/week</strong>: ~20–22% mean body-weight reduction at 72 weeks (SURMOUNT-1)",
        "<strong>Semaglutide 2.4 mg/week</strong>: ~14–15% mean body-weight reduction at 68 weeks (STEP-1)",
        "<strong>Tirzepatide 5 mg/week</strong> (entry dose): ~15% — roughly matching the maximum semaglutide dose",
        "Individual response varies widely — these are means, not guarantees",
      ],
    },
    { type: "h2", text: "Side-effect profile" },
    {
      type: "p",
      text: "Both peptides share the GLP-1 class side-effect profile: nausea, diarrhoea, constipation, and reflux are the most common, almost always dose-dependent, and typically peak in the first 2–4 weeks of each dose step.<sup>1,2</sup> In SURPASS-2 the rates of nausea (22% vs 18%), diarrhoea (16% vs 12%) and vomiting (10% vs 8%) were marginally higher for tirzepatide, but treatment-discontinuation for adverse events was similar (~6%).",
    },
    {
      type: "ul",
      items: [
        "<strong>Gastrointestinal</strong> — nausea, vomiting, constipation, reflux; mitigated by slow titration and lower-fat meals",
        "<strong>Gallbladder events</strong> — cholelithiasis reported with both, slightly higher with rapid weight loss",
        "<strong>Pancreatitis</strong> — rare; both labels carry the warning. Personal or family history is a contraindication",
        "<strong>Thyroid C-cell tumours</strong> — boxed warning on both based on rodent data; personal/family history of MTC or MEN-2 is a contraindication",
        "<strong>Lean mass loss</strong> — ~25–40% of total weight lost on either drug is lean mass without resistance training and adequate protein",
      ],
    },
    { type: "h2", text: "Dosing and titration" },
    {
      type: "p",
      text: "Both peptides are once-weekly subcutaneous injections. Titration is slow on purpose — it is the single biggest determinant of tolerability.",
    },
    { type: "h3", text: "Semaglutide (Wegovy / Ozempic) titration" },
    {
      type: "ul",
      items: [
        "Weeks 1–4: 0.25 mg/week",
        "Weeks 5–8: 0.5 mg/week",
        "Weeks 9–12: 1.0 mg/week",
        "Weeks 13–16: 1.7 mg/week",
        "Week 17+: 2.4 mg/week (maintenance for weight loss)",
      ],
    },
    { type: "h3", text: "Tirzepatide (Mounjaro / Zepbound) titration" },
    {
      type: "ul",
      items: [
        "Weeks 1–4: 2.5 mg/week",
        "Weeks 5–8: 5 mg/week",
        "Weeks 9–12: 7.5 mg/week",
        "Weeks 13–16: 10 mg/week",
        "Weeks 17–20: 12.5 mg/week",
        "Week 21+: 15 mg/week (maximum)",
      ],
    },
    {
      type: "callout",
      title: "Doses are clinical reference, not prescriptions",
      text: "These titrations reflect the approved product labels for human therapeutic use. Research-use-only peptides are not approved for self-administration in South Africa. Any clinical use must be supervised by a registered GP.",
    },
    { type: "h2", text: "Which one for which person?" },
    {
      type: "p",
      text: "There is no universal winner. The honest decision framework looks like this:",
    },
    {
      type: "ul",
      items: [
        "<strong>Higher weight-loss target (>15%)</strong> — tirzepatide has the stronger head-to-head and real-world data",
        "<strong>Established type 2 diabetes</strong> — tirzepatide also shows larger HbA1c reductions in SURPASS",
        "<strong>Sensitive GI tract or history of severe reflux</strong> — semaglutide titrates more slowly at lower starting doses; some patients tolerate it better",
        "<strong>Cost-constrained protocols</strong> — semaglutide is typically less expensive per mg in the SA market",
        "<strong>First-time GLP-1 user</strong> — either is reasonable; starting low and titrating slowly matters more than the molecule choice",
        "<strong>Family history of MTC/MEN-2 or pancreatitis</strong> — neither is appropriate without specialist clearance",
      ],
    },
    { type: "h2", text: "Markers to track on either protocol" },
    {
      type: "ul",
      items: [
        "Body weight + waist circumference weekly",
        "DXA or bioimpedance at baseline and every 12 weeks (lean vs fat mass)",
        "HbA1c, fasting glucose, fasting insulin at baseline and 12-weekly",
        "Lipid panel and ALT/AST quarterly",
        "Protein intake (target ≥1.6 g/kg) and resistance-training sessions per week",
        "Subjective satiety, nausea, GI score 1–10 daily during titration",
      ],
    },
    { type: "h2", text: "Bottom line" },
    {
      type: "p",
      text: "Tirzepatide produces more weight loss on average. Semaglutide has a longer real-world safety record and is often more accessible. Both belong inside a structured, GP-led protocol that combines slow titration, resistance training, adequate protein, and quarterly bloodwork — not in a standalone injection-only plan. Whichever you choose, the variables that move outcomes the most are not the molecule: they are titration discipline, nutrition, and consistency over 12+ months.",
    },
  ],
  citations: [
    {
      id: "1",
      label:
        "Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP-1). NEJM. 2021.",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
    },
    {
      id: "2",
      label:
        "Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). NEJM. 2022.",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038",
    },
    {
      id: "3",
      label:
        "Frías JP et al. Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2). NEJM. 2021.",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2107519",
    },
    {
      id: "4",
      label:
        "Eli Lilly. SURMOUNT-1 detailed results — tirzepatide weight reduction at 72 weeks.",
      url: "https://investor.lilly.com/news-releases/news-release-details/lillys-tirzepatide-delivered-up-225-weight-loss-adults-obesity",
    },
    {
      id: "5",
      label:
        "Rubino DM et al. Effect of Continued Weekly Semaglutide vs Placebo on Weight Loss Maintenance (STEP-4). JAMA. 2021.",
      url: "https://jamanetwork.com/journals/jama/fullarticle/2777886",
    },
    {
      id: "6",
      label:
        "Rodriguez PJ et al. Comparative Effectiveness of Tirzepatide vs Semaglutide in Adults with Overweight or Obesity. JAMA Intern Med. 2024.",
      url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2821080",
    },
  ],
  faqs: [
    {
      q: "Is tirzepatide always better than semaglutide for weight loss?",
      a: "On average yes — head-to-head trial and real-world data favour tirzepatide for total weight reduction. But the response distribution overlaps significantly, and individual tolerability, access, and cost matter as much as the average effect.",
    },
    {
      q: "Can I switch from semaglutide to tirzepatide?",
      a: "Yes, under GP supervision. The usual approach is to discontinue semaglutide, allow a one-week washout, then start tirzepatide at 2.5 mg and titrate from the standard schedule — not from a dose 'matched' to the prior semaglutide dose.",
    },
    {
      q: "Do I keep the weight off after stopping?",
      a: "Without continued treatment most people regain a substantial fraction within 12 months (STEP-4 showed ~two-thirds regain with placebo crossover). Either drug is best framed as a long-term protocol with structured taper rather than a short course.",
    },
    {
      q: "Are research-grade tirzepatide or semaglutide peptides the same as the branded products?",
      a: "Sequence-identical research peptides are chemically the same molecule. They are not, however, formulated, dosed, or approved for human therapeutic use, and quality varies sharply by source — third-party HPLC/MS testing on every lot is the minimum bar.",
    },
    {
      q: "Which one has fewer side effects?",
      a: "The class profile is similar. In SURPASS-2, GI side effects were marginally higher with tirzepatide but treatment-discontinuation rates were comparable (~6% both arms). Tolerability is driven more by titration speed than by drug choice.",
    },
  ],
  cta: "tracker",
  related: [
    "fat-loss-protocol-page",
    "peptide-bloodwork-markers-sa",
    "peptide-dosage-calculator",
  ],
};
