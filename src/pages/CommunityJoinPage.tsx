import { useState } from "react";
import { CheckCircle2, MessageCircle, ShieldCheck, Users, Lock } from "lucide-react";
import SEO from "@/components/SEO";
import CommunityJoinForm from "@/components/community/CommunityJoinForm";

export default function CommunityJoinPage() {
  const [success, setSuccess] = useState<{ groupUrl: string | null } | null>(null);

  return (
    <>
      <SEO
        title="Join the Ride The Tide WhatsApp Community"
        description="Get peptide protocols, lab updates and GP-led guidance via our private WhatsApp community. Free to join — capped at 2,000 verified members."
        path="/community"
      />

      <section className="bg-gradient-to-b from-card to-background py-14 md:py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              00 / Community Access
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              Join the Ride The Tide WhatsApp Community
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Real protocols, lab-tested data, and GP-led guidance — straight to your phone. No spam,
              no fluff, leave any time.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
              {success ? (
                <SuccessState groupUrl={success.groupUrl} />
              ) : (
                <CommunityJoinForm onSuccess={setSuccess} />
              )}
            </div>

            <aside className="flex flex-col gap-4">
              <Pill
                icon={<Users className="h-4 w-4" />}
                title="2,000 verified members"
                body="Capped per WhatsApp policy. Quality conversations, not noise."
              />
              <Pill
                icon={<ShieldCheck className="h-4 w-4" />}
                title="GP-led oversight"
                body="Protocols reviewed by South African physicians. POPIA-compliant."
              />
              <Pill
                icon={<Lock className="h-4 w-4" />}
                title="Your number stays private"
                body="Stored encrypted. Never sold. Reply STOP to opt out instantly."
              />
              <Pill
                icon={<MessageCircle className="h-4 w-4" />}
                title="What you'll get"
                body="Drop announcements, batch COAs, member-only pricing, Q&A with our team."
              />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function Pill({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-mono text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SuccessState({ groupUrl }: { groupUrl: string | null }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold text-foreground">You&apos;re in.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ve saved your number. {groupUrl ? "Tap below to open the group on WhatsApp." : "We'll send the group invite to your WhatsApp shortly."}
      </p>
      {groupUrl && (
        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" /> Open WhatsApp Group
        </a>
      )}
      <p className="mt-4 font-mono text-xs text-muted-foreground">Reply STOP at any time to leave.</p>
    </div>
  );
}
