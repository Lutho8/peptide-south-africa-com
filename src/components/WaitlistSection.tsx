import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const MAKE_WEBHOOK_URL =
  "https://hook.eu1.make.com/ypm5hnevcxlmc7j9tl68fhxiigl5yb8a";
const WHATSAPP_URL = "https://wa.me/27641344646";
const COUNT_KEY = "rtd_waitlist_count";

export default function WaitlistSection() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(COUNT_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    setCount(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, []);

  const showError = () => {
    toast({
      variant: "destructive",
      title: "Something went wrong.",
      description: "WhatsApp us directly instead.",
      action: (
        <ToastAction
          altText="WhatsApp us"
          asChild
        >
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </ToastAction>
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          source: "store_waitlist",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        showError();
        return;
      }

      const next = count + 1;
      localStorage.setItem(COUNT_KEY, String(next));
      setCount(next);
      setName("");
      setEmail("");
      setWhatsapp("");
      toast({
        title: "You're on the list.",
        description: "We'll be in touch before October.",
      });
    } catch {
      showError();
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
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
            />
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
