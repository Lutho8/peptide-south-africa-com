import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  ArrowRight, DollarSign, Clock, Gift, Megaphone, Users, Award,
  Wallet, ShieldCheck, TrendingUp, MessageCircle, Sparkles, Check,
} from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const tiers = [
  {
    name: "Starter",
    rate: "20%",
    eyebrow: "Anyone with an audience",
    perks: ["20% commission on every sale", "60-day cookie window", "Personal dashboard & link", "Monthly payouts"],
    cta: "Apply now",
    highlight: false,
  },
  {
    name: "Pro",
    rate: "25%",
    eyebrow: "After €1,000 / R20k referred",
    perks: ["25% commission + recurring on repeat orders", "Custom discount code (10% off)", "Free product for content", "Priority WhatsApp support"],
    cta: "Unlock at €1,000",
    highlight: true,
  },
  {
    name: "Elite",
    rate: "30%",
    eyebrow: "Coaches, GPs, clinics & creators 5k+",
    perks: ["30% commission + lifetime recurring", "Co-marketing & feature on site", "Bulk pricing for clinic patients", "Dedicated affiliate manager"],
    cta: "Talk to us",
    highlight: false,
  },
];

const perks = [
  { icon: TrendingUp, title: "Real-time dashboard", desc: "Track clicks, conversions and earnings live." },
  { icon: Clock, title: "60-day cookie", desc: "Twice the industry standard. We credit you for repeat visitors." },
  { icon: Wallet, title: "Monthly payouts", desc: "PayPal · EFT (SA) · USDT. €25 minimum." },
  { icon: Gift, title: "Free product for content", desc: "Sample kit shipped after your first 3 referrals." },
  { icon: Megaphone, title: "Swipe-file & creatives", desc: "On-brand reels, banners and copy ready to post." },
  { icon: MessageCircle, title: "Dedicated manager", desc: "Direct WhatsApp line with your affiliate manager." },
  { icon: ShieldCheck, title: "Transparent attribution", desc: "Last-click + post-purchase code matching. No stolen sales." },
  { icon: Sparkles, title: "Exclusive launches", desc: "Early access to new peptides and bundles before public drop." },
];

const audiences = [
  { title: "GPs & clinicians", desc: "Refer compliant, lab-tested research peptides to qualified patients." },
  { title: "Coaches & PTs", desc: "Plug protocols into your weight-loss and recovery programs." },
  { title: "Biohackers & creators", desc: "Educate your audience with content that converts." },
  { title: "Gyms & studios", desc: "Co-branded landing pages for your members." },
];

const steps = [
  { n: "01", t: "Apply", d: "60-second form. Most decisions in 24h." },
  { n: "02", t: "Get approved", d: "Receive your link, code, and dashboard." },
  { n: "03", t: "Share", d: "Post, DM, or refer in-clinic. We track everything." },
  { n: "04", t: "Get paid", d: "Monthly payouts. No caps. No clawbacks on completed orders." },
];

const faqs = [
  { q: "How much can I realistically earn?", a: "Active affiliates with engaged audiences (5k–20k) typically earn €400–€2,500/month at the Pro tier. Top creators clear €5k+." },
  { q: "What's the cookie window?", a: "60 days from last click — twice the industry default of 30 days." },
  { q: "When and how do I get paid?", a: "Payouts go out on the 1st of each month for the prior month's confirmed orders. Choose PayPal, EFT (SA), or USDT." },
  { q: "Are refunded orders clawed back?", a: "Only if refunded inside the 14-day window. After that, your commission is locked." },
  { q: "Can I run paid ads on your brand name?", a: "No bidding on 'Ride The Tide' or close variants. Other paid traffic is welcome — just check with us first." },
  { q: "Do you support international affiliates?", a: "Yes — we pay globally in EUR or USDT. South African affiliates can opt for EFT in ZAR." },
];

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  channel: z.string().trim().min(2, "Tell us your channel").max(100),
  audience_size: z.string().trim().max(50).optional(),
  link: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional(),
});

