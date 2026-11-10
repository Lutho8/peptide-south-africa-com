import { createClient } from '@supabase/supabase-js';
import { eventSchema, CAMPAIGN } from '../src/lib/dusk/campaign.js';
import { isRateLimited } from './_shared/rateLimit.js';
export const config = {runtime:'edge'};
export default async function handler(request:Request) {
  const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  if(request.method!=='POST') return reply({error:'Method not allowed'},405);
  if(request.headers.get('origin')!==new URL(request.url).origin) return reply({error:'Invalid origin'},403);
  if(isRateLimited(`dusk:${request.headers.get('x-forwarded-for')?.split(',')[0]??'unknown'}`,20,60000)) return reply({error:'Try later'},429);
  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply({error:'Not configured'},503);
  try {
    const raw=await request.text(); if(raw.length>2000) return reply({error:'Too large'},413);
    const result=eventSchema.safeParse(JSON.parse(raw)); if(!result.success) return reply({error:'Invalid event'},400);
    const {event_id,event,attribution}=result.data;
    const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
    const {error}=await db.from('dusk_video_events').insert({event_id,event,campaign_id:CAMPAIGN,variant_id:attribution.variant_id,attribution});
    if(error && error.code!=='23505') return reply({error:'Measurement unavailable'},503);
    return reply({ok:true});
  } catch {return reply({error:'Invalid event'},400);}
}
