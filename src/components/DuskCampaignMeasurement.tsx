import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { parseAttribution, source } from '@/lib/dusk/campaign';

/** No tracking cookie, user identifier or cross-page attribution storage. */
export default function DuskCampaignMeasurement() {
  const {search}=useLocation();
  const attribution=parseAttribution(search);
  const [allowed,setAllowed]=useState(false),[error,setError]=useState('');
  if(!attribution) return null;
  async function report(event:'research_landing'|'research_source_click') {
    try {
      const response=await fetch('/api/dusk-events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_id:crypto.randomUUID(),consent:true,event,attribution}),keepalive:true});
      if(!response.ok) setError('Campaign measurement is unavailable. You can still read the research.');
    } catch {setError('Campaign measurement is unavailable. You can still read the research.');}
  }
  return <aside className="dusk-wrap py-6 text-sm">
    <p>Help measure this research video? With your permission, we record its campaign and hook plus a page-view event and study-link clicks. No name, email or persistent tracking ID is sent.</p>
    {!allowed?<button className="underline mt-2" onClick={()=>{setAllowed(true);void report('research_landing');}}>Allow measurement for this page</button>:<button className="underline mt-2" onClick={()=>setAllowed(false)}>Stop further measurement</button>}
    <a className="block underline mt-3" href={source} target="_blank" rel="noreferrer" onClick={()=>{if(allowed) void report('research_source_click');}}>Read the Pinealon cell study</a>
    {error&&<p role="status">{error}</p>}
  </aside>;
}
