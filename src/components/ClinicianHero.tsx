import { Link } from "react-router-dom";
import { ArrowRight, Award, GraduationCap, Stethoscope, Quote } from "lucide-react";

const credentials = [
  { icon: GraduationCap, label: "BSc Biochemistry & Physiology" },
  { icon: Stethoscope, label: "Certified Peptide Therapist (A4M)" },
  { icon: Award, label: "8+ years in performance medicine" },
];

export default function ClinicianHero() {
  return (
    <section className="bg-card py-16 md:py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 md:grid-cols-[260px_1fr] md:gap-12">
            {/* Portrait */}
            <div className="mx-auto md:mx-0">
              <div className="relative">
                {/* Avatar placeholder — initials disc + ring; can be swapped for a photo later */}
                <div className="relative h-56 w-56 overflow-hidden rounded-3xl bg-hero-gradient shadow-glow ring-4 ring-card">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-7xl font-black text-primary-foreground/95">
                      LK
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-foreground/30 px-3 py-2 text-center backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Lutho Kote
                    </p>
                  </div>
                </div>
                {/* Verified ribbon */}
                <span className="absolute -right-3 top-4 rounded-full bg-trust px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-card">
                  ✓ Verified Clinician
                </span>
              </div>
            </div>

            {/* Copy */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Meet Your Clinician
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                Every protocol is reviewed by{" "}
                <span className="text-gradient">Lutho Kote</span>
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Lutho is the peptide & bio-health expert behind Ride The Tide. He
                personally signs off on every Certificate of Analysis and oversees
                each protocol — no anonymous "support team", no offshore call centre.
                Just a real practitioner accountable for your results.
              </p>

              {/* Credentials */}
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {credentials.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <c.icon className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Pull quote */}
              <blockquote className="mt-6 flex gap-3 rounded-xl border-l-4 border-primary bg-background p-4">
                <Quote className="h-5 w-5 flex-shrink-0 text-primary/60" />
                <p className="text-sm italic text-foreground">
                  "I built Ride The Tide so South Africans could access the same
                  clinical-grade peptide protocols I use with my private clients —
                  without the gatekeeping, the inflated pricing, or the guesswork."
                </p>
              </blockquote>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/clinician"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:opacity-90 active:scale-95"
                >
                  Meet Lutho <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/quiz"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                >
                  Get a Personalized Protocol
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
