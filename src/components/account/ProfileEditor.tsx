import { useEffect, useState } from "react";
import { Loader2, Save, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SA_PROVINCES } from "@/lib/checkoutSchema";

interface Profile {
  phone_e164: string;
  province: string;
  birth_year: number | null;
  marketing_optin: boolean;
  whatsapp_optin: boolean;
  acquisition_source: string;
}

const empty: Profile = {
  phone_e164: "",
  province: "",
  birth_year: null,
  marketing_optin: false,
  whatsapp_optin: false,
  acquisition_source: "",
};

export default function ProfileEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("customer_profiles")
        .select("phone_e164, province, birth_year, marketing_optin, whatsapp_optin, acquisition_source")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          phone_e164: data.phone_e164 ?? "",
          province: data.province ?? "",
          birth_year: data.birth_year,
          marketing_optin: !!data.marketing_optin,
          whatsapp_optin: !!data.whatsapp_optin,
          acquisition_source: data.acquisition_source ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      phone_e164: profile.phone_e164.trim() || null,
      province: profile.province || null,
      birth_year: profile.birth_year,
      marketing_optin: profile.marketing_optin,
      whatsapp_optin: profile.whatsapp_optin,
    };
    const { error } = await supabase
      .from("customer_profiles")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-10 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">Your profile</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</span>
          <input
            readOnly
            value={user?.email ?? ""}
            className="w-full rounded-lg border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground"
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Mobile (incl. country code)
          </span>
          <input
            type="tel"
            placeholder="+27 82 123 4567"
            value={profile.phone_e164}
            onChange={(e) => setProfile((p) => ({ ...p, phone_e164: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Province</span>
          <select
            value={profile.province}
            onChange={(e) => setProfile((p) => ({ ...p, province: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select province</option>
            {SA_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Year of birth</span>
          <input
            type="number"
            min={1920}
            max={new Date().getFullYear() - 18}
            placeholder="1990"
            value={profile.birth_year ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, birth_year: e.target.value ? Number(e.target.value) : null }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={profile.marketing_optin}
            onChange={(e) => setProfile((p) => ({ ...p, marketing_optin: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <span>
            <span className="font-medium text-foreground">Email me protocol updates & member-only offers</span>
            <span className="block text-xs text-muted-foreground">~1–2 emails per month. Unsubscribe anytime.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={profile.whatsapp_optin}
            onChange={(e) => setProfile((p) => ({ ...p, whatsapp_optin: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <span>
            <span className="font-medium text-foreground">WhatsApp support is OK</span>
            <span className="block text-xs text-muted-foreground">For order updates and protocol questions only.</span>
          </span>
        </label>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save changes
      </button>
    </div>
  );
}
