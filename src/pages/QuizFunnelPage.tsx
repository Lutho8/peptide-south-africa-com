import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Loader2,
  Zap,
  Video,
  Bot,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast as sonnerToast } from "sonner";

const WA_NUMBER = "491624747159";
const ZOOM_LINK = "https://us06web.zoom.us/j/83316307927";
const waLink = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

interface QuizAnswers {
  goal?: string;
  issues?: string;
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

const quizSteps = [
  {
    question: "What's your primary health goal?",
    key: "goal" as const,
    options: [
      { value: "fat-loss", label: "Lose Stubborn Fat", icon: "🔥", desc: "Reduce body fat and improve body composition" },
      { value: "recovery", label: "Recovery & Performance", icon: "💪", desc: "Heal faster, train harder, perform better" },
      { value: "both", label: "Both — Full Transformation", icon: "⚡", desc: "Fat loss combined with performance gains" },
    ],
  },
  {
    question: "What are you currently struggling with?",
    key: "issues" as const,
    options: [
      { value: "stubborn-fat", label: "Stubborn Belly Fat", icon: "😤", desc: "Fat that won't budge despite diet and exercise" },
      { value: "slow-recovery", label: "Slow Recovery", icon: "🩹", desc: "Takes too long to recover between sessions" },
      { value: "low-energy", label: "Low Energy & Motivation", icon: "😴", desc: "Feeling tired, sluggish, or unmotivated" },
      { value: "plateau", label: "Hit a Plateau", icon: "📉", desc: "Progress has stalled despite consistent effort" },
    ],
  },
  {
    question: "How would you describe your current lifestyle?",
    key: "lifestyle" as const,
    options: [
      { value: "active", label: "Active & Training", icon: "🏋️", desc: "I train regularly and eat reasonably well" },
      { value: "moderate", label: "Moderately Active", icon: "🚶", desc: "Some exercise, could be more consistent" },
      { value: "sedentary", label: "Getting Started", icon: "🌱", desc: "Ready to make a change but haven't started yet" },
    ],
  },
  {
    question: "Have you tried guided health protocols before?",
    key: "experience" as const,
    options: [
      { value: "never", label: "No, This Is New", icon: "🆕", desc: "First time exploring a structured approach" },
      { value: "some", label: "Tried a Few Things", icon: "📊", desc: "Some experience but nothing structured" },
      { value: "experienced", label: "Yes, Looking for Better", icon: "🎯", desc: "Ready for something that actually works" },
    ],
  },
  {
    question: "How ready are you to invest in your health?",
    key: "readiness" as const,
    options: [
      { value: "ready-now", label: "Ready to Start Now", icon: "🚀", desc: "I want to begin this week" },
      { value: "exploring", label: "Exploring My Options", icon: "🔍", desc: "Want to understand what's involved first" },
      { value: "planning", label: "Planning Ahead", icon: "📅", desc: "Looking to start in the next month" },
    ],
  },
  {
    question: "What monthly budget works for you?",
    key: "budget" as const,
    options: [
      { value: "starter", label: "Under R1,500 per month", icon: "💰", desc: "Focused, essential protocol" },
      { value: "standard", label: "R1,500–R2,500 per month", icon: "⭐", desc: "Comprehensive guided program" },
      { value: "premium", label: "R2,500+/month", icon: "👑", desc: "Full protocol with premium support" },
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

export default function QuizFunnelPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [lead, setLead] = useState<LeadInfo>({ name: "", email: "", whatsapp: "" });
  const [aiProtocol, setAiProtocol] = useState<AIProtocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

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

  const addStackToCart = () => {
    matchedProducts.forEach((p) => {
      const v = p.variants?.[0];
      addToCart(p, v ? { variantLabel: v.label, unitPrice: v.price } : undefined);
    });
    setIsCartOpen(true);
    sonnerToast.success("Stack added to cart", {
      description: `${matchedProducts.length} product${matchedProducts.length === 1 ? "" : "s"} from your protocol.`,
    });
  };

  const totalSteps = quizSteps.length;
  const isQuiz = step < totalSteps;
  const isLeadCapture = step === totalSteps;
  const showResults = step > totalSteps;

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) return;

    setLoading(true);
    setError(null);
    setStep(totalSteps + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-protocol", {
        body: { answers, leadName: lead.name },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.protocol) throw new Error("No protocol received");

      setAiProtocol(data.protocol);

      // Push to Nocobase CRM with quiz tags + goal
      const { captureLead } = await import("@/lib/nocobase");
      const goalTag = answers.goal ? [`goal:${answers.goal}`] : [];
      captureLead({
        source: "quiz",
        email: lead.email,
        extraTags: goalTag,
        extra: {
          name: lead.name,
          whatsapp: lead.whatsapp,
          answers,
          protocol_summary: data.protocol?.summary ?? null,
        },
      });
    } catch (err) {
      console.error("Protocol generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate your protocol. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== QUIZ STEPS =====================
  if (isQuiz) {
    const current = quizSteps[step];
    const progress = ((step + 1) / (totalSteps + 1)) * 100;

    return (
      <>
        <SEO title="Free Peptide Protocol Quiz — Personalized Stack" description="Take our 6-step quiz and get a personalized peptide protocol recommendation reviewed by a GP. Available across South Africa. Free, 2 minutes." path="/quiz" />
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Free Quiz", href: "/quiz" }]} />
        <div className="flex min-h-[80vh] flex-col">
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-4 px-4 py-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-hero-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {step + 1} / {totalSteps + 1}
            </span>
          </div>
        </div>

        <div className="container flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
            {current.question}
          </h2>
          <div className="grid w-full max-w-2xl gap-3">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(current.key, opt.value)}
                className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card p-4 text-left shadow-card transition-all hover:border-primary hover:shadow-card-hover active:scale-[0.98] sm:p-5"
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-display text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
                    {opt.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{opt.desc}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
      </>
    );
  }

  // ===================== LEAD CAPTURE =====================
  if (isLeadCapture) {
    const progress = ((totalSteps + 1) / (totalSteps + 1)) * 100;

    return (
      <div className="flex min-h-[80vh] flex-col">
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-4 px-4 py-4">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-hero-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Almost there!</span>
          </div>
        </div>

        <div className="container flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Your AI Protocol Is Ready!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Our AI will analyze your answers and create a personalized peptide protocol tailored to your goals.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> AI Powered
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
                  <span className="text-xs text-muted-foreground">(optional)</span>
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                <Sparkles className="h-4 w-4" /> Get Personalized Recommendations
              </button>
              <p className="text-center text-xs text-muted-foreground">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===================== LOADING STATE =====================
  if (showResults && loading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Creating Your Protocol...
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our AI is analyzing your answers and building a personalized peptide protocol.
          </p>
          <div className="mt-6 space-y-2">
            {["Analyzing your goals & lifestyle", "Selecting optimal peptides", "Calculating dosing & schedule", "Preparing your recommendation"].map((t, i) => (
              <p key={i} className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                <Sparkles className="h-3 w-3 text-primary" /> {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===================== ERROR STATE =====================
  if (showResults && error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Something Went Wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                supabase.functions.invoke("generate-protocol", {
                  body: { answers, leadName: lead.name },
                }).then(({ data, error: fnError }) => {
                  if (fnError || data?.error || !data?.protocol) {
                    setError("Failed to generate protocol. Please try again.");
                  } else {
                    setAiProtocol(data.protocol);
                  }
                  setLoading(false);
                });
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

  // ===================== AI RESULTS PAGE =====================
  if (!aiProtocol) return null;

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-trust" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      <div className="container px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* AI Badge + Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Bot className="h-3.5 w-3.5" /> AI Recommendations
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px]">AI Powered</span>
            </div>
            {lead.name && (
              <p className="text-base font-medium text-foreground mb-1">
                {lead.name}, here's your personalized protocol
              </p>
            )}
            <h1 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {aiProtocol.protocolName}
            </h1>
            <p className="mt-1 text-base text-muted-foreground sm:text-lg">{aiProtocol.subtitle}</p>
          </div>

          {/* Why it fits */}
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
              Why This Protocol Fits You
            </h3>
            <p className="text-sm text-muted-foreground">{aiProtocol.whyFits}</p>
          </div>

          {/* Peptide Stack */}
          {aiProtocol.peptides && aiProtocol.peptides.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
                Your Peptide Stack
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

          {/* Recommended Stack — drives quiz takers into the shop */}
          {matchedProducts.length > 0 && (
            <div className="mb-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background p-5 shadow-glow sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Ready to start
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">
                    Your recommended stack
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {matchedProducts.length} product{matchedProducts.length === 1 ? "" : "s"} matched to your protocol.
                  </p>
                </div>
                <span className="rounded-full bg-trust/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-trust">
                  In stock
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

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={addStackToCart}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-hero-gradient px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <ShoppingCart className="h-4 w-4" /> Add stack to cart
                </button>
                <Link
                  to={`/shop?stack=${matchedProducts.map((p) => p.id).join(",")}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  View stack in shop <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}


          {/* Expected Results */}
          {aiProtocol.expectedResults && aiProtocol.expectedResults.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
                Expected Results
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
            <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
              <h3 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
                Weekly Schedule
              </h3>
              <p className="text-sm text-muted-foreground">{aiProtocol.weeklySchedule}</p>
            </div>
          )}

          {/* What's Included */}
          {aiProtocol.included && aiProtocol.included.length > 0 && (
            <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
              <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
                What's Included
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
            <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
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

          {/* Pricing */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-border bg-background p-6 text-center shadow-card">
              <p className="text-sm font-medium text-muted-foreground">Monthly</p>
              <p className="mt-1 font-display text-3xl font-bold text-foreground">
                {aiProtocol.monthlyPrice}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Duration: {aiProtocol.duration}</p>
              <a
                href={waLink(`Hi, I'm ${lead.name || "interested"}. I'd like to start the monthly ${aiProtocol.protocolName} plan.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-muted"
              >
                Start Monthly
              </a>
            </div>
            <div className="relative rounded-2xl border-2 border-primary bg-background p-6 text-center shadow-glow">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
                BEST VALUE
              </span>
              <p className="text-sm font-medium text-muted-foreground">Full Program</p>
              <p className="mt-1 font-display text-3xl font-bold text-gradient">
                {aiProtocol.fullPrice}
              </p>
              <p className="mt-1 text-xs font-semibold text-trust">{aiProtocol.savings}</p>
              <a
                href={waLink(`Hi, I'm ${lead.name || "interested"}. I'd like to start the full ${aiProtocol.protocolName} program.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Start My Protocol <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Zoom Consultation Booking */}
          <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 text-center sm:p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
              Book Your Free Consultation
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Schedule a 1-on-1 video consultation with our peptide specialist to review your personalized protocol and answer any questions.
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
          <div className="mb-8 rounded-2xl border border-trust/30 bg-trust/5 p-5 text-center sm:p-6">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-trust" />
            <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
              Prefer to Chat? We're Here
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team is ready to help you get started. No pressure, no commitment.
            </p>
            <a
              href={waLink(`Hi, I'm ${lead.name || "interested"}. I just got my AI protocol recommendation (${aiProtocol.protocolName}) and have some questions.`)}
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
              <Shield className="h-4 w-4 text-trust" /> German Certified
            </span>
            <span className="flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-primary" /> AI Personalized
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-trust" /> Guided Support
            </span>
          </div>

          {/* Retake */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
                setLead({ name: "", email: "", whatsapp: "" });
                setAiProtocol(null);
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
