import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const WA_NUMBER = "491624747159";
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
      { value: "starter", label: "Under R1,500/month", icon: "💰", desc: "Focused, essential protocol" },
      { value: "standard", label: "R1,500 – R2,500/month", icon: "⭐", desc: "Comprehensive guided program" },
      { value: "premium", label: "R2,500+/month", icon: "👑", desc: "Full protocol with premium support" },
    ],
  },
];

const protocols: Record<string, {
  title: string;
  subtitle: string;
  duration: string;
  monthlyPrice: string;
  fullPrice: string;
  savings: string;
  whyFits: string;
  timeline: string;
  included: string[];
  results: { icon: typeof Flame; label: string }[];
}> = {
  "fat-loss": {
    title: "12-Week Fat Loss Protocol",
    subtitle: "Personalized Metabolic Transformation",
    duration: "12 Weeks",
    monthlyPrice: "R1,999",
    fullPrice: "R4,999",
    savings: "Save R997",
    whyFits: "Based on your answers, you're an ideal candidate for our metabolic optimization protocol. Your goal of targeted fat loss, combined with your current lifestyle, means you'll see measurable results within the first 3 weeks.",
    timeline: "Most clients see visible changes by week 3, with significant transformation by week 8–12.",
    included: [
      "Personalized fat loss protocol plan",
      "Monthly guided supply",
      "Weekly check-ins & progress reviews",
      "Dosing schedule & timing guide",
      "WhatsApp support access",
      "Progress tracking",
    ],
    results: [
      { icon: Flame, label: "Visceral fat reduction" },
      { icon: Heart, label: "Improved metabolic health" },
      { icon: Sparkles, label: "Clearer skin & more energy" },
      { icon: Dumbbell, label: "Better body composition" },
    ],
  },
  recovery: {
    title: "Recovery & Performance Stack",
    subtitle: "Athletic Regeneration System",
    duration: "8–12 Weeks",
    monthlyPrice: "R2,199",
    fullPrice: "R5,499",
    savings: "Save R1,098",
    whyFits: "Your focus on recovery and performance makes this protocol perfect for you. It's designed to accelerate healing, reduce downtime, and unlock a new level of athletic output.",
    timeline: "Expect noticeable recovery improvements within 1–2 weeks, with peak performance gains by week 6–8.",
    included: [
      "Personalized recovery protocol plan",
      "Monthly guided supply",
      "Weekly performance check-ins",
      "Training integration guide",
      "WhatsApp support access",
      "Recovery tracking dashboard",
    ],
    results: [
      { icon: Dumbbell, label: "Faster muscle recovery" },
      { icon: Heart, label: "Accelerated injury healing" },
      { icon: Flame, label: "Enhanced performance output" },
      { icon: Sparkles, label: "Improved sleep & well-being" },
    ],
  },
  both: {
    title: "Full Transformation Protocol",
    subtitle: "Complete Body Recomposition System",
    duration: "12 Weeks",
    monthlyPrice: "R2,499",
    fullPrice: "R5,999",
    savings: "Save R1,498",
    whyFits: "You want it all — fat loss AND performance. This comprehensive protocol combines metabolic optimization with recovery enhancement for a complete body transformation.",
    timeline: "Fat loss begins week 2–3, recovery improvements from week 1, full transformation visible by week 10–12.",
    included: [
      "Comprehensive transformation protocol",
      "Monthly guided supply (dual protocol)",
      "Twice-weekly check-ins",
      "Nutrition & training integration",
      "Priority WhatsApp support",
      "Full progress tracking suite",
    ],
    results: [
      { icon: Flame, label: "Significant fat loss" },
      { icon: Dumbbell, label: "Muscle & performance gains" },
      { icon: Heart, label: "Complete body recomposition" },
      { icon: Sparkles, label: "Energy, skin, sleep improvement" },
    ],
  },
};