export default function AffiliatePage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Earnings calculator
  const [refs, setRefs] = useState(20);
  const [aov, setAov] = useState(80);
  const [rate, setRate] = useState(0.25);
  const monthly = useMemo(() => Math.round(refs * aov * rate), [refs, aov, rate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      channel: String(fd.get("channel") || ""),
      audience_size: String(fd.get("audience_size") || ""),
      link: String(fd.get("link") || ""),
      message: String(fd.get("message") || ""),
    };
    const parsed = applicationSchema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: "Check your details", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("affiliate_applications").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      channel: parsed.data.channel,
      audience_size: parsed.data.audience_size || null,
      link: parsed.data.link || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Application received", description: "We'll reply within 24 hours." });
  };

  return (
    <>
      <SEO
        title="Affiliate Program — Earn 20–30% with Ride The Tide"
        description="Earn 20–30% commission promoting lab-tested research peptides. 60-day cookie, monthly payouts, dedicated manager. Apply in 60 seconds."
        path="/affiliate"
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0a2540] via-[#0e3050] to-[#00665e] text-white">
        <div className="container px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <DollarSign className="h-3.5 w-3.5" /> Affiliate program
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] md:text-6xl">
              Earn up to <span className="text-[#00d4aa]">30%</span> on every order.
            </h1>
            <p className="mt-5 text-base text-white/80 md:text-lg">
              Promote lab-tested research peptides trusted by 1,200+ researchers and clinicians.
              Industry-leading commissions, 60-day cookie, and monthly payouts in EUR, ZAR or USDT.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#apply" className="inline-flex items-center gap-2 rounded-xl bg-[#00d4aa] px-6 py-3.5 text-sm font-bold text-[#0a2540] shadow-glow transition-all hover:opacity-90 active:scale-95">
                Apply in 60 seconds <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#tiers" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
                See commission tiers
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#00d4aa]" /> No application fee</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#00d4aa]" /> 60-day cookie</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#00d4aa]" /> Monthly payouts</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#00d4aa]" /> Global</span>
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section id="tiers" className="bg-background">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Commission tiers</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Better than the industry — by design.</h2>
            <p className="mt-3 text-muted-foreground">Most competitors offer a flat 15% with a 30-day cookie. We start at 20% and scale to 30% with lifetime recurring.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl border p-6 ${t.highlight ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card"}`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-hero-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Most popular</span>
                )}
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.eyebrow}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-foreground">{t.rate}</span>
                  <span className="text-sm text-muted-foreground">commission</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">{t.name}</h3>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-trust" /> <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <a href="#apply" className={`mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${t.highlight ? "bg-hero-gradient text-primary-foreground" : "border border-border text-foreground hover:bg-muted"}`}>
                  {t.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section className="bg-muted/30">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">What you get</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to promote with confidence — and get paid on time.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
                <p.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-background">
        <div className="container px-4 py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">How it works</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-display text-3xl font-bold text-primary">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="bg-gradient-to-br from-[#0a2540] to-[#00665e] text-white">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Earnings calculator</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">See what you could earn</h2>
            </div>
            <div className="mt-10 grid gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:grid-cols-2 md:p-10">
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-sm font-semibold">
                    <span>Referrals per month</span><span>{refs}</span>
                  </label>
                  <input type="range" min={1} max={200} value={refs} onChange={(e) => setRefs(+e.target.value)} className="mt-2 w-full accent-[#00d4aa]" />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-semibold">
                    <span>Average order value (€)</span><span>€{aov}</span>
                  </label>
                  <input type="range" min={20} max={400} value={aov} onChange={(e) => setAov(+e.target.value)} className="mt-2 w-full accent-[#00d4aa]" />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-semibold">
                    <span>Tier</span>
                    <span>{Math.round(rate * 100)}%</span>
                  </label>
                  <div className="mt-2 flex gap-2">
                    {[{ r: 0.2, l: "Starter" }, { r: 0.25, l: "Pro" }, { r: 0.3, l: "Elite" }].map((x) => (
                      <button key={x.l} type="button" onClick={() => setRate(x.r)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${rate === x.r ? "bg-[#00d4aa] text-[#0a2540]" : "border border-white/20 text-white/80"}`}>
                        {x.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-black/20 p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Estimated monthly</p>
                <p className="mt-2 font-display text-6xl font-bold text-[#00d4aa]">€{monthly.toLocaleString()}</p>
                <p className="mt-2 text-sm text-white/70">≈ R{(monthly * 19.4).toLocaleString()} / month</p>
                <p className="mt-4 text-xs text-white/60">Annual potential: €{(monthly * 12).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="bg-background">
        <div className="container px-4 py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Built for</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border bg-card p-6">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold text-foreground">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="bg-muted/30">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <Award className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Apply to join</h2>
              <p className="mt-3 text-muted-foreground">Most applications are reviewed within 24 hours.</p>
            </div>

            {submitted ? (
              <div className="mt-10 rounded-2xl border border-trust/30 bg-trust/5 p-8 text-center">
                <Check className="mx-auto h-10 w-10 text-trust" />
                <h3 className="mt-3 font-display text-xl font-bold text-foreground">You're in the queue 🎉</h3>
                <p className="mt-2 text-muted-foreground">We'll email you within 24 hours with next steps.</p>
                <Link to="/" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Back to home <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-foreground font-medium">Full name *</span>
                    <input name="name" required maxLength={100} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </label>
                  <label className="text-sm">
                    <span className="text-foreground font-medium">Email *</span>
                    <input name="email" type="email" required maxLength={255} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </label>
                </div>
                <label className="text-sm">
                  <span className="text-foreground font-medium">Channel / role *</span>
                  <input name="channel" required placeholder="Instagram, YouTube, clinic, podcast..." maxLength={100} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-foreground font-medium">Audience size</span>
                    <input name="audience_size" placeholder="e.g. 12k IG followers" maxLength={50} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </label>
                  <label className="text-sm">
                    <span className="text-foreground font-medium">Profile / website</span>
                    <input name="link" type="url" placeholder="https://..." maxLength={500} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  </label>
                </div>
                <label className="text-sm">
                  <span className="text-foreground font-medium">Why are you a good fit?</span>
                  <textarea name="message" rows={4} maxLength={1000} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-hero-gradient py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : <>Submit application <ArrowRight className="h-4 w-4" /></>}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  By applying you accept the affiliate <Link to="/terms" className="underline">terms</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Affiliate FAQ</h2>
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-card p-5 open:shadow-sm">
                  <summary className="cursor-pointer list-none font-display text-base font-semibold text-foreground">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
