import { ArrowRight, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, SUPPORT_AGENT_NAME } from "@/lib/contact";

export default function TextUsSection() {
  return (
    <section className="bg-background py-14 md:py-20">
      <div className="container px-4">
        <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10 md:grid-cols-2">
          {/* Left: copy + CTA */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Text us, our dedicated team is here to help
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Reach out and get a response within minutes.
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
            >
              <ArrowRight className="h-4 w-4" />
              Text Us
            </a>
          </div>

          {/* Right: chat bubbles */}
          <div className="flex flex-col gap-3" aria-hidden="true">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm">
                Hey, can I get some help?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-foreground shadow-sm">
                Hey, this is {SUPPORT_AGENT_NAME}. How can I help you?
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
              <MessageCircle className="h-3.5 w-3.5" />
              Avg. reply under 5 min
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