export default function QuizFunnelPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [lead, setLead] = useState<LeadInfo>({ name: "", email: "", whatsapp: "" });
  const [leadCaptured, setLeadCaptured] = useState(false);

  const totalSteps = quizSteps.length;
  // step 0..5 = quiz, step 6 = lead capture, step 7 = results
  const isQuiz = step < totalSteps;
  const isLeadCapture = step === totalSteps;
  const showResults = step > totalSteps;

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) return;
    setLeadCaptured(true);
    setStep(totalSteps + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goalKey = answers.goal === "recovery" ? "recovery" : answers.goal === "both" ? "both" : "fat-loss";
  const protocol = protocols[goalKey];

  // ===================== QUIZ STEPS =====================
  if (isQuiz) {
    const current = quizSteps[step];
    const progress = ((step + 1) / (totalSteps + 1)) * 100;

    return (
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
            <span className="text-sm font-medium text-muted-foreground">
              Almost there!
            </span>
          </div>
        </div>

        <div className="container flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Your Protocol Is Ready!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your details below to see your personalized recommendation and receive your protocol guide.
              </p>
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
                See My Protocol <ArrowRight className="h-4 w-4" />
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

  // ===================== RESULTS PAGE =====================
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
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust/10">
              <CheckCircle className="h-8 w-8 text-trust" />
            </div>
            {leadCaptured && lead.name && (
              <p className="text-base font-medium text-foreground mb-1">
                {lead.name}, here's your personalized protocol
              </p>
            )}
            <h1 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {protocol.title}
            </h1>
            <p className="mt-1 text-base text-muted-foreground sm:text-lg">{protocol.subtitle}</p>
          </div>

          {/* Why it fits */}
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <h3 className="mb-2 font-display text-base font-semibold text-foreground sm:text-lg">
              Why This Protocol Fits You
            </h3>
            <p className="text-sm text-muted-foreground">{protocol.whyFits}</p>
          </div>

          {/* Expected Results */}
          <div className="mb-8">
            <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
              What Results to Expect
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {protocol.results.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{r.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Clock className="mb-0.5 mr-1 inline h-3 w-3" />
              {protocol.timeline}
            </p>
          </div>

          {/* What's Included */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h3 className="mb-4 font-display text-base font-semibold text-foreground sm:text-lg">
              What's Included
            </h3>
            <ul className="space-y-3">
              {protocol.included.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-trust" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-border bg-background p-6 text-center shadow-card">
              <p className="text-sm font-medium text-muted-foreground">Monthly</p>
              <p className="mt-1 font-display text-3xl font-bold text-foreground">
                {protocol.monthlyPrice}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Duration: {protocol.duration}</p>
              <a
                href={waLink(`Hi, I'm ${lead.name || "interested"}. I'd like to start the monthly ${protocol.title} plan.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-muted"
              >
                Get Started
              </a>
            </div>
            <div className="relative rounded-2xl border-2 border-primary bg-background p-6 text-center shadow-glow">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
                BEST VALUE
              </span>
              <p className="text-sm font-medium text-muted-foreground">Full Program</p>
              <p className="mt-1 font-display text-3xl font-bold text-gradient">
                {protocol.fullPrice}
              </p>
              <p className="mt-1 text-xs font-semibold text-trust">{protocol.savings}</p>
              <a
                href={waLink(`Hi, I'm ${lead.name || "interested"}. I'd like to start the full ${protocol.title} program.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Start My Protocol <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="mb-8 rounded-2xl border border-trust/30 bg-trust/5 p-5 text-center sm:p-6">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-trust" />
            <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
              Have Questions? Chat With Us
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team is ready to help you get started. No pressure, no commitment.
            </p>
            <a
              href={waLink("Hi, I just completed the quiz and have some questions about my protocol.")}
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
              <CheckCircle className="h-4 w-4 text-trust" /> Personalized Protocol
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
                setLeadCaptured(false);
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
