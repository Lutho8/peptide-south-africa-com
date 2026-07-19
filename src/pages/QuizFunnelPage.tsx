import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Clock,
  Star,
  MessageCircle,
  Flame,
  Dumbbell,
  Heart,
  Sparkles,
  User,
  Mail,
  Phone,
  Zap,
  Video,
  Bot,
  ShoppingCart,
  Stethoscope,
  FlaskConical,
  Quote,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShaderBackdrop from "@/components/ShaderBackdrop";
import ProtocolPlans, { type PlanChoice } from "@/components/ProtocolPlans";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast as sonnerToast } from "sonner";

const WA_NUMBER = "27641344646";
const ZOOM_LINK = "https://us06web.zoom.us/j/83316307927";
const waLink = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

interface QuizAnswers {
  goal?: string;
  trigger?: string;
  issues?: string;
  failed?: string;
  lifestyle?: string;
  experience?: string;
  readiness?: string;
  budget?: string;
}

interface LeadInfo {
  name: string;
  email: string;
  whatsapp: string;
}

interface AIProtocol {
  protocolName: string;
  subtitle: string;
  duration: string;
  whyFits: string;
  timeline: string;
  monthlyPrice: string;
  fullPrice: string;
  savings: string;
  peptides: { name: string; dose: string; frequency: string; purpose: string }[];
  expectedResults: { icon: string; label: string }[];
  included: string[];
  weeklySchedule: string;
  warnings: string[];
}

type Opt = { value: string; label: string; icon: string; desc: string };
type FlowNode =
  | { kind: "q"; key: keyof QuizAnswers; question: string; sub?: string; options: Opt[] }
  | { kind: "slide"; id: "proof" | "science" };

/**
 * The funnel architecture (Keeps mechanics, PSA clinical voice):
 * Q1 goal → Q2 EMOTIONAL SPIKE → proof interstitial → Q3 struggle →
 * Q4 FAILED-SOLUTIONS spike → science interstitial → lifestyle →
 * experience → readiness → budget → lead capture → PERSONALIZATION
 * THEATER → results with 1/3/6-month plan engineering.
 */
