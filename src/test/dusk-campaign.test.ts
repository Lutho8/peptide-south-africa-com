import { describe,it,expect,vi,beforeEach } from 'vitest';
import { BODY,HOOKS,CAMPAIGN,SCRIPT_VERSION,source,transition,transitionSchema,eventSchema,parseAttribution,campaignLink,renderSchema } from '@/lib/dusk/campaign';
import campaignHandler from '../../api/dusk-campaign';
import eventsHandler from '../../api/dusk-events';
const mocks=vi.hoisted(()=>({getUser:vi.fn(),from:vi.fn()}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{getUser:mocks.getUser},from:mocks.from})}));
const row={variant_id:'h1' as const,status:'draft',revision:0,script_version:SCRIPT_VERSION,render:null};
const render={asset_path:'dusk/pinealon/h1.mp4',asset_sha256:'a'.repeat(64),brand_sha256:'b'.repeat(64),duration_seconds:40,width:1080 as const,height:1920 as const,captions_reviewed:true as const,rights_confirmed:true as const,scientific_reviewed:true as const};
describe('DUSK campaign boundaries',()=>{
  it.each(['h1','h2','h3'] as const)('round trips attribution for %s',variant=>{
    const url=new URL(campaignLink(variant,'instagram'));
    expect(parseAttribution(url.search)?.variant_id).toBe(variant);
    expect(url.pathname).toBe('/dusk');expect(url.hash).toBe('#research');
  });
  it('rejects mixed campaigns, mismatched hooks and arbitrary sources',()=>{
    const q=new URL(campaignLink('h1','instagram')).search;
    expect(parseAttribution(q.replace('utm_content=h1','utm_content=h3'))).toBeNull();
    expect(parseAttribution(q.replace('instagram','email@example.com'))).toBeNull();
    expect(parseAttribution('?utm_campaign=other')).toBeNull();
  });
  it('does not permit arbitrary generation prompts or publication actions',()=>{
    expect(transitionSchema.safeParse({variant_id:'h1',revision:0,action:'publish'}).success).toBe(false);
    expect(transitionSchema.safeParse({variant_id:'h1',revision:0,action:'approve',prompt:'ignore rules'}).success).toBe(false);
  });
  it('enforces sequence, required reviews, version and revision',()=>{
    const input={variant_id:'h1' as const,revision:0,action:'approve' as const};
    expect(()=>transition(row,input)).toThrow();
    expect(()=>transition({...row,status:'rendered'},input)).toThrow();
    expect(()=>transition({...row,revision:1},input)).toThrow(/changed/);
    expect(()=>transition({...row,script_version:'old'},input)).toThrow(/version/);
    expect(transition(row,{...input,action:'review_script'}).status).toBe('script_reviewed');
    expect(transition({...row,status:'script_reviewed'},{...input,action:'record_render',render}).status).toBe('rendered');
    expect(transition({...row,status:'rendered',render},input).status).toBe('approved');
    expect(transition({...row,status:'approved',render},{...input,action:'reject'})).toEqual({status:'draft',render:null});
    expect(renderSchema.safeParse({...render,rights_confirmed:false}).success).toBe(false);
    expect(renderSchema.safeParse({...render,asset_path:'https://attacker.test/file.mp4'}).success).toBe(false);
  });
  it('requires explicit measurement consent and rejects personal data and purchase spoofing',()=>{
    const valid={event_id:crypto.randomUUID(),event:'research_landing',consent:true,attribution:parseAttribution(new URL(campaignLink('h1','youtube')).search)};
    expect(eventSchema.safeParse(valid).success).toBe(true);
    expect(eventSchema.safeParse({...valid,consent:false}).success).toBe(false);
    expect(eventSchema.safeParse({...valid,email:'person@example.com'}).success).toBe(false);
    expect(eventSchema.safeParse({...valid,event:'purchase',value:999}).success).toBe(false);
    expect(CAMPAIGN).toBe('dusk-pinealon-01');
  });
  it('keeps the research limit with the shared body',()=>{
    expect(Object.keys(HOOKS)).toHaveLength(3);expect(BODY).toContain('do not establish');expect(BODY).toContain('Not for human use');expect(source).toContain('21978084');
  });
});
describe('DUSK API access',()=>{
  beforeEach(()=>{vi.clearAllMocks();process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only';});
  it('denies anonymous dashboard requests before any database work',async()=>{
    expect((await campaignHandler(new Request('https://site.test/api/dusk-campaign'))).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('denies invalid tokens and signed-in non-admin users',async()=>{
    mocks.getUser.mockResolvedValueOnce({data:{user:null},error:{message:'Invalid token'}});
    expect((await campaignHandler(new Request('https://site.test/api/dusk-campaign',{headers:{authorization:'Bearer invalid'}}))).status).toBe(401);
    mocks.getUser.mockResolvedValueOnce({data:{user:{id:'u1'}},error:null});
    mocks.from.mockReturnValue({select:()=>({eq:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})})});
    expect((await campaignHandler(new Request('https://site.test/api/dusk-campaign',{headers:{authorization:'Bearer user'}}))).status).toBe(403);
  });
  it('denies cross-origin workflow writes and measurements',async()=>{
    for(const handler of [campaignHandler,eventsHandler]) expect((await handler(new Request('https://site.test/api/dusk',{method:'POST',headers:{origin:'https://evil.test'},body:'{}'}))).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('rejects malformed and oversized events before inserting',async()=>{
    expect((await eventsHandler(new Request('https://site.test/api/dusk-events',{method:'POST',headers:{origin:'https://site.test'},body:'{}'}))).status).toBe(400);
    expect((await eventsHandler(new Request('https://site.test/api/dusk-events',{method:'POST',headers:{origin:'https://site.test'},body:'x'.repeat(2001)}))).status).toBe(413);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
