import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, CheckCircle2, Share2, Gift, Repeat, Coins, Pause, Play, X, ArrowRight, LogOut, FileCheck2, Activity, CalendarClock, RefreshCw, PackageCheck, Truck, Package, Store, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ensureReferralCode, shareUrl, type ReferralCode } from "@/lib/referral";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrdersList from "@/components/account/OrdersList";
import ProfileEditor from "@/components/account/ProfileEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trackEvent } from "@/lib/analytics";

interface Subscription {
  id: string;
  product_slug: string;
  variant_label: string | null;
  interval_weeks: number;
  next_charge_at: string | null;
  status: string;
  discount_pct: number;
  
}

interface PortalOrder {
  id: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  total: number;
}

interface ConsentReceipt {
  id: number;
  order_id: string;
  policy_version: string;
  report_scope_version: string;
  marketing_consent: boolean;
  accepted_at: string;
}

const PORTAL_STAGES = [
  { key: "placed", label: "Order placed", icon: ClipboardCheck },
  { key: "paid", label: "Payment confirmed", icon: PackageCheck },
  { key: "packed", label: "Packed", icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function stageIndex(status?: string): number {
  switch ((status ?? "").toLowerCase()) {
    case "paid": return 1;
    case "processing":
    case "packed": return 2;
    case "shipped":
    case "dispatched": return 3;
    case "delivered": return 4;
    default: return status ? 0 : -1;
  }
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
  const [activeTab, setActiveTab] = useState("orders");
  const [portalOrders, setPortalOrders] = useState<PortalOrder[]>([]);
  const [consentReceipts, setConsentReceipts] = useState<ConsentReceipt[]>([]);
  const [portalLoaded, setPortalLoaded] = useState(false);
  const portalTracked = useRef(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?redirect=/account");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [subsRes, refRow, balRes, redRes, ordersRes, consentsRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id, product_slug, variant_label, interval_weeks, next_charge_at, status, discount_pct")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        ensureReferralCode(user.id),
        supabase.rpc("get_loyalty_balance", { _user_id: user.id }),
        supabase.from("referral_redemptions").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id, status, created_at, paid_at, total")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("checkout_consents")
          .select("id, order_id, policy_version, report_scope_version, marketing_consent, accepted_at")
          .eq("user_id", user.id)
          .order("accepted_at", { ascending: false })
          .limit(20),
      ]);
      setSubs(((subsRes.data ?? []) as unknown) as Subscription[]);
      setReferral(refRow);
      setBalance(Number(balRes.data ?? 0));
      setRedemptions(redRes.count ?? 0);
      setPortalOrders((ordersRes.data ?? []) as PortalOrder[]);
      setConsentReceipts((consentsRes.data ?? []) as ConsentReceipt[]);
      setPortalLoaded(true);
    })();
  }, [user]);

  useEffect(() => {
    if (!portalLoaded || portalTracked.current) return;
    portalTracked.current = true;
    trackEvent({
      event: "portal_viewed",
      props: {
        order_count: portalOrders.length,
        latest_stage: portalOrders[0]?.status ?? "new_customer",
      },
    });
  }, [portalLoaded, portalOrders]);

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

  const nextDelivery = subs
    .filter((s) => s.status === "active" && s.next_charge_at)
    .sort((a, b) => new Date(a.next_charge_at!).getTime() - new Date(b.next_charge_at!).getTime())[0];
  const latestOrder = portalOrders[0];
  const currentStage = stageIndex(latestOrder?.status);

  return (
    <>
      <SEO title="Patient Portal · Peptide South Africa" description="Follow research orders, fulfilment milestones, consent receipts, documents, reorders and tracker access in one branded portal." path="/account" />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]} />

      <section className="container px-4 py-10 md:py-14">
        <div className="mb-8 overflow-hidden rounded-3xl border border-[#55c8be]/30 bg-[#041b36] text-white shadow-card-hover">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#55c8be]">
                Peptide SA Patient Portal
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Welcome back</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                One branded home for your research orders, batch documentation, consent receipts and tracker hand-off.
              </p>
              <p className="mt-4 text-xs text-white/55">{user.email}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider">
                <Link to="/shop" className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white hover:bg-white/10">
                  <Store className="h-3.5 w-3.5 text-[#55c8be]" /> Store
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#55c8be]/40 bg-[#55c8be]/10 px-3 py-1.5 text-[#8de0d8]">
                  <Activity className="h-3.5 w-3.5" /> Portal
                </span>
                <a
                  href="https://peptide-south-africa.co.za/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ event: "portal_tracker_opened", props: { placement: "portal" } })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white hover:bg-white/10"
                >
                  <Activity className="h-3.5 w-3.5 text-[#55c8be]" /> Tracker
                </a>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#55c8be]">Current order stage</p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {latestOrder
                    ? PORTAL_STAGES[Math.max(0, currentStage)]?.label ?? "Order placed"
                    : "Ready when you are"}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  {latestOrder
                    ? `Order #${latestOrder.id.slice(0, 8)} · ${new Date(latestOrder.created_at).toLocaleDateString("en-ZA", { dateStyle: "medium" })}`
                    : "Your first order will appear here from checkout through delivery."}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-2">
                {PORTAL_STAGES.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const complete = index <= currentStage;
                  return (
                    <div key={stage.key} className="flex flex-1 flex-col items-center text-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${complete ? "border-[#55c8be] bg-[#55c8be] text-[#041b36]" : "border-white/20 bg-white/5 text-white/35"}`}>
                        <StageIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className={`mt-2 hidden text-[9px] leading-tight sm:block ${complete ? "text-white" : "text-white/35"}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-6 py-3 sm:px-8 lg:px-10">
            <p className="text-[11px] text-white/55">Peptide care. Made clear.</p>
            <button
              onClick={() => signOut().then(() => navigate("/"))}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
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

        <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CalendarClock className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next delivery</p>
                <p className="font-display text-lg font-bold text-foreground">
                  {nextDelivery?.next_charge_at
                    ? new Date(nextDelivery.next_charge_at).toLocaleDateString("en-ZA", { dateStyle: "long" })
                    : "No active delivery scheduled"}
                </p>
              </div>
            </div>
            {nextDelivery && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("subs");
                  document.getElementById("account-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Manage subscription
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              trackEvent({ event: "portal_orders_viewed", props: { order_count: portalOrders.length } });
              document.getElementById("account-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <RefreshCw className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold text-foreground">Reorder</p>
            <p className="mt-1 text-xs text-muted-foreground">Repeat a paid order in one tap.</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("subs");
              document.getElementById("account-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Repeat className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold text-foreground">Manage subscription</p>
            <p className="mt-1 text-xs text-muted-foreground">Pause, resume or cancel deliveries.</p>
          </button>
          <Link
            to="/testing"
            onClick={() => trackEvent({ event: "portal_coa_opened", props: { placement: "portal" } })}
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <FileCheck2 className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold text-foreground">Open the published source report</p>
            <p className="mt-1 text-xs text-muted-foreground">Check the source or lot scope shown.</p>
          </Link>
          <a
            href="https://peptide-south-africa.co.za/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ event: "portal_tracker_opened", props: { placement: "portal" } })}
            className="rounded-xl border border-trust/30 bg-trust/5 p-4 transition-colors hover:bg-trust/10"
          >
            <Activity className="h-5 w-5 text-trust" />
            <p className="mt-3 font-semibold text-foreground">Start tracker</p>
            <p className="mt-1 text-xs text-muted-foreground">Open your free digital tracker.</p>
          </a>
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
                        title: "Peptide South Africa",
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

        {/* Tabbed sections: Orders · Subscriptions · Profile */}
        <div id="account-tabs" className="mt-8 scroll-mt-28">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              if (value === "orders") {
                trackEvent({ event: "portal_orders_viewed", props: { order_count: portalOrders.length } });
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="subs">Auto-reorder</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent id="orders" value="orders" className="mt-4 scroll-mt-28">
              <OrdersList />
            </TabsContent>

            <TabsContent id="subscriptions" value="subs" className="mt-4 scroll-mt-28">
              {subs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <Repeat className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No subscriptions yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Subscribe & save 12% on any research-track product.</p>
                  <Link to="/shop?track=RUO" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Browse research catalog <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {subs.map((s) => {
                    const isActive = s.status === "active";
                    const isPaused = s.status === "paused";
                    const isCancelled = s.status === "cancelled";
                    const isPending = s.status === "pending";
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
                            {isPending && (
                              <p className="mt-0.5 text-xs font-semibold text-primary">
                                Pending activation · no charge scheduled
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
            </TabsContent>

            <TabsContent value="receipts" className="mt-4">
              {consentReceipts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No consent receipts yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">A versioned receipt will be saved with your next research-use order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consentReceipts.map((receipt) => (
                    <div key={receipt.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-sm font-bold text-foreground">Research-use acknowledgement</p>
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">Order #{receipt.order_id.slice(0, 8)}</p>
                        </div>
                        <span className="rounded-full bg-trust/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-trust">
                          Accepted
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <p><span className="font-semibold text-foreground">Accepted:</span> {new Date(receipt.accepted_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</p>
                        <p><span className="font-semibold text-foreground">Marketing:</span> {receipt.marketing_consent ? "Opted in" : "Not selected"}</p>
                        <p className="break-all"><span className="font-semibold text-foreground">Terms:</span> {receipt.policy_version}</p>
                        <p className="break-all"><span className="font-semibold text-foreground">Report scope:</span> {receipt.report_scope_version}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="mt-4">
              <ProfileEditor />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
