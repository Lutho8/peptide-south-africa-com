import { mkdir,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { BODY,HOOKS,CAMPAIGN,SCRIPT_VERSION,source,campaignLink } from '../../src/lib/dusk/campaign.ts';
const directory=resolve(process.argv[2] || 'work/dusk-briefs');
await mkdir(directory,{recursive:true});
const bodyHash=createHash('sha256').update(BODY).digest('hex');
for(const [variant,hook] of Object.entries(HOOKS)) {
  const brief={campaign_id:CAMPAIGN,variant_id:variant,script_version:SCRIPT_VERSION,body_sha256:bodyHash,status:'draft',
    narration:{hook,body:BODY},source,
    shots:[
      {seconds:'0–5',visual:'Exact supplied Pinealon packshot on existing DUSK navy background; subtle camera movement.',overlay:hook},
      {seconds:'5–12',visual:'EDR / Glu–Asp–Arg typography. Abstract molecular forms, labelled illustrative.',overlay:'Pinealon · synthetic tripeptide'},
      {seconds:'12–24',visual:'Restrained lab imagery, no clinical before/after or human outcomes.',overlay:'Cell study · oxidative stress and cell survival\nPMID 21978084'},
      {seconds:'24–35',visual:'High-contrast evidence-limit card; do not imply sleep-stage changes.',overlay:'Laboratory findings do not establish human benefits.'},
      {seconds:'35–45',visual:'Supplied logo and approved packshot. Research landing-page CTA.',overlay:'Explore the evidence and its limits.\nLaboratory research only · Not for human use.'},
    ],
    persistent_disclaimer:'Laboratory research only · Not for human use',
    render_spec:{width:1080,height:1920,fps:30,format:'H.264 MP4 + AAC',target_seconds:45,captions:'Burn in reviewed captions; provide separate timed SRT after narration is locked.'},
    caption:`${hook} Explore Pinealon through a published cell study and its limitations. These findings do not establish safety or efficacy in people or validate DUSK as a sleep protocol. Laboratory research only; not for human use. Study: ${source}`,
    links:Object.fromEntries((['instagram','facebook','youtube','tiktok','organic'] as const).map(channel=>[channel,campaignLink(variant as keyof typeof HOOKS,channel)])),
    production_prompt:'Use only supplied, licensed brand assets. Animate background/lighting, preserving the exact vial and label through compositing. No generated label text, injection scenes, patient testimonials, health transformations, sleep benefits or medical-treatment claims. Add all scientific copy and disclaimers in the editor after generation.',
    gates:['Review original brand kit and rights','Review script and source','Create one shared scientific body master','Create three hook clips','Assemble and inspect each final cut','Record file and brand-kit checksums','Admin approves exact cut','Manual publishing only after platform review'],
    dependencies:['Original DUSK brand kit','Pinealon_DUSK_Video_Production_Kit.zip','First-cut MP4','Licensed voice/music assets'],
  };
  await writeFile(resolve(directory,`${variant}.json`),JSON.stringify(brief,null,2)+'\n');
}
console.log(`Exported 3 draft briefs with shared body hash ${bodyHash}`);
