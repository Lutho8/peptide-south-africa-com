import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, ArrowLeft, Shield, FlaskConical, Truck, Star, Zap } from "lucide-react";
import heroImg1 from "@/assets/funnel-hero-1.jpg";
import heroImg2 from "@/assets/funnel-hero-2.jpg";
import heroImg3 from "@/assets/funnel-hero-3.jpg";
import heroImg4 from "@/assets/funnel-hero-4.jpg";
import heroImg5 from "@/assets/funnel-hero-5.jpg";

interface QuizAnswer {
  goal?: string;
  experience?: string;
  timeline?: string;
  concern?: string;
}

const protocols: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  products: { name: string; slug: string; why: string }[];
  duration: string;
  price: string;
}> = {
  "fat-loss": {
    title: "12-Week Fat Loss Protocol",
    subtitle: "Metabolic Optimization Stack",
    description: "A science-backed protocol combining GLP-1 pathway agonists with metabolic peptides for sustainable body composition research. Trusted by researchers studying visceral fat reduction and metabolic homeostasis.",
    products: [
      { name: "RT3 (Reta) – 10mg", slug: "rt3-reta", why: "Triple receptor agonist for comprehensive metabolic pathway activation" },
      { name: "TZ-2 (Tirz) – 10mg", slug: "tz2-tirz", why: "Dual GIP/GLP-1 agonist for glucose homeostasis and appetite regulation" },
      { name: "MOTS-C – 10mg", slug: "mots-c", why: "Mitochondrial peptide for fatty acid oxidation and insulin sensitivity" },
    ],
    duration: "12 Weeks",
    price: "From R1,476",
  },
  "recovery": {
    title: "Recovery & Performance Stack",
    subtitle: "Athletic Regeneration Protocol",
    description: "Engineered for researchers studying tissue repair, recovery optimization, and athletic performance. Combines healing peptides with growth hormone secretagogues for comprehensive regeneration research.",
    products: [
      { name: "BPC/TB-500 Blend – 20mg", slug: "bpc-tb500-blend", why: "Synergistic tissue repair and anti-inflammatory pathways" },
      { name: "Tesamorelin – 10mg", slug: "tesamorelin", why: "GH secretion stimulation for body composition and recovery" },
      { name: "MOTS-C – 10mg", slug: "mots-c", why: "Exercise physiology and metabolic homeostasis support" },
    ],
    duration: "8–12 Weeks",
    price: "From R2,214",
  },
};

const quizSteps = [
  {
    question: "What's your primary research goal?",
    key: "goal" as const,
    options: [
      { value: "fat-loss", label: "Fat Loss & Metabolic Optimization", icon: "🔥", desc: "GLP-1 pathway, body recomposition, visceral fat reduction" },
      { value: "recovery", label: "Recovery & Athletic Performance", icon: "💪", desc: "Tissue repair, muscle recovery, growth hormone support" },
    ],
  },
  {
    question: "What's your experience level with peptide research?",
    key: "experience" as const,
    options: [
      { value: "beginner", label: "I'm New to This", icon: "🌱", desc: "Looking for guidance and a clear protocol" },
      { value: "intermediate", label: "Some Experience", icon: "📊", desc: "Familiar with reconstitution and dosing basics" },
      { value: "advanced", label: "Experienced Researcher", icon: "🔬", desc: "Looking for advanced stacks and optimization" },
    ],
  },
  {
    question: "What's your ideal research timeline?",
    key: "timeline" as const,
    options: [
      { value: "4-weeks", label: "4 Weeks (Quick Study)", icon: "⚡", desc: "Short-term pilot research" },
      { value: "8-weeks", label: "8 Weeks (Standard)", icon: "📅", desc: "Standard research cycle" },
      { value: "12-weeks", label: "12 Weeks (Full Protocol)", icon: "🎯", desc: "Comprehensive long-term study" },
    ],
  },
  {
    question: "What matters most to you?",
    key: "concern" as const,
    options: [
      { value: "purity", label: "Purity & Lab Testing", icon: "🧪", desc: "COA verification and third-party testing" },
      { value: "price", label: "Value for Money", icon: "💰", desc: "Best results without overpaying" },
      { value: "support", label: "Guidance & Protocols", icon: "📋", desc: "Step-by-step research support" },
    ],
  },
];

