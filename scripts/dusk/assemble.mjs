// Local deterministic assembly. No provider calls, downloads, credentials or publication.
import { spawnSync } from 'node:child_process';
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const [hook,body,output]=process.argv.slice(2).map(p=>resolve(p));
if(!hook || !body || !output || !output.endsWith('.mp4') || output===hook || output===body) throw new Error('Usage: node scripts/dusk/assemble.mjs hook.mp4 shared-body.mp4 output.mp4');
const result=spawnSync(process.env.DUSK_FFMPEG || 'ffmpeg',['-nostdin','-n','-i',hook,'-i',body,'-filter_complex','[0:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v0];[1:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v1];[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]','-map','[v]','-map','[a]','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',output],{stdio:'inherit'});
if(result.error || result.status!==0) throw new Error('Assembly failed. Install ffmpeg and provide two clips with audio; no workflow approval was changed.');
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
await writeFile(output+'.provenance.json',JSON.stringify({hook_sha256:await hash(hook),shared_body_sha256:await hash(body),asset_sha256:await hash(output),assembled_at:new Date().toISOString(),approval:'pending'},null,2)+'\n');
console.log('Assembly complete. Review the final cut, timing, captions and brand kit before approval.');
