import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "peptide-bloodwork-markers-sa",
  title: "Peptide Bloodwork Markers in South Africa: The Panel You Actually Need",
  metaTitle: "Peptide Bloodwork Markers SA — Lancet, Ampath & PathCare Guide",
  metaDescription: "Which bloodwork markers to track on a peptide protocol in South Africa, which pathology labs to use, and what each marker tells you.",
  keyword: "peptide bloodwork markers SA",
  publishedAt: "2026-05-26",
  updatedAt: "2026-05-26",
  readingMinutes: 7,
  category: "Bloodwork",
  hero: {
    eyebrow: "Bloodwork",
    summary: "The right panel turns a peptide protocol from a hunch into a measurable experiment. Here's what to test in South Africa — and where.",
  },
  body: [
    { type: "p", text: "You can't run a serious peptide protocol without bloodwork. Subjective feel is the noisiest possible outcome measure, and most of the things that go wrong on peptide protocols — lipid shifts, fasting-glucose drift, prolactin elevation, thyroid suppression — are invisible until you draw blood. Here's the practical guide to <strong>peptide bloodwork markers in SA</strong>." },
    { type: "h2", text: "The base panel (every protocol)" },
    { type: "p", text: "Regardless of which peptide you're running, this is the floor:" },
    {
      type: "ul",
      items: [
        "<strong>Full blood count (FBC)</strong> — baseline and end-of-cycle",
        "<strong>U&E (urea, electrolytes, creatinine)</strong> — renal function",
        "<strong>LFT (liver function tests)</strong> — ALT, AST, GGT, bilirubin",
        "<strong>Fasting glucose + HbA1c</strong> — glucose homeostasis",
        "<strong>Lipid panel</strong> — total cholesterol, LDL, HDL, triglycerides",
        "<strong>hs-CRP</strong> — systemic inflammation marker",
      ],
    },
    { type: "h2", text: "Add-on markers by peptide class" },
    { type: "h3", text: "Growth-hormone secretagogues (CJC-1295, ipamorelin, tesamorelin, MK-677)" },
    {
      type: "ul",
      items: [
        "<strong>IGF-1</strong> — the primary downstream readout of GH stimulation<sup>1</sup>",
        "<strong>IGFBP-3</strong> — paired with IGF-1 for context",
        "<strong>Fasting insulin + glucose</strong> — these peptides can shift glucose handling",
        "<strong>Prolactin</strong> — particularly relevant for ipamorelin and ghrelin mimetics",
        "<strong>Cortisol (AM)</strong> — baseline plus mid-cycle",
      ],
    },
    { type: "h3", text: "Healing peptides (BPC-157, TB-500, GHK-Cu)" },
    {
      type: "ul",
      items: [
        "<strong>hs-CRP</strong> — primary outcome for inflammation-mediated effect",
        "<strong>ESR</strong> — slower-moving inflammation proxy",
        "<strong>Ferritin</strong> — confounded by inflammation; interpret with CRP",
      ],
    },
    { type: "h3", text: "Metabolic peptides (semaglutide, tirzepatide, retatrutide)" },
    {
      type: "ul",
      items: [
        "<strong>HbA1c + fasting glucose</strong>",
        "<strong>Lipid panel</strong> — expect favourable shifts",
        "<strong>LFT</strong> — monitor for hepatic stress",
        "<strong>Amylase + lipase</strong> if any abdominal symptoms<sup>2</sup>",
        "<strong>TSH</strong> — particularly with tirzepatide/retatrutide given the C-cell signal in rodent studies",
      ],
    },
    { type: "callout", title: "Use the same lab", text: "IGF-1 in particular shows meaningful inter-assay variation. Stick with one provider for the entire cycle so the trend is real, not lab noise.<sup>3</sup>" },
    { type: "h2", text: "Where to test in South Africa" },
    { type: "p", text: "South Africa is well-served. The three major private pathology networks all run the full panel above:" },
    {
      type: "ul",
      items: [
        "<strong>Lancet Laboratories</strong> — nationwide, strong digital portal, drop-in centres in every major city",
        "<strong>Ampath</strong> — wide footprint, good IGF-1 turnaround, online results",
        "<strong>PathCare</strong> — particularly strong in the Western Cape, useful for Cape Town-based research",
      ],
    },
    { type: "p", text: "You will need a request form from a registered medical practitioner. In Cape Town this is usually handled through the same GP overseeing your protocol — one consult covers the script and the request form." },
    { type: "h2", text: "Cost expectations" },
    { type: "p", text: "Cash prices in 2026 sit roughly at: base panel R1,200–R1,800; IGF-1 alone R450–R650; full hormonal add-on (IGF-1, prolactin, cortisol, TSH) R1,500–R2,200. Medical-aid coverage varies; the diagnostic codes matter — your GP can help select codes that maximise the chance of reimbursement." },
    { type: "h2", text: "Timing" },
    { type: "p", text: "Draw fasted, in the morning, before the day's injection. For IGF-1 and cortisol, consistency of timing matters more than the absolute hour. Repeat at the <em>end of washout</em>, not end of dosing — what matters is what persists." },
  ],
  citations: [
    { id: "1", label: "Sigalos JT, Pastuszak AW. The safety and efficacy of growth hormone secretagogues. Sex Med Rev. 2018.", url: "https://pubmed.ncbi.nlm.nih.gov/28526632/" },
    { id: "2", label: "Jastreboff AM et al. Tirzepatide once weekly for the treatment of obesity. NEJM. 2022.", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038" },
    { id: "3", label: "Clemmons DR. Consensus statement on the standardization and evaluation of IGF-I assays. Clin Chem. 2011.", url: "https://pubmed.ncbi.nlm.nih.gov/21474639/" },
  ],
  faqs: [
    { q: "Can I order labs without a doctor in SA?", a: "Most pathology labs require a clinician's request form. The cleanest path is via a GP who's overseeing the protocol anyway." },
    { q: "How often should I repeat bloodwork?", a: "Baseline within 7 days of starting; mid-cycle for cycles longer than 6 weeks; and at end of washout. Annual full panels even off-cycle if you're an active researcher." },
    { q: "Is medical aid likely to cover this?", a: "Some markers yes, some no. Your GP can code the request to maximise legitimate reimbursement." },
    { q: "What about home finger-prick kits?", a: "Useful for HbA1c and lipids as convenience checks, but venous draws at an accredited lab remain the standard for protocol decisions." },
  ],
  cta: "tracker",
  related: ["peptide-protocol-tracker", "how-to-track-peptide-cycles", "bpc-157-protocol-cape-town"],
};