const FLOW: FlowNode[] = [
  {
    kind: "q",
    key: "goal",
    question: "What would you like to change first?",
    sub: "There is no wrong answer. This just tells the doctor where to look.",
    options: [
      { value: "fat-loss", label: "Lose stubborn fat", icon: "🔥", desc: "Body composition, waist measurement, energy" },
      { value: "recovery", label: "Recover and perform better", icon: "💪", desc: "Training, injury repair, day-to-day output" },
      { value: "both", label: "Both — a full reset", icon: "⚡", desc: "Composition and performance, sequenced properly" },
    ],
  },
  {
    kind: "q",
    key: "trigger",
    question: "Most people can name the moment. When did you notice it?",
    sub: "This is the question our physicians ask first — it tells us what this is really costing you.",
    options: [
      { value: "mirror", label: "I started avoiding mirrors and photos", icon: "🪞", desc: "I angle myself out of pictures now" },
      { value: "clothes", label: "My clothes stopped fitting", icon: "👖", desc: "Same body I used to have, different size" },
      { value: "comment", label: "Someone close said something", icon: "💬", desc: "A partner, a friend, a colleague — it landed" },
      { value: "energy", label: "The energy just left", icon: "🪫", desc: "I sleep, I caffeinate, I'm still flat by 14:00" },
    ],
  },
  { kind: "slide", id: "proof" },
  {
    kind: "q",
    key: "issues",
    question: "What is the hardest part right now?",
    options: [
      { value: "stubborn-fat", label: "Fat that will not move", icon: "😤", desc: "Especially around the midsection" },
      { value: "slow-recovery", label: "Recovery takes forever", icon: "🩹", desc: "Sessions cost me days, not hours" },
      { value: "low-energy", label: "Flat energy and drive", icon: "😴", desc: "Motivation is not the problem — fuel is" },
      { value: "plateau", label: "I have hit a plateau", icon: "📉", desc: "Doing everything right, going nowhere" },
    ],
  },
  {
    kind: "q",
    key: "failed",
    question: "What have you already tried that didn't hold?",
    sub: "Almost everyone who lands here has a graveyard of attempts. It matters for dosing, not judgement.",
    options: [
      { value: "diets", label: "Diets that never lasted", icon: "🥗", desc: "Lost it, gained it back, repeat" },
      { value: "gym", label: "Training with no visible change", icon: "🏋️", desc: "Consistent for months, mirror disagrees" },
      { value: "supplements", label: "Supplements that did nothing", icon: "💊", desc: "A cupboard full of expensive urine" },
      { value: "fresh", label: "Nothing yet — I'm starting fresh", icon: "🌱", desc: "I'd rather do this properly the first time" },
    ],
  },
  { kind: "slide", id: "science" },
  {
    kind: "q",
    key: "lifestyle",
    question: "What does an average week look like?",
    options: [
      { value: "active", label: "I train regularly", icon: "🏃", desc: "3+ sessions a week, decent routine" },
      { value: "moderate", label: "I move, inconsistently", icon: "🚶", desc: "Some weeks better than others" },
      { value: "sedentary", label: "Mostly deskbound", icon: "🪑", desc: "Starting from close to zero" },
    ],
  },
  {
    kind: "q",
    key: "experience",
    question: "Have you used structured protocols before?",
    options: [
      { value: "never", label: "Never — this is new", icon: "🆕", desc: "First time doing this with medical guidance" },
      { value: "some", label: "Bits and pieces", icon: "📊", desc: "Tried things, never with a real plan" },
      { value: "experienced", label: "Yes — I want better", icon: "🎯", desc: "Experienced, looking for clinical-grade" },
    ],
  },
  {
    kind: "q",
    key: "readiness",
    question: "When do you want to start?",
    options: [
      { value: "ready-now", label: "This week", icon: "🚀", desc: "I've decided — point me at the protocol" },
      { value: "exploring", label: "Once I understand it", icon: "🔍", desc: "Show me the science first" },
      { value: "planning", label: "Within the month", icon: "📅", desc: "Planning around life and logistics" },
    ],
  },
  {
    kind: "q",
    key: "budget",
    question: "What monthly investment is realistic for you?",
    sub: "We anchor your protocol to this — nothing we show you will exceed it.",
    options: [
      { value: "starter", label: "Under R1,500 / month", icon: "💰", desc: "Focused, essential protocol" },
      { value: "standard", label: "R1,500 – R2,500 / month", icon: "⭐", desc: "Comprehensive guided program" },
      { value: "premium", label: "R2,500+ / month", icon: "👑", desc: "Full protocol, premium support" },
    ],
  },
];

const iconMap: Record<string, typeof Flame> = {
  flame: Flame,
  heart: Heart,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  shield: Shield,
  zap: Zap,
};

const GOAL_LABEL: Record<string, string> = {
  "fat-loss": "fat loss",
  recovery: "recovery & performance",
  both: "full transformation",
};

