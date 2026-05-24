import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// TODO: replace with the live Make webhook URL once configured.
const MAKE_WEBHOOK_URL = "MAKE_WEBHOOK_URL_PLACEHOLDER";
const COUNT_KEY = "rtd_waitlist_count";

export default function WaitlistSection() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(COUNT_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    setCount(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      // Best-effort webhook post; even if it fails (placeholder URL), we still
      // increment the local counter so the UI works in development.
      try {
        await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            whatsapp: whatsapp || null,
            source: "waitlist_homepage",
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch {
        /* swallow — placeholder URL */
      }

      const next = count + 1;
      localStorage.setItem(COUNT_KEY, String(next));
      setCount(next);
      setEmail("");
      setWhatsapp("");
      toast({
        title: "You're on the list",
        description: "Founding members get 15% off — permanently.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-card py-16 md:py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">
            Founding Members
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Launching Cape Town — October 2025
          </h2>
          <p className="mt-3 text-muted-foreground">
            Founding members receive 15% off their first order, permanently.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
            />
            <Input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp number (optional)"
              aria-label="WhatsApp number (optional)"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="bg-hero-gradient text-primary-foreground shadow-glow hover:opacity-90"
              size="lg"
            >
              {submitting ? "Joining…" : "Join the Waitlist"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{count}</span>{" "}
            researchers already waiting
          </p>
        </div>
      </div>
    </section>
  );
}
