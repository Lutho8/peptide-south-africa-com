import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, CheckCircle2, Share2, Gift, Repeat, Coins, Pause, Play, X, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ensureReferralCode, shareUrl, type ReferralCode } from "@/lib/referral";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Subscription {
  id: string;
  product_slug: string;
  variant_label: string | null;
  interval_weeks: number;
  next_charge_at: string | null;
  status: string;
  discount_pct: number;
  stripe_subscription_id: string | null;
}

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [referral, setReferral] = useState<ReferralCode | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [redemptions, setRedemptions] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?redirect=/account");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [subsRes, refRow, balRes, redRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id, product_slug, variant_label, interval_weeks, next_charge_at, status, discount_pct, stripe_subscription_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        ensureReferralCode(user.id),
        supabase.rpc("get_loyalty_balance", { _user_id: user.id }),
        supabase.from("referral_redemptions").select("*", { count: "exact", head: true }),
      ]);
      setSubs((subsRes.data as Subscription[]) ?? []);
      setReferral(refRow);
      setBalance(Number(balRes.data ?? 0));
      setRedemptions(redRes.count ?? 0);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="container px-4 py-20 text-center text-muted-foreground">Loading account…</div>
    );
  }

  const copyLink = async () => {
    if (!referral) return;
    await navigator.clipboard.writeText(shareUrl(referral.code));
    setCopied(true);
    toast({ title: "Referral link copied", description: "Share it and both sides earn R150." });
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSubStatus = async (id: string, status: Subscription["status"]) => {
    setBusy(id);
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      toast({ title: `Subscription ${status}` });
    }
    setBusy(null);
  };

  return (
    <>
      <SEO title="My Account · Ride The Tide" description="Manage your subscriptions, referrals, and loyalty balance." path="/account" />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]} />

      <section className="container px-4 py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => signOut().then(() => navigate("/"))}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Loyalty + referral summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Coins className="h-4 w-4 text-primary" /> Loyalty balance
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              R{balance.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">5% back on every delivered order</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Gift className="h-4 w-4 text-primary" /> Referrals
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{redemptions}</p>
            <p className="mt-1 text-xs text-muted-foreground">Friends who used your code</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Repeat className="h-4 w-4 text-primary" /> Active subscriptions
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              {subs.filter((s) => s.status === "active").length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Auto-reorder is paused-able anytime</p>
          </div>
        </div>

        {/* Referral hub */}
        <div className="mt-8 rounded-2xl border border-border bg-hero-gradient p-6 text-primary-foreground">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Earn R150 — give R150</h2>
              <p className="mt-1 text-sm opacity-90">
                Share your link. They get R150 off their first order, you get R150 store credit on delivery.
              </p>
            </div>
            {referral && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="rounded-lg bg-white/15 px-3 py-2 font-mono text-base font-bold tracking-widest backdrop-blur">
                  {referral.code}
                </code>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:opacity-90"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-trust" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
                {typeof navigator !== "undefined" && "share" in navigator && referral && (
                  <button
                    onClick={() =>
                      navigator.share({
                        title: "Ride The Tide",
                        text: `Get R150 off premium research peptides with my code ${referral.code}`,
                        url: shareUrl(referral.code),
                      }).catch(() => undefined)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-foreground">Your subscriptions</h2>
          {subs.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <Repeat className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">No subscriptions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Subscribe & save 12% on any research-track product.</p>
              <Link to="/shop?track=RUO" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Browse research catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {subs.map((s) => {
                const isActive = s.status === "active";
                const isPaused = s.status === "paused";
                const isCancelled = s.status === "cancelled";
                return (
                  <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link to={`/product/${s.product_slug}`} className="font-display text-base font-bold text-foreground hover:underline">
                          {s.product_slug}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.variant_label ?? "—"} · every {s.interval_weeks} weeks · −{s.discount_pct}%
                        </p>
                        {s.next_charge_at && isActive && (
                          <p className="mt-0.5 text-xs text-trust">
                            Next charge {new Date(s.next_charge_at).toLocaleDateString()}
                          </p>
                        )}
                        {!s.stripe_subscription_id && !isCancelled && (
                          <p className="mt-1 inline-block rounded bg-badge/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-badge ring-1 ring-badge/20">
                            Awaiting billing activation
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isActive && (
                          <button disabled={busy === s.id} onClick={() => updateSubStatus(s.id, "paused")} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                            <Pause className="h-3.5 w-3.5" /> Pause
                          </button>
                        )}
                        {isPaused && (
                          <button disabled={busy === s.id} onClick={() => updateSubStatus(s.id, "active")} className="inline-flex items-center gap-1 rounded-lg bg-trust px-3 py-1.5 text-xs font-semibold text-trust-foreground">
                            <Play className="h-3.5 w-3.5" /> Resume
                          </button>
                        )}
                        {!isCancelled && (
                          <button disabled={busy === s.id} onClick={() => updateSubStatus(s.id, "cancelled")} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        )}
                        {isCancelled && (
                          <span className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