export default function QuizFunnelPage() {
  const [flowIndex, setFlowIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [lead, setLead] = useState<LeadInfo>({ name: "", email: "", whatsapp: "" });
  const [phase, setPhase] = useState<"flow" | "lead" | "theater" | "results">("flow");
  const [aiProtocol, setAiProtocol] = useState<AIProtocol | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theaterPct, setTheaterPct] = useState(0);
  const [planChosen, setPlanChosen] = useState<PlanChoice | null>(null);
  const { addToCart, setIsCartOpen } = useCart();
  const protocolRef = useRef<AIProtocol | null>(null);
  const errorRef = useRef<string | null>(null);

  const totalUnits = FLOW.length + 1; // + lead capture
  const progress =
    phase === "flow"
      ? ((flowIndex + 1) / totalUnits) * 100
      : phase === "lead"
        ? (totalUnits / totalUnits) * 100
        : 100;

  // Match AI-recommended peptides to actual shop products by fuzzy name match.
  const matchedProducts = useMemo(() => {
    if (!aiProtocol?.peptides?.length) return [];
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const seen = new Set<string>();
    const out: typeof products = [];
    for (const pep of aiProtocol.peptides) {
      const target = norm(pep.name);
      const hit = products.find((p) => {
        const a = norm(p.name);
        const b = norm(p.slug);
        return a.includes(target) || target.includes(a) || b.includes(target) || target.includes(b);
      });
      if (hit && !seen.has(hit.id)) {
        seen.add(hit.id);
        out.push(hit);
      }
    }
    return out;
  }, [aiProtocol]);

  const handleChoosePlan = (plan: PlanChoice) => {
    setPlanChosen(plan);
    matchedProducts.forEach((p) => {
      const v = p.variants?.[0];
      addToCart(p, v ? { variantLabel: v.label, unitPrice: v.price } : undefined);
    });
    setIsCartOpen(true);
    sonnerToast.success(`${plan.months}-month cycle started`, {
      description: `${matchedProducts.length} product${matchedProducts.length === 1 ? "" : "s"} from your protocol are in your cart.`,
    });
    try {
      const prev = JSON.parse(localStorage.getItem("psa-quiz-result") || "{}");
      localStorage.setItem("psa-quiz-result", JSON.stringify({ ...prev, plan: plan.id, months: plan.months }));
    } catch { /* noop */ }
  };

  // Persist the result for shop/product deep links (no forced redirect —
  // the plan decision happens right here on the results page).
  useEffect(() => {
    if (!aiProtocol) return;
    try {
      localStorage.setItem(
        "psa-quiz-result",
        JSON.stringify({
          protocolName: aiProtocol.protocolName,
          subtitle: aiProtocol.subtitle,
          peptides: aiProtocol.peptides?.map((p) => p.name) ?? [],
          productIds: matchedProducts.map((p) => p.id),
          ts: Date.now(),
        }),
      );
    } catch { /* noop */ }
  }, [aiProtocol, matchedProducts]);

  const handleAnswer = (key: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (flowIndex >= FLOW.length - 1) setPhase("lead");
    else setFlowIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (phase === "lead") setPhase("flow");
    else if (flowIndex > 0) setFlowIndex((i) => i - 1);
  };

  // Personalization theater — staged build while the edge function runs.
  const theaterStages = useMemo(
    () => [
      { label: "Analysing your answers", detail: `Primary goal: ${GOAL_LABEL[answers.goal ?? ""] ?? "your goal"}` },
      { label: "Cross-referencing 98+ clinical compounds", detail: "Matching mechanisms, not marketing claims" },
      { label: "Sequencing doses around your week", detail: answers.lifestyle === "active" ? "Built around training days" : "Built for a realistic routine" },
      { label: "Anchoring to your budget", detail: answers.budget === "starter" ? "Under R1,500 / month" : answers.budget === "premium" ? "R2,500+ / month" : "R1,500 – R2,500 / month" },
      { label: "Drafting for physician review", detail: "An HPCSA-registered GP signs off before anything ships" },
    ],
    [answers],
  );

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) return;

    setPhase("theater");
    setError(null);
    errorRef.current = null;
    protocolRef.current = null;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fire the real protocol generation in parallel with the theater.
    supabase.functions
      .invoke("generate-protocol", { body: { answers, leadName: lead.name } })
      .then(({ data, error: fnError }) => {
        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);
        if (!data?.protocol) throw new Error("No protocol received");
        protocolRef.current = data.protocol as AIProtocol;

        import("@/lib/nocobase").then(({ captureLead }) => {
          const goalTag = answers.goal ? [`goal:${answers.goal}`] : [];
          captureLead({
            source: "quiz",
            email: lead.email,
            extraTags: goalTag,
            extra: {
              name: lead.name,
              whatsapp: lead.whatsapp,
              answers,
              protocol_summary: (data.protocol as AIProtocol)?.subtitle ?? null,
            },
          });
        });
      })
      .catch((err) => {
        console.error("Protocol generation error:", err);
        errorRef.current = err instanceof Error ? err.message : "Failed to generate your protocol. Please try again.";
      });
  };

  // Theater clock: ~5s staged reveal; only advances when BOTH the
  // animation and the real edge-function response have finished.
  useEffect(() => {
    if (phase !== "theater") return;
    const started = performance.now();
    const MIN = 5200;
    const tick = () => {
      const pct = Math.min(100, ((performance.now() - started) / MIN) * 100);
      setTheaterPct(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else if (protocolRef.current) {
        setAiProtocol(protocolRef.current);
        setPhase("results");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (errorRef.current) {
        setError(errorRef.current);
      } else {
        // Edge function slower than the theater — hold at 100% briefly.
        const hold = setInterval(() => {
          if (protocolRef.current) {
            clearInterval(hold);
            setAiProtocol(protocolRef.current);
            setPhase("results");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (errorRef.current) {
            clearInterval(hold);
            setError(errorRef.current);
          }
        }, 250);
        setTimeout(() => {
          clearInterval(hold);
          if (!protocolRef.current && !errorRef.current) {
            setError("This is taking longer than usual. Please try again.");
          }
        }, 15000);
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const activeStage = Math.min(
    theaterStages.length - 1,
    Math.floor((theaterPct / 100) * theaterStages.length),
  );

  // ===================== SHARED CHROME =====================
  const ProgressChrome = ({ label }: { label: string }) => (
    <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex items-center gap-4 px-4 py-4">
        {(flowIndex > 0 || phase === "lead") && phase === phase && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-hero-gradient transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );

  // ===================== FLOW: QUESTIONS + INTERSTITIALS =====================
  if (phase === "flow") {
    const node = FLOW[flowIndex];

    return (
      <>
        <SEO title="Free Peptide Protocol Quiz — Personalized Stack" description="Take our physician-reviewed quiz and get a personalized peptide protocol. Available across South Africa. Free, 2 minutes." path="/quiz" />
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Free Quiz", href: "/quiz" }]} />
        <div className="relative flex min-h-[80vh] flex-col">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <ShaderBackdrop variant="light" />
          </div>
          <ProgressChrome label={`${flowIndex + 1} / ${totalUnits}`} />

          <div className="container flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-14">
            <AnimatePresence mode="wait">
              {node.kind === "q" ? (
                <motion.div
                  key={`q-${flowIndex}`}
                  initial={{ opacity: 0, x: 44, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -44, filter: "blur(6px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-2xl"
                >
                  <h2 className="text-center font-display text-2xl font-bold text-foreground text-balance md:text-3xl">
                    {node.question}
                  </h2>
                  {node.sub && (
                    <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
                      {node.sub}
                    </p>
                  )}
                  <div className="mt-8 grid gap-3">
                    {node.options.map((opt, i) => (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
                        onClick={() => handleAnswer(node.key, opt.value)}
                        className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card/90 p-4 text-left shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover active:scale-[0.98] sm:p-5"
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="flex-1">
                          <p className="font-display text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
                            {opt.label}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{opt.desc}</p>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : node.id === "proof" ? (
                <motion.div
                  key="slide-proof"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45 }}
                  className="w-full max-w-2xl"
                >
                  <div className="glass-panel rounded-3xl p-6 shadow-card-hover sm:p-8">
                    <div className="flex items-center justify-center gap-1">
                      {Array(5).fill(null).map((_, j) => (
                        <Star key={j} className="h-5 w-5 fill-badge text-badge" />
                      ))}
                    </div>
                    <h2 className="mt-3 text-center font-display text-2xl font-bold text-foreground text-balance md:text-3xl">
                      You're in good company.
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      1,200+ South Africans rated their protocol 4.9 out of 5.
                    </p>
                    <div className="mt-6 space-y-3">
                      {[
                        { name: "Lerato P.", city: "Cape Town", result: "Down 2 dress sizes in 10 weeks", quote: "The first thing that felt like a plan, not a product." },
                        { name: "James K.", city: "Durban", result: "50% faster recovery", quote: "My GP-signed protocol arrived with the COA in the box. That's when I trusted it." },
                        { name: "Michael T.", city: "Cape Town", result: "8 kg in 6 weeks", quote: "No guessing. Just follow the schedule and check in." },
                      ].map((t) => (
                        <div key={t.name} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground">"{t.quote}"</p>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{t.name}</span> · {t.city}
                              <span className="ml-2 rounded-full bg-trust/10 px-2 py-0.5 font-semibold text-trust">{t.result}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setFlowIndex((i) => i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-6 py-3.5 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98]"
                    >
                      That could be me <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="slide-science"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45 }}
                  className="w-full max-w-2xl"
                >
                  <div className="glass-panel rounded-3xl p-6 shadow-card-hover sm:p-8">
                    <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <FlaskConical className="h-3.5 w-3.5" /> The clinical difference
                    </span>
                    <h2 className="mt-4 text-center font-display text-2xl font-bold text-foreground text-balance md:text-3xl">
                      It's not a willpower problem.<br />It's a signalling problem.
                    </h2>
                    <div className="mt-6 space-y-4">
                      {[
                        { n: "01", title: "Peptides are instructions, not stimulants.", body: "Short amino-acid chains that tell your body to do what it already knows — release, repair, regulate. The failures you listed weren't character flaws; the signal never arrived." },
                        { n: "02", title: "Purity is the whole game.", body: "Every batch we dispense is ≥99% HPLC-verified by an independent lab, with the Certificate of Analysis matched to the vial in your box." },
                        { n: "03", title: "A doctor reads your file before anything ships.", body: "Every protocol is reviewed by an HPCSA-registered GP. If it isn't right for you, it doesn't ship — and you aren't charged." },
                      ].map((p) => (
                        <div key={p.n} className="flex gap-4">
                          <span className="font-mono text-xs font-bold text-primary">{p.n}</span>
                          <div>
                            <p className="font-display text-sm font-semibold text-foreground">{p.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setFlowIndex((i) => i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="glow-border mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hero-gradient px-6 py-3.5 text-base font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 active:scale-[0.98]"
                    >
                      Show me what's actually possible <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  }

  // ===================== LEAD CAPTURE =====================
  if (phase === "lead") {
    return (
      <div className="relative flex min-h-[80vh] flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <ShaderBackdrop variant="light" />
        </div>
        <ProgressChrome label="Final step" />

        <div className="container flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground text-balance md:text-3xl">
                Your profile is ready for physician review.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Where should the doctor send your protocol?
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-trust/10 px-2.5 py-1 font-semibold text-trust">
                  <Shield className="h-3 w-3" /> POPIA compliant
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                  <Bot className="h-3 w-3" /> GP-reviewed, never auto-shipped
                </span>
              </div>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={lead.name}
                  onChange={(e) => setLead((p) => ({ ...p, name: e.target.value }))}
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={lead.email}
                  onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" /> WhatsApp Number
                  <span className="text-xs text-muted-foreground">(for your consult link)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={lead.whatsapp}
                  onChange={(e) => setLead((p) => ({ ...p, whatsapp: e.target.value }))}
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="glow-border flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                <Sparkles className="h-4 w-4" /> Build My Protocol
              </button>
              <p className="text-center text-xs text-muted-foreground">
                No spam. No auto-ship. A doctor reads your file first.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===================== PERSONALIZATION THEATER =====================
  if (phase === "theater" && !error) {
    return (
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <ShaderBackdrop variant="light" />
        </div>
        <div className="w-full max-w-md text-center">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
          >
            <Bot className="h-10 w-10 text-primary" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-foreground text-balance">
            Building your protocol{lead.name ? `, ${lead.name.split(" ")[0]}` : ""}…
          </h2>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-hero-gradient transition-[width] duration-150"
              style={{ width: `${theaterPct}%` }}
            />
          </div>

          <div className="mt-6 space-y-2 text-left">
            {theaterStages.map((s, i) => {
              const done = i < activeStage;
              const active = i === activeStage;
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                    active
                      ? "stage-shimmer border-primary/40 bg-primary/5"
                      : done
                        ? "border-trust/30 bg-trust/5"
                        : "border-border bg-card opacity-45"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-trust text-trust-foreground" : active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </p>
                    {active && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate text-xs text-muted-foreground"
                      >
                        {s.detail}
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===================== ERROR STATE =====================
  if (error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Something Went Wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                setError(null);
                setPhase("lead");
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 font-semibold text-primary-foreground"
            >
              Try Again
            </button>
            <a
              href={waLink("Hi, I completed the quiz but had trouble getting my results. Can you help?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Chat With Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===================== RESULTS =====================
  if (!aiProtocol) return null;

  return (
    <div className="relative flex flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <ShaderBackdrop variant="light" />
      </div>
      <div className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container px-4 py-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-trust" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      <div className="container px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Header — physician frame, not AI gimmick */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
              <Stethoscope className="h-3.5 w-3.5" /> Drafted for you · pending GP sign-off
            </div>
            {lead.name && (
              <p className="mb-1 text-base font-medium text-foreground">
                {lead.name.split(" ")[0]}, this was built around your answers —
              </p>
            )}
            <h1 className="mt-2 font-display text-2xl font-bold text-foreground text-balance sm:text-3xl md:text-4xl">
              {aiProtocol.protocolName}
            </h1>
            <p className="mt-1 text-base text-muted-foreground sm:text-lg">{aiProtocol.subtitle}</p>
          </div>

          {/* Why it fits */}
          <div className="reveal-view mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
              Why this fits what you told us
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{aiProtocol.whyFits}</p>
          </div>

          {/* Peptide Stack */}
          {aiProtocol.peptides && aiProtocol.peptides.length > 0 && (
            <div className="reveal-view mb-8">
              <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
                Your compounds
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {aiProtocol.peptides.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <p className="font-display text-sm font-bold text-primary">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.purpose}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">{p.dose}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">{p.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched shop products */}
          {matchedProducts.length > 0 && (
            <div className="reveal-view mb-8 rounded-2xl border border-border bg-card/80 p-5 shadow-card backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">In stock now</span>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">
                    The exact vials for this protocol
                  </h3>
                </div>
                <span className="rounded-full bg-trust/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-trust">
                  COA matched
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {matchedProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted"
                  >
                    <img src={p.image} alt={p.name} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Expected Results */}
          {aiProtocol.expectedResults && aiProtocol.expectedResults.length > 0 && (
            <div className="reveal-view mb-8">
              <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
                What to expect
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {aiProtocol.expectedResults.map((r, i) => {
                  const IconComp = iconMap[r.icon] || Sparkles;
                  return (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <IconComp className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">{r.label}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                <Clock className="mb-0.5 mr-1 inline h-3 w-3" />
                {aiProtocol.timeline}
              </p>
            </div>
          )}

          {/* Weekly Schedule */}
          {aiProtocol.weeklySchedule && (
            <div className="reveal-view mb-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
              <h3 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
                Your week, mapped
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{aiProtocol.weeklySchedule}</p>
            </div>
          )}

          {/* What's Included */}
          {aiProtocol.included && aiProtocol.included.length > 0 && (
            <div className="reveal-view mb-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
              <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
                Included in every cycle
              </h3>
              <ul className="space-y-3">
                {aiProtocol.included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-trust" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {aiProtocol.warnings && aiProtocol.warnings.length > 0 && (
            <div className="reveal-view mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">
                ⚠️ Important Notes
              </h3>
              <ul className="space-y-2">
                {aiProtocol.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ===================== PLAN ENGINEERING (Keeps model) ===================== */}
          <div className="reveal-view mb-8 rounded-3xl border border-border bg-card/90 p-5 shadow-card-hover backdrop-blur-sm sm:p-8">
            <ProtocolPlans
              monthlyPrice={aiProtocol.monthlyPrice}
              budget={answers.budget}
              onChoose={handleChoosePlan}
            />
            {planChosen && (
              <p className="mt-3 text-center text-xs font-semibold text-trust">
                {planChosen.months}-month cycle selected — your stack is in the cart.
              </p>
            )}
          </div>

          {/* Zoom Consultation Booking */}
          <div className="reveal-view mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 text-center sm:p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
              Talk it through with a specialist first
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              A free 30-minute video consult to review this protocol before you commit to anything.
            </p>
            <a
              href={ZOOM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <Video className="h-4 w-4" /> Book Zoom Consultation
            </a>
            <p className="mt-2 text-xs text-muted-foreground">Free • 30 minutes • No commitment</p>
          </div>

          {/* WhatsApp CTA */}
          <div className="reveal-view mb-8 rounded-2xl border border-trust/30 bg-trust/5 p-5 text-center sm:p-6">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-trust" />
            <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
              Prefer to chat it through?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Real humans, on WhatsApp, during SA business hours.
            </p>
            <a
              href={waLink(`Hi, I'm ${lead.name || "interested"}. I just got my protocol recommendation (${aiProtocol.protocolName}) and have some questions.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-trust px-6 py-3 font-semibold text-trust-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>

          {/* Trust footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-trust" /> ≥99% HPLC verified
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-primary" /> HPCSA-registered GP review
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-trust" /> 4.9 · 1,200+ reviews
            </span>
          </div>

          {/* Retake */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setFlowIndex(0);
                setPhase("flow");
                setAnswers({});
                setLead({ name: "", email: "", whatsapp: "" });
                setAiProtocol(null);
                setPlanChosen(null);
                setError(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
