import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SupabaseClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Enrolment = { id: string; status: string; referral_code: string; partner_types: string[]; commission_rate_bps: number | null; tier_key: string | null };
type Ledger = { id: string; order_id: string; status: string; event_type: string; amount_cents: number; created_at: string; rate_bps: number; policy_version: string };
type Campaign = { id: string; campaign_key: string; name: string; channel: string };
type Attribution = { order_id: string; campaign_id: string | null; commissionable_value_cents: number; commission_rate_bps: number; policy_version: string };
type Statement = { id: string; period_start: string; period_end: string; status: string; amount_cents: number; paid_at: string | null };
type Policy = { policy_version: string; commission_rate_bps: number; attribution_window_days: number; validation_days: number; minimum_payout_cents: number };
const db = supabase as SupabaseClient;
const money = (cents: number) => `R${(cents / 100).toFixed(2)}`;
const channels = ["facility_qr", "counter_card", "handout", "whatsapp", "social_bio", "instagram", "tiktok", "youtube", "newsletter", "website", "other"];
function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AffiliateDashboardPage() {
  const { user, loading } = useAuth();
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [orders, setOrders] = useState<Attribution[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignKey, setCampaignKey] = useState("");
  const [channel, setChannel] = useState("social_bio");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loadedUser, setLoadedUser] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(async () => {
    if (!user) return;
    setError("");
    try {
      const programme = await db.from("partner_programmes").select("id").eq("programme_key", "wellness_b2b").single();
      if (programme.error) throw programme.error;
      const member = await db.from("partner_enrolments").select("id,status,referral_code,partner_types,commission_rate_bps,tier_key").eq("programme_id", programme.data.id).maybeSingle();
      if (member.error) throw member.error;
      setEnrolment(member.data);
      if (!member.data) return;
      const id = member.data.id;
      const [l, c, o, s, p, a] = await Promise.all([
        db.from("partner_commission_ledger").select("id,order_id,status,event_type,amount_cents,created_at,rate_bps,policy_version").eq("enrolment_id", id).order("created_at", { ascending: false }),
        db.from("partner_campaigns").select("id,campaign_key,name,channel").eq("enrolment_id", id).eq("active", true),
        db.from("partner_order_attributions").select("order_id,campaign_id,commissionable_value_cents,commission_rate_bps,policy_version").eq("enrolment_id", id),
        db.from("partner_payout_statements").select("id,period_start,period_end,status,amount_cents,paid_at").eq("enrolment_id", id).order("period_end", { ascending: false }),
        db.from("partner_policies").select("policy_version,commission_rate_bps,attribution_window_days,validation_days,minimum_payout_cents").eq("programme_id", programme.data.id).eq("active", true).maybeSingle(),
        db.from("partner_agreement_acceptances").select("terms_version").eq("enrolment_id", id),
      ]);
      for (const result of [l, c, o, s, p, a]) if (result.error) throw result.error;
      setLedger(l.data || []); setCampaigns(c.data || []); setOrders(o.data || []); setStatements(s.data || []); setPolicy(p.data);
      setAccepted(Boolean(p.data && a.data?.some(row => row.terms_version === p.data.policy_version)));
    } catch { setError("Partner records could not be loaded. Please refresh; displayed balances may be out of date."); }
    finally { setFetching(false); setLoadedUser(user.id); }
  }, [user]);
  useEffect(() => {
    if (!user) { setEnrolment(null); setLedger([]); setOrders([]); setCampaigns([]); setStatements([]); setPolicy(null); return; }
    void reload();
    const timer = window.setInterval(() => void reload(), 30000);
    return () => window.clearInterval(timer);
  }, [reload, user]);
  const campaign = campaigns.find(c => c.id === selected);
  const link = enrolment && typeof window !== "undefined" ? `${window.location.origin}/?partner=${encodeURIComponent(enrolment.referral_code)}${campaign ? `&campaign=${encodeURIComponent(campaign.campaign_key)}` : ""}` : "";
  useEffect(() => {
    let active = true;
    setQr("");
    if (link) void QRCode.toDataURL(`${link}&via=qr`, { width: 640, margin: 2 }).then(value => { if (active) setQr(value); }).catch(() => { if (active) setError("QR generation failed. Please refresh."); });
    return () => { active = false; };
  }, [link]);
  async function run(operation: () => PromiseLike<{ error: unknown }>) {
    setBusy(true); setError("");
    try { const result = await operation(); if (result.error) throw result.error; await reload(); }
    catch { setError("The change could not be saved. Check your details and try again."); }
    finally { setBusy(false); }
  }
  if (loading) return <p className="container py-16" role="status">Loading…</p>;
  if (!user) return <div className="container py-16"><h1 className="text-3xl font-bold">Partner login</h1><p className="mt-3">Sign in with the account linked to your enrolment.</p><Link className="mt-5 inline-block underline" to="/auth?redirect=/affiliate/dashboard">Sign in</Link></div>;
  if (fetching || loadedUser !== user.id) return <p className="container py-16" role="status">Loading partner records…</p>;
  if (!enrolment) return <div className="container py-16"><h1 className="text-3xl font-bold">Partner dashboard</h1>{error ? <p role="alert">{error}</p> : <p className="mt-3">No wellness partner enrolment is linked to this account. Contact the programme team to check your application or verify an existing account.</p>}<button onClick={() => void reload()} className="mt-4 underline">Refresh</button></div>;
  const visibleOrders = selected ? orders.filter(o => o.campaign_id === selected) : orders;
  const ids = new Set(visibleOrders.map(o => o.order_id));
  const visibleLedger = selected ? ledger.filter(l => ids.has(l.order_id)) : ledger;
  const totals = visibleLedger.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + Number(r.amount_cents) }), {} as Record<string, number>);
  const awaiting = visibleOrders.filter(o => !ledger.some(l => l.order_id === o.order_id && l.event_type === "commission")).length;
  const shareText = `Affiliate disclosure: I may earn a commission from qualifying purchases through this link. Explore Peptide South Africa's product information and research context: ${link}\nThis information is not medical advice. Research products are not for human or veterinary use. Contact PSA with product or order enquiries.`;
  return <><SEO title="Partner dashboard" description="Private partner referral and earnings dashboard." path="/affiliate/dashboard" noindex /><div className="container max-w-6xl px-4 py-12 space-y-8">
    <header><h1 className="text-3xl font-bold">Partner dashboard</h1><p className="mt-2">Wellness partner programme · {enrolment.status} · {enrolment.partner_types.join(" / ")}</p><button className="underline" onClick={() => void reload()}>Refresh records</button>{error && <p role="alert" className="mt-3 text-red-700">{error}</p>}</header>
    <section className="rounded-xl border p-6"><h2 className="text-xl font-bold">Agreement and policy</h2><Link to="/affiliate/terms" className="underline">Read programme terms</Link>{policy && <p className="mt-2">{policy.policy_version} · {policy.commission_rate_bps / 100}% · {policy.attribution_window_days}-day tracking · {policy.validation_days}-day validation · monthly EFT from {money(policy.minimum_payout_cents)}. No launch tiers.</p>}{accepted ? <p className="mt-2">Current agreement accepted.</p> : <div className="mt-3"><label><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /> I have read and accept the current programme terms.</label><button className="ml-3 rounded bg-[#082B57] px-4 py-2 text-white" disabled={!checked || busy || !policy} onClick={() => void run(() => db.rpc("accept_partner_agreement", { p_enrolment_id: enrolment.id }))}>Accept agreement</button></div>}</section>
    <section><h2 className="text-xl font-bold">Campaign reporting</h2><label className="mt-3 block">Campaign / platform<select className="ml-3 rounded border p-2" value={selected} onChange={e => setSelected(e.target.value)}><option value="">All campaigns</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name} · {c.channel}</option>)}</select></label><p className="mt-2">Orders awaiting cleared payment: {awaiting}. No commission is earned until verified settlement.</p><div className="mt-4 grid gap-3 sm:grid-cols-4">{["pending_validation", "available", "reserved_for_payout", "paid"].map(status => <div key={status} className="rounded border p-4"><p className="text-xs uppercase">{status.replaceAll("_", " ")}</p><p className="mt-2 text-2xl">{money(totals[status] || 0)}</p></div>)}</div></section>
    {enrolment.status === "approved" && accepted && <section className="rounded-xl border p-6"><h2 className="text-xl font-bold">Referral tools and materials</h2><p className="mt-2">Code: <strong>{enrolment.referral_code}</strong></p><label className="mt-2 block">Tracked link<input readOnly value={link} className="mt-2 w-full rounded border p-2" /></label>{qr && <div className="mt-3"><img src={qr} width={160} height={160} alt="QR code for your selected partner campaign" /><a download={`psa-partner-${enrolment.referral_code}.png`} href={qr} className="underline">Download QR</a></div>}<div className="mt-4 flex flex-wrap gap-4"><button className="underline" onClick={() => download("PSA_CREATOR_CAPTION.txt", shareText)}>Download caption and disclosure</button><button className="underline" onClick={() => download("PSA_STAFF_WHATSAPP_INTRO.txt", shareText)}>Download staff / WhatsApp introduction</button><button className="underline" onClick={() => download("PSA_COUNTER_CARD.html", `<!doctype html><html lang="en"><meta charset="utf-8"><title>PSA Partner Information</title><body style="font-family:Arial,sans-serif;color:#082B57;max-width:600px;margin:3rem auto"><h1>Explore Peptide South Africa</h1><p>Product information, research context and enquiries.</p><img width="240" height="240" alt="Partner QR" src="${qr}"><p>Partner code: ${enrolment.referral_code}</p><p>Affiliate disclosure: We may earn a commission from qualifying purchases through this referral.</p><p>Research products are not for human or veterinary use. This is not medical advice.</p></body></html>`, "text/html")}>Download printable counter card / handout</button><button className="underline" onClick={() => download("PSA_STORY_VIDEO_BRIEF.txt", `Show the approved product information page and your referral QR. Include the disclosure visibly and verbally. Do not make medical, outcome or purity claims. Do not imply clinical approval. Submit custom promotional claims to the programme team for approval before publication.\n\n${shareText}`)}>Download story / video brief</button></div><p className="mt-3 text-sm">Custom claims require programme review before publishing. Affiliate membership does not grant content reuse, gifted products or paid-media rights.</p><form className="mt-6 flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); void run(() => db.rpc("create_partner_campaign", { p_enrolment_id: enrolment.id, p_campaign_key: campaignKey, p_name: campaignName, p_channel: channel })); }}><label>Name<input required maxLength={120} value={campaignName} onChange={e => setCampaignName(e.target.value)} className="block rounded border p-2" /></label><label>Campaign key<input required pattern="[a-z0-9][a-z0-9_-]{0,63}" value={campaignKey} onChange={e => setCampaignKey(e.target.value)} className="block rounded border p-2" /></label><label>Platform<select value={channel} onChange={e => setChannel(e.target.value)} className="block rounded border p-2">{channels.map(c => <option key={c}>{c}</option>)}</select></label><button disabled={busy} className="self-end rounded bg-[#082B57] px-4 py-2 text-white">Create campaign</button></form></section>}
    <section><h2 className="text-xl font-bold">Itemised commission ledger</h2><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Order reference", "Eligible base", "Rate", "Status / event", "Amount"].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{visibleLedger.map(row => <tr key={row.id} className="border-t"><td className="p-2">{row.order_id.slice(0, 8)}</td><td>{money(orders.find(o => o.order_id === row.order_id)?.commissionable_value_cents || 0)}</td><td>{row.rate_bps / 100}%</td><td>{row.status.replaceAll("_", " ")} / {row.event_type}</td><td>{money(Number(row.amount_cents))}</td></tr>)}</tbody></table>{!visibleLedger.length && <p className="py-4">No commission entries for this selection yet.</p>}</div></section>
    <section><h2 className="text-xl font-bold">Payout statements</h2><p className="text-sm">Programme totals, independent of the campaign filter. Prepared statements are not payment confirmation.</p>{statements.map(s => <div key={s.id} className="mt-3 rounded border p-4"><p>{s.period_start} – {s.period_end}: {money(Number(s.amount_cents))} · {s.status}</p>{s.paid_at && <p>Confirmed paid: {new Date(s.paid_at).toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg" })}</p>}<button className="underline" onClick={() => download(`PSA_STATEMENT_${s.id}.txt`, `Wellness partner statement ${s.id}\nPeriod: ${s.period_start} to ${s.period_end}\nAmount: ${money(Number(s.amount_cents))}\nStatus: ${s.status}\nConfirmed paid at: ${s.paid_at || "Not confirmed"}`)}>Download statement</button></div>)}{!statements.length && <p className="mt-3">No payout statements yet. Available balances below the minimum carry forward.</p>}</section>
  </div></>;
}
