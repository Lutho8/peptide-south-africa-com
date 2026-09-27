import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.CATALOGUE_TEST_URL || 'http://127.0.0.1:4173';
const out = process.env.CATALOGUE_TEST_OUTPUT || '/mnt/data/psa-browser-results';
fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
try {
for (const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
 const context=await browser.newContext({viewport});
 // No real checkout submissions, marketing requests or external data mutations.
 await context.route('**/*',route=>{
   const req=route.request(), u=new URL(req.url());
   if (req.method() !== 'GET' && req.method() !== 'HEAD') return route.abort();
   if (u.origin !== new URL(base).origin) return route.abort();
   return route.continue();
 });
 await context.addInitScript(()=>{localStorage.setItem('psa.tracker-bonus.seen','1');});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/product/tesamorelin');
 await page.getByRole('heading',{name:'Tesamorelin 5 mg',exact:true}).waitFor();
 const close=page.getByRole('button',{name:/close/i});
 if (await close.count()) {for(const b of await close.all()) if(await b.isVisible()) await b.click();}
 assert.match(await page.getByTestId('selected-inclusions').innerText(),/3 vials; 5 mg in each/);
 assert.equal(await page.getByRole('button',{name:/Subscribe.*save|Request subscription|10-Pack/}).count(),0);
 await page.getByRole('button',{name:/5-Pack/}).first().click();
 assert.match(await page.getByTestId('selected-inclusions').innerText(),/5 vials; 5 mg in each/);
 assert.match(await page.locator('body').innerText(),/3[,\s]100/);
 await page.getByRole('button',{name:/Single Vial/}).click();
 assert.match(await page.getByTestId('selected-inclusions').innerText(),/1 vial; 5 mg/);
 await page.screenshot({path:`${out}/${name}-tesamorelin.png`,fullPage:false});
 await page.goto(base+'/product/kpv');
 await page.getByTestId('selected-inclusions').waitFor();
 await page.getByRole('button',{name:'Add to Cart',exact:true}).first().click();
 await page.goto(base+'/cart');
 await page.getByTestId('cart-subtotal').waitFor();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/1[,\s]007/);
 await page.getByRole('button',{name:'Add BAC water 10 ml',exact:true}).click();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/1[,\s]217/);
 await page.getByRole('button',{name:'Increase BAC water quantity',exact:true}).click();
 assert.match(await page.getByTestId('free-shipping-bar').innerText(),/away from free shipping/);
 await page.getByRole('button',{name:'Increase BAC water quantity',exact:true}).click();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/1[,\s]637/);
 assert.match(await page.getByTestId('free-shipping-bar').innerText(),/unlocked free shipping/);
 await page.goto(base+'/checkout');
 await page.getByTestId('pack-supplies-rail').waitFor();
 assert.match(await page.getByTestId('pack-supplies-rail').innerText(),/3 vials/);
 await page.getByRole('button',{name:'Remove BAC water',exact:true}).click();
 assert.match(await page.locator('body').innerText(),/R89|R89.00/);
 await page.screenshot({path:`${out}/${name}-checkout.png`,fullPage:false});
 await page.goto(base+'/build-your-stack');
 await page.getByLabel('Vial 1',{exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:/10-Pack/}).count(),0);
 const options=await page.getByLabel('Vial 1',{exact:true}).locator('option').evaluateAll(os=>os.map(o=>o.value));
 assert.equal(options.includes('bac-water-bacteriostatic'),false);
 assert.equal(options.includes('glow70'),false);
 const slugs=['rt3-reta','klow80','mots-c','ghk-cu-50mg','bpc-tb500-blend'];
 for(let i=0;i<5;i++) await page.getByLabel(`Vial ${i+1}`,{exact:true}).selectOption(slugs[i]);
 assert.match(await page.getByTestId('mix-total').innerText(),/4,060/);
 assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth>window.innerWidth),false);
 await page.screenshot({path:`${out}/${name}-builder.png`,fullPage:false});
 await page.goto(base+'/product/glow70');
 await page.getByRole('heading',{name:/^(Product Not Found|Page not found)$/i}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Add to Cart',exact:true}).count(),0);
 assert.deepEqual(errors,[]);
 results.push({viewport:name,result:'passed',checks:['strengths','pack inclusions','no subscription or 10-pack','BAC optional canonical quantity','delivery add/remove recalculation','checkout','mixed-five R4060','hidden product route','no horizontal overflow','no runtime errors']});
 await context.close();
}
fs.writeFileSync(`${out}/summary.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
} finally {await browser.close();}
