import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Star,
  Clock,
  MessageCircle,
  Flame,
  Heart,
  Sparkles,
  Dumbbell,
  Target,
  Users,
  Award,
  Activity,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const WA_NUMBER = "491624747159";
const waLink = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

/* ─── BMI Calculator ─── */
function BMICalculator() {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const bmi = weight / ((height / 100) ** 2);
  const bmiFixed = bmi.toFixed(1);

  const categories = [
    { label: "Underweight", range: "< 18.5", color: "bg-blue-400", min: 0, max: 18.5 },
    { label: "Normal", range: "18.5 – 24.9", color: "bg-trust", min: 18.5, max: 25 },
    { label: "Pre-obesity", range: "25 – 29.9", color: "bg-yellow-400", min: 25, max: 30 },
    { label: "Obese I", range: "30 – 34.9", color: "bg-orange-400", min: 30, max: 35 },
    { label: "Obese II", range: "35 – 39.9", color: "bg-red-400", min: 35, max: 40 },
    { label: "Obese III", range: "40+", color: "bg-red-600", min: 40, max: 60 },
  ];

  const activeCategory = categories.find((c) => bmi >= c.min && bmi < c.max) || categories[5];

  const descriptions: Record<string, string> = {
    Underweight: "A BMI below 18.5 may indicate being underweight. Consider consulting a healthcare provider.",
    Normal: "A BMI between 18.5 and 24.9 is considered healthy. Maintain your balanced lifestyle!",
    "Pre-obesity": "A BMI between 25 and 29.9 means a higher risk of developing obesity. Our protocol can help.",
    "Obese I": "A BMI of 30–34.9 indicates mild obesity. Our 12-Week Fat Loss Protocol is designed for you.",
    "Obese II": "A BMI of 35–39.9 indicates moderate obesity. A structured protocol can significantly improve your health.",
    "Obese III": "A BMI of 40+ indicates severe obesity. Professional guidance is strongly recommended.",
  };

  return (
    <SEO title="Peptide Fat Loss Protocol South Africa — GLP-1 Therapy" description="12-week GP-led fat loss protocol using Retatrutide and Tirzepatide. Includes BMI calculator, dosing guide, and physician oversight. South Africa." path="/fat-loss-protocol" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Height</label>
            <span className="text-sm font-semibold text-foreground">{height} cm</span>
          </div>
          <input
            type="range"
            min={140}
            max={220}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Weight</label>
            <span className="text-sm font-semibold text-foreground">{weight} kg</span>
          </div>
          <input
            type="range"
            min={40}
            max={200}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Your BMI Is:</p>
          <p className="font-display text-4xl font-bold text-foreground">{bmiFixed}</p>
        </div>

        <div className="flex overflow-hidden rounded-lg">
          {categories.map((c) => (
            <div
              key={c.label}
              className={`flex-1 py-2 text-center text-[10px] font-semibold text-white sm:text-xs ${c.color} ${
                activeCategory.label === c.label ? "ring-2 ring-foreground ring-offset-2" : ""
              }`}
            >
              {c.label}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {descriptions[activeCategory.label]}
        </p>
      </div>
    </div>
  );
}

/* ─── FAQ Accordion ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="pr-4 font-display text-sm font-semibold text-foreground sm:text-base">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

/* ─── Main Page ─── */
export default function FatLossProtocolPage() {
  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="bg-hero-gradient py-16 sm:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl leading-tight">
              12-Week Fat Loss Protocol
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg md:text-xl">
              Receive a personalised fat loss plan and guided support designed for your body, goals, and lifestyle.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 active:scale-95"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> German Certified</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 500+ Active Clients</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> Personalised Approach</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-border bg-card py-4">
        <div className="container flex flex-wrap items-center justify-center gap-6 px-4 text-xs text-muted-foreground sm:text-sm">
          <span>✓ No Hidden Fees</span>
          <span>✓ Guided Support Included</span>
          <span>✓ Personalised Protocol</span>
          <span>✓ Results-Focused</span>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-16 sm:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              What's Included in Your Protocol
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              Everything you need for a complete fat loss transformation, guided by experts.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Target, title: "Personalised Protocol Plan", desc: "Custom-designed based on your body composition, goals, and lifestyle assessment." },
                { icon: Activity, title: "Monthly Guided Supply", desc: "Your protocol supply delivered monthly with clear dosing and timing instructions." },
                { icon: MessageCircle, title: "WhatsApp Support", desc: "Direct access to your protocol advisor for questions and guidance throughout." },
                { icon: Clock, title: "Weekly Check-ins", desc: "Regular progress reviews to track results and optimise your protocol." },
                { icon: TrendingDown, title: "Progress Tracking", desc: "Monitor your body composition, energy, and performance metrics over time." },
                { icon: Award, title: "Nutrition Guidance", desc: "Simple dietary recommendations to maximise your protocol results." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BMI CALCULATOR */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20" id="bmi-calculator">
        <div className="container px-4">
          <div className="mx-auto max-w-lg">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Weight Loss Calculator (BMI)
            </h2>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Calculate your Body Mass Index to understand where you stand and how our protocol can help.
            </p>
            <div className="mt-8">
              <BMICalculator />
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Get Your Personalised Plan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="py-16 sm:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              How We Work
            </h2>
            <div className="mt-10 space-y-8">
              {[
                { step: "1", title: "Take the Assessment", desc: "Complete a short quiz about your goals, lifestyle, and health background. This takes less than 3 minutes." },
                { step: "2", title: "Get Your Personalised Protocol", desc: "Based on your assessment, we design a custom fat loss protocol tailored to your body composition and objectives." },
                { step: "3", title: "Start Your Guided Transformation", desc: "Begin your protocol with ongoing support, weekly check-ins, and progress tracking to ensure you stay on track." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 sm:gap-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-hero-gradient text-lg font-bold text-white">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING — MEDVi Style Consultation Tiers */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20" id="pricing">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Manage Your Weight With Us
            </h2>
            <p className="mt-3 text-center text-muted-foreground">Choose the plan that fits your transformation goals.</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {/* Introductory */}
              <div className="rounded-2xl border-2 border-border bg-card p-6 text-center shadow-card">
                <h3 className="font-display text-base font-bold text-foreground">Introductory Consultation</h3>
                <p className="mt-3 font-display text-3xl font-bold text-foreground">R1,495</p>
                <div className="mx-auto my-4 h-px w-12 bg-primary" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Begin your fat loss journey with a comprehensive health assessment. Receive a personalised protocol plan designed for your body and goals.
                </p>
                <a
                  href={waLink("Hi, I'd like to book an Introductory Consultation for the 12-Week Fat Loss Protocol.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
                >
                  Book a Consultation
                </a>
              </div>

              {/* Package — highlighted */}
              <div className="relative rounded-2xl border-2 border-primary bg-card p-6 text-center shadow-glow">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-gradient px-4 py-1 text-xs font-bold text-white">
                  BEST VALUE
                </span>
                <h3 className="font-display text-base font-bold text-foreground">Full 12-Week Protocol</h3>
                <p className="mt-3 font-display text-3xl font-bold text-gradient">R4,999</p>
                <div className="mx-auto my-4 h-px w-12 bg-primary" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save R997 with the full program. Includes initial assessment, 12 weeks of guided supply, weekly check-ins, and priority WhatsApp support.
                </p>
                <a
                  href={waLink("Hi, I'd like to start the Full 12-Week Fat Loss Protocol program.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
                >
                  Book a Consultation
                </a>
              </div>

              {/* Follow-up */}
              <div className="rounded-2xl border-2 border-border bg-card p-6 text-center shadow-card">
                <h3 className="font-display text-base font-bold text-foreground">Follow-up Consultation</h3>
                <p className="mt-3 font-display text-3xl font-bold text-foreground">R995</p>
                <div className="mx-auto my-4 h-px w-12 bg-primary" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Maintain your progress with regular check-ins. Track your goals and adjust your protocol for continued success.
                </p>
                <a
                  href={waLink("Hi, I'd like to book a Follow-up Consultation for my fat loss protocol.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
                >
                  Book a Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — MEDVi Style */}
      <section className="py-16 sm:py-20" id="benefits">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Benefits of Our Fat Loss Programs
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Qualified Protocol Advisors", desc: "Work with experienced advisors who design evidence-based fat loss protocols tailored to your unique body composition." },
                { title: "Personalised Guidance", desc: "Every protocol is tailored to your goals, lifestyle, and health needs — no generic plans." },
                { title: "Ongoing Monitoring", desc: "Regular check-ins help us spot and manage any concerns, adjusting your protocol for optimal results." },
              ].map((b) => (
                <div key={b.title} className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
                  <h3 className="font-display text-sm font-bold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Comprehensive Fat Loss Plans", desc: "Beyond protocols, we guide you on nutrition, exercise, and stress management for improved well-being." },
                { title: "Accountability & Support", desc: "We track your results and adjust your plan as needed. You'll never feel lost or unsupported." },
              ].map((b) => (
                <div key={b.title} className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
                  <h3 className="font-display text-sm font-bold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPECTED RESULTS */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              What Results to Expect
            </h2>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Protocols can lead to significant improvements when combined with a balanced lifestyle.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Flame, label: "Visceral Fat Reduction" },
                { icon: Heart, label: "Improved Metabolic Health" },
                { icon: Sparkles, label: "Clearer Skin & Hair Growth" },
                { icon: Dumbbell, label: "Better Body Composition" },
              ].map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{r.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
              <h3 className="font-display text-base font-semibold text-foreground">Expected Timeline</h3>
              <div className="mt-4 space-y-3">
                {[
                  { week: "Week 1–2", result: "Increased energy, reduced bloating, improved sleep quality" },
                  { week: "Week 3–4", result: "Visible fat reduction, improved body composition beginning" },
                  { week: "Week 5–8", result: "Significant fat loss, better recovery, clearer skin" },
                  { week: "Week 9–12", result: "Full transformation — measurable fat loss, performance gains, sustained results" },
                ].map((t) => (
                  <div key={t.week} className="flex gap-3">
                    <span className="w-20 flex-shrink-0 text-xs font-bold text-primary">{t.week}</span>
                    <span className="text-xs text-muted-foreground">{t.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ASSESSMENT STEPS */}
      <section className="py-16 sm:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
              Start With a Fat Loss Assessment
            </h2>
            <div className="mt-10 space-y-6">
              {[
                { n: "1", title: "Answer a health questionnaire", desc: "Covering your fat loss goals, preferences, lifestyle, and experience." },
                { n: "2", title: "Review your health background", desc: "We ask about allergies, current supplements, and your fat loss history to ensure safety." },
                { n: "3", title: "Evaluate physical health", desc: "Understand if there are physical factors related to weight fluctuations such as metabolic issues." },
                { n: "4", title: "Measure your BMI", desc: "Body Mass Index helps us analyse overweight risk and design an appropriate protocol intensity." },
                { n: "5", title: "Analyse diet & activity level", desc: "Your diet and routines help us develop a comprehensive plan alongside the protocol." },
                { n: "6", title: "Assess readiness & commitment", desc: "Understanding your readiness ensures we match you with the right program duration and support level." },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Get Your Fat Loss Plan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS WORKS */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Achieve Your Fat Loss Goal?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              Everything is possible with the right guidance. We ensure a personalised approach to the fat loss journey for each and every client.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              Tips like "eat less and exercise more" may not be enough.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              At Ride The Tide, we focus on an integrative approach to fat loss management. We aim to help you achieve your ideal body composition and maintain the results.
            </p>
            <div className="mt-8">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Start Your Transformation Today <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 sm:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-lg rounded-2xl border border-trust/30 bg-trust/5 p-6 text-center sm:p-8">
            <MessageCircle className="mx-auto mb-3 h-8 w-8 text-trust" />
            <h3 className="font-display text-lg font-semibold text-foreground">Have Questions? Chat With Us</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team is ready to help you get started. No pressure, no commitment.
            </p>
            <a
              href={waLink("Hi, I have some questions about the 12-Week Fat Loss Protocol.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-trust px-6 py-3 font-semibold text-trust-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20" id="faq">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">FAQ</h2>
            <div className="mt-8">
              <FAQItem q="Is the fat loss protocol safe?" a="Yes. All protocols are designed by qualified advisors using German-certified compounds. Your health background is assessed before any protocol is recommended. We monitor your progress throughout and adjust as needed." />
              <FAQItem q="How much weight can I expect to lose?" a="Most clients experience 5–10 kg of fat loss over the 12-week protocol when combined with a balanced diet and moderate activity. Individual results vary based on starting point, adherence, and lifestyle factors." />
              <FAQItem q="What if I hit a plateau?" a="Plateaus are normal. Our weekly check-ins allow us to identify stalls early and adjust your protocol, nutrition guidance, or activity recommendations to keep progress moving." />
              <FAQItem q="Do I need to follow a strict diet?" a="No strict diets required. We provide simple, sustainable nutrition guidance that complements your protocol. The focus is on building healthy habits, not extreme restriction." />
              <FAQItem q="Can I exercise during the protocol?" a="Absolutely. Moderate exercise is encouraged and can enhance results. We'll provide activity recommendations suited to your fitness level and protocol." />
              <FAQItem q="How do I get my monthly supply?" a="Your protocol supply is delivered monthly via discreet packaging. We handle everything — you just follow the guided schedule provided." />
              <FAQItem q="What happens after 12 weeks?" a="After completing the protocol, you can book a follow-up consultation to assess maintenance, continue with an extended protocol, or transition to our Recovery & Performance stack." />
              <FAQItem q="Is this available across South Africa?" a="Yes. We serve clients across South Africa including Cape Town, Johannesburg, Durban, and Pretoria. Everything is managed remotely via WhatsApp." />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-hero-gradient py-16 sm:py-20">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Start Your 12-Week Fat Loss Transformation
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
            Join 500+ clients who've transformed their health with a personalised, guided protocol.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 active:scale-95"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> German Certified</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Personalised Protocol</span>
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3" /> Guided Support</span>
          </div>
        </div>
      </section>
    </div>
  );
}
