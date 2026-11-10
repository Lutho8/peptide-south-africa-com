import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BODY, HOOKS, SCRIPT_VERSION, source, campaignLink, type Creative } from '@/lib/dusk/campaign';
import SEO from '@/components/SEO';
import '../dusk.css';

type Count = {variant_id:string;landings:number;source_clicks:number};
export default function AdminDuskCampaignPage() {
  const {session,isAdmin,loading}=useAuth();
  const [rows,setRows]=useState<Creative[]>([]),[counts,setCounts]=useState<Count[]>([]);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
  const call=useCallback(async (body?:unknown)=>{
    const response=await fetch('/api/dusk-campaign',{method:body?'POST':'GET',headers:{Authorization:`Bearer ${session?.access_token}`, ...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
    const data=await response.json(); if(!response.ok) throw new Error(data.error||'Campaign unavailable'); return data;
  },[session?.access_token]);
  const refresh=useCallback(async()=>{
    setReady(false);setError('');
    try {const data=await call();setRows(data.creatives);setCounts(data.counts);setReady(true);} catch(e){setError((e as Error).message);}
  },[call]);
  useEffect(()=>{if(isAdmin && session) void refresh();},[isAdmin,session,refresh]);
  async function act(row:Creative,action:string,render?:unknown){
    setBusy(true);setError('');try {await call({variant_id:row.variant_id,revision:row.revision,action,...(render?{render}:{})});await refresh();} catch(e){setError((e as Error).message);} finally {setBusy(false);}
  }
  if(loading) return <p className="container py-12">Checking access…</p>;
  if(!session) return <p className="container py-12"><Link to="/auth">Sign in</Link> to open the campaign dashboard.</p>;
  if(!isAdmin) return <p className="container py-12">Admin access is required.</p>;
  return <div className="dusk-page">
    <SEO title="DUSK Campaign Studio" description="Internal production and evidence review." path="/admin/dusk-campaign" noindex />
    <section className="dusk-hero"><div className="dusk-wrap py-10"><Link to="/admin">← Admin</Link><p className="dusk-eyebrow mt-6">Pinealon / Research video campaign</p><h1>DUSK Campaign Studio</h1><p className="dusk-intro">Three openings. One scientific body. Review each final cut before publication.</p><p>Rendering and publishing are manual. No provider is connected.</p></div></section>
    <main className="dusk-wrap py-10 space-y-8">
      <p className="rounded border p-4">Brand reference: existing DUSK page, navy / teal / mist. Original ZIP, first cut and brand kit still require review. Script version: {SCRIPT_VERSION}.</p>
      <section><h2 className="text-2xl">Shared scientific body</h2><p className="my-4 leading-8">{BODY}</p><a className="underline" href={source} target="_blank" rel="noreferrer">Cell study · PMID 21978084</a><p className="mt-3">This study does not validate DUSK as a blend or a sleep protocol. Review on-screen words, narration and visuals together.</p></section>
      <button className="dusk-button" disabled={busy} onClick={()=>void refresh()}>Refresh campaign</button>
      {error && <p role="alert">{error}</p>}
      {!ready && !error && <p role="status">Loading campaign…</p>}
      {ready && <section className="grid gap-6 md:grid-cols-3">{rows.map(row=>{
        const metric=counts.find(c=>c.variant_id===row.variant_id);
        return <article className="rounded-xl border bg-white p-5 space-y-4" key={row.variant_id}>
          <p className="dusk-eyebrow">{row.variant_id} / {row.status.replaceAll('_',' ')}</p><h2 className="text-xl">{HOOKS[row.variant_id]}</h2>
          <p>Reported landings: {metric?.landings??'Unavailable'}<br/>Reported study clicks: {metric?.source_clicks??'Unavailable'}</p>
          <label className="block text-sm">Instagram attribution link<input className="w-full border p-2 mt-2" readOnly value={campaignLink(row.variant_id,'instagram')} onFocus={e=>e.target.select()}/></label>
          {row.status==='draft' && <button disabled={busy} className="dusk-button" onClick={()=>void act(row,'review_script')}>Mark script reviewed</button>}
          {row.status==='script_reviewed' && <RenderForm disabled={busy} submit={render=>void act(row,'record_render',render)}/>}
          {row.render && <p className="text-xs break-all">Final cut: {row.render.asset_path}<br/>SHA-256: {row.render.asset_sha256}</p>}
          {row.status==='rendered' && <button disabled={busy} className="dusk-button" onClick={()=>void act(row,'approve')}>Approve this exact cut</button>}
          {row.status==='approved' && <p>Approved for manual handoff. Publication is not recorded or automated.</p>}
          {row.status!=='draft' && <button disabled={busy} className="block underline" onClick={()=>void act(row,'reject')}>Return to draft and clear approval</button>}
        </article>;
      })}</section>}
      <p className="text-sm">Counts are consent-based client reports. They are not unique viewers, ad impressions, purchases or verified revenue. No winner is selected from incomplete data.</p>
    </main>
  </div>;
}
function RenderForm({disabled,submit}:{disabled:boolean;submit:(render:unknown)=>void}) {
  const [error,setError]=useState('');
  return <form className="space-y-3" onSubmit={e=>{
    e.preventDefault();const form=new FormData(e.currentTarget);setError('');
    const render={asset_path:form.get('asset_path'),asset_sha256:form.get('asset_sha256'),brand_sha256:form.get('brand_sha256'),duration_seconds:Number(form.get('duration_seconds')),width:1080,height:1920,captions_reviewed:form.has('captions_reviewed'),rights_confirmed:form.has('rights_confirmed'),scientific_reviewed:form.has('scientific_reviewed')};
    import('@/lib/dusk/campaign').then(({renderSchema})=>{const r=renderSchema.safeParse(render);if(!r.success) setError('Check the asset path, SHA-256 values, duration and all review boxes.');else submit(r.data);});
  }}>
    <p className="text-sm">Render and inspect a 1080 × 1920 MP4, 25–60 seconds. Archive the exact file before recording it.</p>
    {(['asset_path','asset_sha256','brand_sha256','duration_seconds'] as const).map(name=><label key={name} className="block text-sm">{({asset_path:'Archived path: dusk/pinealon/name.mp4',asset_sha256:'Final MP4 SHA-256',brand_sha256:'Reviewed brand kit SHA-256',duration_seconds:'Duration in seconds'})[name]}<input required name={name} type={name==='duration_seconds'?'number':'text'} min={25} max={60} className="block w-full border p-2"/></label>)}
    {(['captions_reviewed','rights_confirmed','scientific_reviewed'] as const).map(name=><label key={name} className="flex gap-2 text-sm"><input name={name} type="checkbox" required/>{({captions_reviewed:'Captions, audio and safe areas reviewed',rights_confirmed:'Asset, music and voice rights confirmed',scientific_reviewed:'Final cut matches the reviewed script and research limits'})[name]}</label>)}
    {error&&<p role="alert">{error}</p>}<button disabled={disabled} className="dusk-button">Record reviewed render</button>
  </form>;
}
