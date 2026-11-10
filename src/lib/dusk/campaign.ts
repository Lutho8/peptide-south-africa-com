import { z } from 'zod';

export const CAMPAIGN = 'dusk-pinealon-01';
export const SCRIPT_VERSION = 'pinealon-research-v1';
export const BODY = 'Pinealon is a synthetic tripeptide: glutamic acid, aspartic acid and arginine. A published cell study examined oxidative stress and cell survival. These laboratory findings do not establish a safe or effective treatment in people, or demonstrate improved sleep. DUSK brings the research questions together. Explore the evidence and its limits. Laboratory research only. Not for human use.';
export const HOOKS = {
  h1: 'Three amino acids. One research question: what can cells tell us?',
  h2: 'Before a health claim, ask: what did the study actually measure?',
  h3: 'Meet Pinealon through the evidence, starting with the laboratory.',
} as const;
export const source = 'https://pubmed.ncbi.nlm.nih.gov/21978084/';
export const variantSchema = z.enum(['h1', 'h2', 'h3']);
export const channelSchema = z.enum(['instagram', 'facebook', 'youtube', 'tiktok', 'organic']);
export const attributionSchema = z.object({
  campaign_id: z.literal(CAMPAIGN), variant_id: variantSchema,
  utm_source: channelSchema, utm_medium: z.literal('video'),
  utm_campaign: z.literal(CAMPAIGN), utm_content: variantSchema,
}).strict().refine(v => v.variant_id === v.utm_content, 'Variant mismatch');
export function campaignLink(variant: keyof typeof HOOKS, channel: z.infer<typeof channelSchema>) {
  const params = new URLSearchParams({campaign_id:CAMPAIGN, variant_id:variant, utm_source:channel, utm_medium:'video', utm_campaign:CAMPAIGN, utm_content:variant});
  return `https://www.peptide-south-africa.com/dusk?${params}#research`;
}
export function parseAttribution(search: string) {
  const params = new URLSearchParams(search);
  const fields = ['campaign_id','variant_id','utm_source','utm_medium','utm_campaign','utm_content'];
  const result = attributionSchema.safeParse(Object.fromEntries(fields.map(k=>[k,params.get(k)])));
  return result.success ? result.data : null;
}
export const renderSchema = z.object({
  asset_path: z.string().regex(/^dusk\/pinealon\/[a-zA-Z0-9_-]+\.mp4$/),
  asset_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  brand_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  duration_seconds: z.number().min(25).max(60), width: z.literal(1080), height: z.literal(1920),
  captions_reviewed: z.literal(true), rights_confirmed: z.literal(true), scientific_reviewed: z.literal(true),
}).strict();
export const transitionSchema = z.object({
  variant_id: variantSchema, revision: z.number().int().nonnegative(),
  action: z.enum(['review_script','record_render','approve','reject']),
  render: renderSchema.optional(),
}).strict();
export type Creative = {variant_id:keyof typeof HOOKS; status:string; revision:number; script_version:string; render: z.infer<typeof renderSchema> | null};
export function transition(row: Creative, input: z.infer<typeof transitionSchema>) {
  if (row.revision !== input.revision) throw new Error('This record changed. Refresh before continuing.');
  if (row.script_version !== SCRIPT_VERSION) throw new Error('Script version changed. Review again.');
  if (input.action === 'reject') return {status:'draft',render:null};
  if (input.action === 'review_script' && row.status === 'draft') return {status:'script_reviewed',render:null};
  if (input.action === 'record_render' && row.status === 'script_reviewed' && input.render) return {status:'rendered',render:renderSchema.parse(input.render)};
  if (input.action === 'approve' && row.status === 'rendered') return {status:'approved',render:renderSchema.parse(row.render)};
  throw new Error('Invalid workflow step.');
}
export const eventSchema = z.object({
  event_id:z.string().uuid(), consent:z.literal(true),
  event:z.enum(['research_landing','research_source_click']), attribution:attributionSchema,
}).strict();
