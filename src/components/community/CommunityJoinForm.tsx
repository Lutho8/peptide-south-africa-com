import { useState } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  communityJoinSchema,
  INTEREST_OPTIONS,
  type CommunityJoinPayload,
} from "@/lib/communitySchema";
import PhoneInput from "./PhoneInput";
import { ArrowRight, Loader2, MessageCircle } from "lucide-react";

type SuccessResult = { groupUrl: string | null };

export default function CommunityJoinForm({
  onSuccess,
}: {
  onSuccess: (r: SuccessResult) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("ZA");
  const [national, setNational] = useState("");
  const [interest, setInterest] = useState<string>("weight-loss");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = parsePhoneNumberFromString(national, country as any);
    const phoneE164 = parsed?.isValid() ? parsed.number : "";

    const payload = {
      name,
      phone: phoneE164,
      country,
      interest,
      consent,
    };

    const result = communityJoinSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean;
        groupUrl: string | null;
        error?: string;
      }>("community-join", { body: result.data satisfies CommunityJoinPayload });

      if (error || !data?.ok) {
        toast({
          title: "Couldn't join the community",
          description: data?.error || error?.message || "Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }
      onSuccess({ groupUrl: data.groupUrl ?? null });
    } catch (err: any) {
      toast({
        title: "Network error",
        description: err?.message ?? "Try again shortly.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          01 / Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className={`w-full rounded-lg border bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
            errors.name ? "border-destructive" : "border-input"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          02 / WhatsApp Number
        </label>
        <PhoneInput
          country={country}
          national={national}
          onChangeCountry={setCountry}
          onChangeNational={setNational}
          disabled={busy}
          error={!!errors.phone}
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          We&apos;ll send the group invite straight to this number.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          03 / Interest Area
        </label>
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {INTEREST_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input"
        />
        <span>
          I agree to receive WhatsApp messages from Peptide South Africa about peptides, protocols and
          community events. Reply <span className="font-mono font-semibold">STOP</span> to opt out
          at any time.
        </span>
      </label>
      {errors.consent && <p className="-mt-2 text-xs text-destructive">{errors.consent}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Joining...
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4" /> Join the WhatsApp Community
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
