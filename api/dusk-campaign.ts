import { createClient } from '@supabase/supabase-js';
import { CAMPAIGN, SCRIPT_VERSION, HOOKS, BODY, source, transitionSchema, transition } from '../src/lib/dusk/campaign.js';
export const config = {runtime:'edge'};
export default async function handler(request: Request) {
  const reply = (body:unknown,status=200) => Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
  if (!['GET','POST'].includes(request.method)) return reply({error:'Method not allowed'},405);
  if (request.method === 'POST' && request.headers.get('origin') !== new URL(request.url).origin) return reply({error:'Invalid origin'},403);
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return reply({error:'Sign in required'},401);
  const url = process.env.SUPABASE_URL, secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return reply({error:'Campaign service not configured'},503);
  try {
    const db = createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:auth,error:authError} = await db.auth.getUser(token);
    if (authError || !auth.user) return reply({error:'Sign in required'},401);
    const {data:role,error:roleError} = await db.from('user_roles').select('role').eq('user_id',auth.user.id).eq('role','admin').maybeSingle();
    if (roleError || !role) return reply({error:'Admin access required'},403);
    if (request.method === 'GET') {
      const {data:creatives,error} = await db.from('dusk_video_creatives').select('*').eq('campaign_id',CAMPAIGN).order('variant_id');
      if (error) return reply({error:'Campaign data unavailable'},503);
      const counts = await Promise.all(Object.keys(HOOKS).map(async variant_id => {
        const count = async (event:string) => { const r=await db.from('dusk_video_events').select('event_id',{count:'exact',head:true}).eq('campaign_id',CAMPAIGN).eq('variant_id',variant_id).eq('event',event); if(r.error) throw r.error; return r.count; };
        const [landings,source_clicks]=await Promise.all([count('research_landing'),count('research_source_click')]);
        return {variant_id,landings,source_clicks};
      }));
      return reply({creatives,counts,script:{version:SCRIPT_VERSION,hooks:HOOKS,body:BODY,source},measurement:'Consent-based client reports, not unique viewers, ad impressions, purchases or verified revenue.'});
    }
    const raw = await request.text();
    if (raw.length>6000) return reply({error:'Request too large'},413);
    const parsed=transitionSchema.safeParse(JSON.parse(raw));
    if(!parsed.success) return reply({error:'Invalid workflow request'},400);
    const input=parsed.data;
    const {data:row,error:readError}=await db.from('dusk_video_creatives').select('*').eq('campaign_id',CAMPAIGN).eq('variant_id',input.variant_id).single();
    if(readError) return reply({error:'Creative unavailable'},503);
    let next; try {next=transition(row,input);} catch(error) {return reply({error:(error as Error).message},409);}
    const {data:updated,error}=await db.from('dusk_video_creatives').update({...next,revision:row.revision+1,updated_by:auth.user.id,updated_at:new Date().toISOString()}).eq('campaign_id',CAMPAIGN).eq('variant_id',input.variant_id).eq('revision',input.revision).select('variant_id').maybeSingle();
    if(error) return reply({error:'Could not save workflow'},503);
    if(!updated) return reply({error:'Record changed. Refresh and retry.'},409);
    return reply({ok:true});
  } catch {return reply({error:'Campaign service unavailable'},503);}
}
