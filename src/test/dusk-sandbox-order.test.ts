import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {it,expect} from 'vitest';
import * as guestTracking from '../../api/_shared/guestTracking';
import * as delivery from '../../api/_shared/delivery';
import * as pricing from '../../supabase/functions/_shared/pricing';
import * as catalog from '../../supabase/functions/_shared/catalog-release';
import * as consent from '../../supabase/functions/_shared/checkout-consent';

it('isolated order sandbox: both real handlers, packs, replay, stale cart, consent and auth',async()=>{
 const rows:Record<string,any[]>={};
 const uid='22222222-2222-4222-8222-222222222222';
 const admin={rpc:async()=>({data:true,error:null}),from(table:string){let value:any=null;const filters:any[]=[];let done=false;let result:any;
 const execute=()=>{if(done)return result;done=true;rows[table]??=[];if(value){const row={id:crypto.randomUUID(),...value};rows[table].push(row);result={data:row,error:null};}else result={data:rows[table].find(row=>filters.every(([k,v])=>row[k]===v))??null,error:null};return result;};
 const q:any={select:()=>q,eq:(k:string,v:any)=>{filters.push([k,v]);return q;},limit:()=>q,insert:(v:any)=>{value=v;return q;},single:async()=>execute(),maybeSingle:async()=>execute(),then:(resolve:any)=>Promise.resolve(execute()).then(resolve)};return q;}};
 const createClient=(_url:string,_key:string,options:any)=>options?.global?{auth:{getUser:async()=>({data:{user:{id:uid}},error:null})}}:admin;
 const env={SUPABASE_URL:'https://sandbox.invalid',SUPABASE_ANON_KEY:'fixture',SUPABASE_SERVICE_ROLE_KEY:'fixture-service-role-key-is-over-32-characters',CHECKOUT_STORE_SECRET:'sandbox-only',EFT_ACCOUNT_NAME:'SANDBOX DO NOT PAY',EFT_ACCOUNT_NUMBER:'0000000000',EFT_BRANCH_CODE:'000000'};
 let edge:any;
 const requireMock=(name:string)=>name.includes('supabase-js')?{createClient}:name.includes('/guestTracking')?guestTracking:name.includes('/delivery')?delivery:name.includes('catalog-release')?catalog:name.includes('checkout-consent')?consent:name.includes('pricing')?pricing:name.includes('partnerAttribution')?{resolvePartnerAttribution:async()=>null}:{};
 const load=(file:string,extra:any={})=>{const exports:any={};vm.runInNewContext(ts.transpile(readFileSync(file,'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}),{exports,require:requireMock,Response,Request,crypto,console,TextEncoder,process:{env},Deno:{env:{get:(n:string)=>env[n as keyof typeof env]},serve:(h:any)=>{edge=h;}},...extra});return exports;};
 load('supabase/functions/eft-create-order/index.ts');
 const api=load('api/eft-create-order.ts',{fetch:async(url:string,init:any)=>{expect(url).toBe('https://sandbox.invalid/functions/v1/eft-create-order');return edge(new Request(url,init));}}).default;
 const base={catalogVersion:catalog.CATALOG_VERSION,firstName:'Sandbox',lastName:'Test',email:'sandbox@example.invalid',delivery:{address_line_1:'1 Sandbox Road',city:'Cape Town',province:'Western Cape',postal_code:'8001'},consent:{researchPurchaseAcknowledged:true,marketingConsent:false,policyVersion:consent.CHECKOUT_POLICY_VERSION,reportScopeVersion:consent.REPORT_SCOPE_VERSION,clientAcceptedAt:new Date().toISOString()}};
 const send=(body:any,auth=true)=>api(new Request('https://sandbox.invalid/api/eft-create-order',{method:'POST',headers:auth?{Authorization:'Bearer sandbox'}:{},body:JSON.stringify(body)}));
 for(const [slug,prices] of Object.entries({selank:[888,2037,3196],semax:[788,1782,2796],cerebrolysin:[688,1527,2396],epitalon:[688,1527,2396],pinealon:[709,1581,2480]})){
 for(const [i,variantLabel] of ['Single Vial','3-Pack','5-Pack'].entries()){
 const body={...base,requestId:crypto.randomUUID(),selections:[{kind:'item',slug,variantLabel,quantity:1}]};
 const res=await send(body);const data=await res.json();expect(data,JSON.stringify(data)).toMatchObject({ok:true,amount:prices[i]});expect(res.status).toBe(200);expect(data.payment_reference).toMatch(/^PSA-[0-9A-Z]{6}$/);
 const replay=await(await send(body)).json();expect(replay.order_id).toBe(data.order_id);expect(replay.payment_reference).toBe(data.payment_reference);
 }}
 expect(rows.orders.every(r=>r.shipping_address.address_line_1==='1 Sandbox Road' && r.shipping_address.postal_code==='8001' && r.customer_email==='sandbox@example.invalid')).toBe(true);
 expect(rows.orders).toHaveLength(15);expect(rows.psa_orders).toHaveLength(15);expect(rows.email_outbox).toHaveLength(15);expect(rows.checkout_consents).toHaveLength(15);
 expect(rows.psa_orders.every(r=>r.payment_status==='awaiting_eft')).toBe(true);
 const body={...base,requestId:crypto.randomUUID(),selections:[{kind:'item',slug:'selank',variantLabel:'3-Pack',quantity:1}]};
 expect((await send({...body,delivery:null})).status).toBe(400);
 expect((await send({...body,delivery:{...base.delivery,postal_code:'bad'}})).status).toBe(400);
 expect((await send(body,false)).status).toBe(503);
 expect((await send({...body,catalogVersion:'old'})).status).toBe(409);
 expect((await send({...body,consent:null})).status).toBe(400);
 expect(rows.orders).toHaveLength(15);
 const existing=rows.orders[0];
 const conflict={...base,requestId:existing.checkout_request_id,selections:existing.order_items,delivery:{...base.delivery,address_line_1:'2 Changed Road'}};
 expect((await send(conflict)).status).toBe(409);
 console.log('SANDBOX: 15 orders, 15 replay checks, 15 queued-only emails, auth/stale/consent guards passed; zero external requests.');
});
