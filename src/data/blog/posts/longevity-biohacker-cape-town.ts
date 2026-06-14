import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "longevity-biohacker-cape-town",
  title: "Longevity Biohacking in Cape Town: The Local Scene in 2026",
  metaTitle: "Longevity Biohacker Cape Town — Stacks, Clinics & Community",
  metaDescription: "What longevity biohacking looks like in Cape Town in 2026: common stacks, the clinical infrastructure, and where the community meets.",
  keyword: "longevity biohacker Cape Town",
  publishedAt: "2026-05-26",
  updatedAt: "2026-05-26",
  readingMinutes: 7,
  category: "Community",
  hero: {
    eyebrow: "The local scene",
    summary: "Cape Town has quietly become one of the most active longevity biohacking communities in the Southern Hemisphere. Here's the landscape.",
  },
  body: [
    { type: "p", text: "If you'd asked in 2020, the answer to \"is there a <strong>longevity biohacker Cape Town</strong> scene?\" was: kind of, mostly online. Six years on, the answer is: yes, structured, GP-supported, and growing fast. The local community blends the global longevity playbook — bloodwork, resistance training, sleep, fasting protocols — with peptide research and a Cape Town-specific clinical network." },
    { type: "h2", text: "The typical stack" },
    { type: "p", text: "There isn't one stack — that's the point. But there's a recognisable shape to what experienced local biohackers tend to converge on:" },
    {
      type: "ul",
      items: [
        "<strong>Foundational</strong>: zone 2 cardio 3×/week, resistance training 3×/week, 7–9h sleep, time-restricted eating",
        "<strong>Supplements</strong>: creatine, omega-3 EPA/DHA, vitamin D3+K2, magnesium glycinate",
        "<strong>Bloodwork cadence</strong>: full panel every 6 months, IGF-1 + lipids quarterly if on a protocol",
        "<strong>Peptide rotation</strong>: typically a recovery peptide (BPC-157 or TB-500) and a GH-axis peptide (CJC-1295/ipamorelin or tesamorelin), cycled",
        "<strong>Metabolic monitoring</strong>: CGM during specific protocols, fasting insulin quarterly",
      ],
    },
    { type: "p", text: "The evidence base for the foundational layer is strong.<sup>1,2</sup> The evidence base for the peptide layer is thinner and more experimental — which is exactly why tracking and GP oversight matter." },
    { type: "h2", text: "Clinical infrastructure" },
    { type: "p", text: "Cape Town is unusual in South Africa for having a working network of GPs comfortable with longevity protocols. The practical implication: you can get an experienced clinician to oversee a protocol, run the right bloodwork, and adjust as you go. The Peptide South Africa network and the Cape Town Peptide Club both maintain referral lists." },
    { type: "p", text: "On the lab side, the three major pathology providers — Lancet, Ampath, PathCare — all run the longevity-relevant marker set, with PathCare particularly strong in the Western Cape." },
    { type: "h2", text: "Where the community meets" },
    {
      type: "ul",
      items: [
        "<strong>Cape Town Peptide Club</strong> — monthly workshops, GP Q&As, vetted peer network",
        "<strong>Sea Point and Atlantic Seaboard run/swim groups</strong> — informal but a real overlap with the longevity crowd",
        "<strong>Specialist gyms and movement studios</strong> — several Cape Town facilities now offer longevity-oriented training programming",
        "<strong>Local clinics</strong> — a small number of practices in the Southern Suburbs and CBD have built dedicated longevity arms",
      ],
    },
    { type: "callout", title: "Honest framing", text: "Longevity biohacking is not a guaranteed life-extender. The honest claim is: most protocols meaningfully improve markers of health-span (strength, metabolic flexibility, sleep, recovery) over months to years. Whether that translates to lifespan extension at the individual level isn't yet proven in humans.<sup>3</sup>" },
    { type: "h2", text: "What's changed in 2026" },
    { type: "p", text: "Three things, locally. First, the SA peptide supply chain has matured — compounding pharmacies in Cape Town now reliably supply COA-backed research-grade product, which wasn't true five years ago. Second, the medical-aid landscape is beginning to recognise some preventative bloodwork as legitimate. Third, the community is large enough to be self-sustaining: there's a real peer pool to learn from, not just imported podcasts." },
    { type: "h2", text: "Getting started locally" },
    {
      type: "ol",
      items: [
        "Get a baseline full panel (Lancet, Ampath or PathCare)",
        "Find a GP who'll work with you on protocols — or use the Club's referral list",
        "Attend one workshop before starting any peptide protocol",
        "Set up a tracker before your first dose, not after",
        "Run one variable at a time, log everything, repeat bloodwork at washout",
      ],
    },
  ],
  citations: [
    { id: "1", label: "Reimers CD et al. Does physical activity increase life expectancy? A review. J Aging Res. 2012.", url: "https://pubmed.ncbi.nlm.nih.gov/22811911/" },
    { id: "2", label: "Walker MP. Why We Sleep — synthesis of sleep and longevity literature. 2017.", url: "https://pubmed.ncbi.nlm.nih.gov/29161519/" },
    { id: "3", label: "López-Otín C et al. The hallmarks of aging: an expanding universe. Cell. 2023.", url: "https://pubmed.ncbi.nlm.nih.gov/36599349/" },
  ],
  faqs: [
    { q: "Is longevity biohacking expensive?", a: "The foundations are essentially free (training, sleep, fasting). Bloodwork runs R1,500–R3,000 per panel. Peptide protocols add R1,500–R5,000/month depending on stack. Most people start with foundations only." },
    { q: "Do I need a GP?", a: "For peptide protocols, yes. For the foundational layer, no — but a baseline panel is still strongly recommended." },
    { q: "Where do I meet other biohackers in Cape Town?", a: "The Cape Town Peptide Club is the most active node. Workshops are the easiest entry point." },
    { q: "Is any of this proven to extend lifespan?", a: "Not at the individual level. It's proven to improve markers of health-span in groups. Be honest with yourself about that distinction." },
  ],
  cta: "club",
  related: ["peptide-community-south-africa", "peptide-workshop-cape-town", "peptide-bloodwork-markers-sa"],
};