export default function QuizFunnelPage() {
  const [step, setStep] = useState(-1); // -1 = landing, 0-3 = quiz, 4 = results
  const [answers, setAnswers] = useState<QuizAnswer>({});

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < quizSteps.length - 1) {
      setStep(step + 1);
    } else {
      setStep(quizSteps.length); // results
    }
  };

  const protocol = protocols[answers.goal || "fat-loss"];

  // Landing / Hero state
  if (step === -1) {
    return (
      <div className="flex flex-col">
        {/* Hero Section — MEDVi-inspired */}
        <section className="relative overflow-hidden bg-[hsl(35,30%,95%)]">
          <div className="container relative z-10 pb-8 pt-12 text-center md:pt-20">
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Finally serious about your health?{" "}
              <span className="text-gradient">Transform your body</span>{" "}
              with science-backed peptide protocols
            </h1>

            <div className="mx-auto mt-10 max-w-lg space-y-4 text-left">
              {[
                "Lose stubborn fat with GLP-1 pathway peptides",
                "Lab-tested, ≥99% purity guaranteed",
                "No guesswork — full protocol included",
                "Start from just R450, SA domestic shipping",
                "Trusted by 500+ researchers nationwide",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-trust" />
                  <span className="text-base text-foreground">
                    {item.includes("R450") ? (
                      <>
                        <strong>Start from just R450</strong>, SA domestic shipping
                      </>
                    ) : item.includes("No guesswork") ? (
                      <>
                        <strong>No guesswork</strong> — full protocol included
                      </>
                    ) : (
                      item
                    )}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(0)}
              className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--foreground))] px-10 py-4 text-lg font-semibold text-[hsl(var(--background))] shadow-lg transition-all hover:opacity-90 active:scale-95"
            >
              FIND MY PROTOCOL
            </button>
            <p className="mt-3 text-sm text-muted-foreground">Takes 30 seconds · No commitment required</p>
          </div>

          {/* Photo Grid */}
          <div className="relative mx-auto max-w-6xl px-4 pb-16">
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              <div className="col-span-1 row-span-2 overflow-hidden rounded-2xl">
                <img src={heroImg1} alt="Happy researcher" className="h-full w-full object-cover" width={640} height={800} />
              </div>
              <div className="col-span-1 overflow-hidden rounded-2xl">
                <img src={heroImg2} alt="Confident woman" className="h-full w-full object-cover" loading="lazy" width={640} height={800} />
              </div>
              <div className="col-span-1 overflow-hidden rounded-2xl">
                <img src={heroImg4} alt="Happy man" className="h-full w-full object-cover" loading="lazy" width={640} height={800} />
              </div>
              <div className="col-span-1 overflow-hidden rounded-2xl">
                <img src={heroImg3} alt="Silver-haired woman" className="h-full w-full object-cover" loading="lazy" width={640} height={800} />
              </div>
              <div className="col-span-1 row-span-2 overflow-hidden rounded-2xl">
                <img src={heroImg5} alt="Celebrating woman" className="h-full w-full object-cover" loading="lazy" width={640} height={800} />
              </div>
              <div className="col-span-3 overflow-hidden rounded-2xl">
                <div className="flex h-full items-center justify-center bg-card p-6 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-badge">
                      {Array(5).fill(null).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                    </div>
                    <p className="mt-2 font-display text-lg font-semibold text-foreground">"Changed my entire research approach"</p>
                    <p className="mt-1 text-sm text-muted-foreground">— Dr. M. Chen, Research Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="border-y border-border bg-card py-8">
          <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: FlaskConical, label: "Lab Tested", sub: "Third-party verified" },
              { icon: Shield, label: "≥99% Purity", sub: "Every batch certified" },
              { icon: Truck, label: "SA Shipping", sub: "1-3 business days" },
              { icon: Zap, label: "Full Protocols", sub: "Step-by-step guides" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Why Researchers Choose Us</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Not Just a Store — A Research Partner</h2>
            <p className="mt-4 text-muted-foreground">
              We don't just sell peptides. We provide complete research protocols, dosing guides, and ongoing support.
              Every product ships with a Certificate of Analysis and detailed documentation.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { stat: "500+", label: "Active Researchers", desc: "Trust our products for their work" },
              { stat: "≥99%", label: "Purity Guaranteed", desc: "Every batch lab-tested with COA" },
              { stat: "1-3", label: "Day Delivery", desc: "Fast SA domestic shipping" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
                <p className="font-display text-4xl font-bold text-gradient">{item.stat}</p>
                <p className="mt-2 font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-hero-gradient py-16">
          <div className="container text-center">
            <h2 className="font-display text-3xl font-bold text-primary-foreground">Find Your Perfect Protocol in 30 Seconds</h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
              Answer 4 quick questions and get a personalized peptide protocol tailored to your research goals.
            </p>
            <button
              onClick={() => { setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-10 py-4 text-lg font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
            >
              START THE QUIZ <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Quiz Steps
  if (step < quizSteps.length) {
    const current = quizSteps[step];
    const progress = ((step + 1) / quizSteps.length) * 100;

    return (
      <div className="flex min-h-[80vh] flex-col">
        {/* Progress */}
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-4 py-4">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-hero-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {step + 1} / {quizSteps.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="container flex flex-1 flex-col items-center justify-center py-12">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
            {current.question}
          </h2>
          <div className="grid w-full max-w-2xl gap-4">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(current.key, opt.value)}
                className="group flex items-start gap-4 rounded-xl border-2 border-border bg-card p-5 text-left shadow-card transition-all hover:border-primary hover:shadow-card-hover active:scale-[0.98]"
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-foreground group-hover:text-primary">{opt.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{opt.desc}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-trust" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust/10">
              <CheckCircle className="h-8 w-8 text-trust" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Your Personalized Protocol</span>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{protocol.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{protocol.subtitle}</p>
          </div>

          {/* Protocol Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <p className="mb-6 text-muted-foreground">{protocol.description}</p>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-display text-lg font-bold text-foreground">{protocol.duration}</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Starting At</p>
                <p className="font-display text-lg font-bold text-gradient">{protocol.price}</p>
              </div>
            </div>

            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Recommended Products</h3>
            <div className="space-y-4">
              {protocol.products.map((p, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border border-border bg-background p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <Link to={`/product/${p.slug}`} className="font-semibold text-foreground hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{p.why}</p>
                  </div>
                  <Link
                    to={`/product/${p.slug}`}
                    className="flex-shrink-0 rounded-lg bg-hero-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-8 py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              Shop Full Catalog <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => { setStep(-1); setAnswers({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 font-semibold text-foreground transition-all hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Retake Quiz
            </button>
          </div>

          {/* Trust Footer */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-trust" /> Lab Tested</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-trust" /> ≥99% Purity</span>
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-trust" /> SA Domestic Shipping</span>
            <span className="flex items-center gap-1.5"><FlaskConical className="h-4 w-4 text-trust" /> COA Included</span>
          </div>
        </div>
      </div>
    </div>
  );
}
