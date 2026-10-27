import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Check, Megaphone, ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PartnerType = "facility" | "creator";
const paths = [
  { type: "facility" as const, icon: Building2, title: "Facilities & practitioners", headline: "Add value beyond every session.", body: "Give your clients a clear information resource and earn from qualifying referrals.", action: "Apply as a facility" },
  { type: "creator" as const, icon: Megaphone, title: "Creators & influencers", headline: "Turn trusted content into opportunity.", body: "Share approved educational content with your audience and track earnings from qualifying referrals.", action: "Apply as a creator" },
];

export default function AffiliatePage() {
  const { toast } = useToast();
  const [types, setTypes] = useState<PartnerType[]>(["facility"]);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const choose = (type: PartnerType | "both") => setTypes(type === "both" ? ["facility", "creator"] : [type]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const links = String(form.get("profile_links") || "").split(/[,\n]/).map((v) => v.trim()).filter(Boolean);
    const raw = Object.fromEntries(form.entries());
    setBusy(true);
    // Generated database types are updated after the staged migration is applied.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("submit_partner_application_v2", { payload: {
      ...raw, partner_types: types, profile_links: links,
      regulated_professional: form.get("regulated_professional") === "on",
      enquiry_only: form.get("enquiry_only") === "on",
      marketing_consent: form.get("marketing_consent") === "on",
    }});
    setBusy(false);
    if (error) { toast({ title: "Application not submitted", description: error.message, variant: "destructive" }); return; }
    setSubmitted(true);
    toast({ title: "Application received", description: "Review and agreement acceptance are still required." });
  };
  return <>
    <SEO title="Wellness, Fitness & Creator Partner Programme" description="One Peptide South Africa partner programme for wellness facilities, practitioners, creators and influencers." path="/affiliate" />
    <section className="bg-[#082B57] text-white"><div className="container px-4 py-16 text-center md:py-24">
      <img src="/logo-horizontal.png" alt="Peptide South Africa" className="mx-auto h-12 w-auto rounded bg-white p-2" />
      <p className="mt-6 text-xs font-bold uppercase tracking-[.25em] text-[#55C8BE]">Partner programme</p>
      <h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl font-bold md:text-6xl">Inspire your community. Earn with Peptide South Africa.</h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">For wellness and fitness facilities, creators and influencers. Share clear peptide information and earn from qualifying referrals.</p>
      <div className="mt-8 flex justify-center gap-3"><a href="#apply" className="rounded-lg bg-[#55C8BE] px-5 py-3 font-bold text-[#082B57]">Become a partner</a><Link to="/affiliate/dashboard" className="rounded-lg border border-white/40 px-5 py-3 font-semibold">Partner login</Link></div>
    </div></section>
    <section className="container px-4 py-16"><div className="grid gap-6 md:grid-cols-2">{paths.map(({type,icon:Icon,title,headline,body,action}) => <article key={type} className="rounded-2xl border bg-card p-7 shadow-sm"><Icon className="h-9 w-9 text-[#149F99]"/><p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#149F99]">{title}</p><h2 className="mt-2 text-2xl font-bold">{headline}</h2><p className="mt-3 text-muted-foreground">{body}</p><button onClick={()=>{choose(type); document.getElementById("apply")?.scrollIntoView({behavior:"smooth"});}} className="mt-6 font-bold text-[#082B57] underline">{action}</button></article>)}</div></section>
    <section className="bg-[#E8F7F5]"><div className="container grid gap-8 px-4 py-16 md:grid-cols-2">
      <div><h2 className="text-3xl font-bold">A clear, accountable way to share</h2><ul className="mt-6 space-y-4">{[
        "Clients and audiences get an approved information destination and clear purchasing path.",
        "Approved partners get specific links, codes, QR assets and transparent reporting.",
        "You share approved material; PSA handles the storefront, payment verification and fulfilment.",
        "Participation does not authorise diagnosis, prescribing, treatment claims, brand bidding or paid media.",
      ].map(x=><li key={x} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-[#149F99]"/><span>{x}</span></li>)}</ul></div>
      <div className="rounded-2xl bg-white p-7"><ShieldCheck className="h-9 w-9 text-[#149F99]"/><h2 className="mt-4 text-2xl font-bold">How qualifying earnings work</h2><p className="mt-3 text-muted-foreground">Attribution is saved before payment. Earnings begin only after independently verified cleared payment, then move through validation, availability, payout reservation and paid states. Refund adjustments remain visible.</p><p className="mt-4 text-sm">Rates, validation periods and payout rules are those in your accepted agreement. Applying does not create approval or alter an existing entitlement.</p><Link to="/affiliate/terms" className="mt-5 inline-block font-bold text-[#082B57] underline">Read programme terms</Link></div>
    </div></section>
    <section id="apply" className="container px-4 py-16"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-wider text-[#149F99]">One programme, tailored onboarding</p><h2 className="mt-2 text-3xl font-bold">Become a partner</h2>
      <div className="mt-6 grid grid-cols-3 gap-2">{([["facility","Facility / practitioner"],["creator","Creator / influencer"],["both","Both"]] as const).map(([v,label])=><button type="button" key={v} onClick={()=>choose(v)} aria-pressed={v==="both"?types.length===2:types.length===1&&types[0]===v} className={`rounded-lg border p-3 text-sm font-semibold ${(v==="both"?types.length===2:types.length===1&&types[0]===v)?"border-[#149F99] bg-[#E8F7F5]":"bg-white"}`}>{label}</button>)}</div>
      {submitted ? <div className="mt-8 rounded-xl border border-[#149F99] bg-[#E8F7F5] p-6"><h3 className="text-xl font-bold">Application received</h3><p className="mt-2">Review, agreement acceptance and approval are required before partner access becomes active.</p></div> :
      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border bg-card p-6 md:grid-cols-2">
        <label className="text-sm font-medium">Contact name<input required name="contact_name" maxLength={160} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><label className="text-sm font-medium">Email<input required type="email" name="email" maxLength={255} className="mt-1 w-full rounded-lg border bg-background p-3"/></label>
        <label className="text-sm font-medium">Phone (optional)<input name="phone" maxLength={40} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><label className="text-sm font-medium">Location<input name="location" maxLength={160} className="mt-1 w-full rounded-lg border bg-background p-3"/></label>
        {types.includes("facility") && <><label className="text-sm font-medium">Trading or facility name<input name="facility_name" maxLength={160} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><label className="text-sm font-medium">Facility / practice type<input name="facility_type" maxLength={100} className="mt-1 w-full rounded-lg border bg-background p-3"/></label></>}
        {types.includes("creator") && <><label className="text-sm font-medium">Public creator / display name<input name="creator_name" maxLength={160} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><label className="text-sm font-medium">Content niche<input name="content_niche" maxLength={160} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><label className="text-sm font-medium md:col-span-2">Platform or profile links<textarea name="profile_links" rows={2} className="mt-1 w-full rounded-lg border bg-background p-3" placeholder="One per line"/></label><label className="text-sm font-medium">Audience size (optional)<input name="audience_size" maxLength={80} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><label className="text-sm font-medium">Audience geography (optional)<input name="audience_geography" maxLength={160} className="mt-1 w-full rounded-lg border bg-background p-3"/></label></>}
        <label className="text-sm font-medium md:col-span-2">How will you introduce the programme?<textarea name="promotion_approach" maxLength={1000} rows={3} className="mt-1 w-full rounded-lg border bg-background p-3"/></label><input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"/>
        <label className="flex gap-2 text-sm md:col-span-2"><input type="checkbox" name="regulated_professional"/> I am applying in a regulated professional capacity (reviewed separately).</label><label className="flex gap-2 text-sm md:col-span-2"><input type="checkbox" name="enquiry_only"/> Use an education/enquiry-only route if paid participation is not permitted.</label>
        <label className="flex gap-2 text-sm md:col-span-2"><input required type="checkbox" name="application_terms"/> I accept the <Link to="/affiliate/terms" className="underline">application and programme terms</Link>.</label><label className="flex gap-2 text-sm md:col-span-2"><input type="checkbox" name="marketing_consent"/> Send optional marketing updates (separate consent).</label>
        <button disabled={busy} className="rounded-lg bg-[#082B57] px-5 py-3 font-bold text-white disabled:opacity-50 md:col-span-2">{busy?"Submitting…":"Submit application"}</button>
      </form>}
    </div></section>
  </>;
}
