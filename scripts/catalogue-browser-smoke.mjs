import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.CATALOGUE_TEST_URL || 'http://127.0.0.1:4173';
const out = process.env.CATALOGUE_TEST_OUTPUT || '/mnt/data/psa-browser-results';
fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
try {
for (const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
 const context=await browser.newContext({viewport,hasTouch:name==='mobile',isMobile:name==='mobile'});
 // No real checkout submissions, marketing requests or external data mutations.
 await context.route('**/*',route=>{
   const req=route.request(), u=new URL(req.url());
   if (req.method() !== 'GET' && req.method() !== 'HEAD') return route.abort();
   if (u.origin !== new URL(base).origin) return route.abort();
   return route.continue();
 });
 await context.addInitScript(()=>{
   localStorage.setItem('psa.tracker-bonus.seen','1');
   localStorage.removeItem('psa-cookie-consent');
   localStorage.removeItem('rtt-cookie-consent');
 });
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Production serves prerendered HTML before React attaches event handlers.
 // The cookie dialog mounts only in a client effect. Dismissing it proves
 // client interaction is ready; visible SSR product markup alone does not.
 const gotoReady = async (path) => {
   await page.goto(base+path, {waitUntil:'networkidle'});
   const consent=page.getByRole('dialog',{name:'Cookie preferences',exact:true});
   await expect(consent).toBeVisible({timeout:15000});
   await consent.getByRole('button',{name:'Decline cookies',exact:true}).click();
   await expect(consent).toBeHidden();
 };
 // A full navigation must not race React's effect that persists cart changes.
 // Assert the actual stored cart instead of masking a lost click with a delay.
 const waitForStoredQuantity = async (slug, quantity) => {
   await expect.poll(() => page.evaluate(slug => {
     const items=JSON.parse(localStorage.getItem('psa.cart.v1') || '[]');
     return items.filter(item=>item.product.slug===slug).reduce((sum,item)=>sum+item.quantity,0);
   },slug), {timeout:10000,message:`Persist ${slug} quantity ${quantity} before navigation`}).toBe(quantity);
 };
 await gotoReady('/product/bac-water-bacteriostatic');
 await page.getByTestId('selected-inclusions').waitFor();
 assert.match(await page.getByTestId('selected-inclusions').innerText(),/10 ml per vial, sold separately/);
 assert.equal(await page.getByRole('button',{name:/3-Pack|5-Pack/}).count(),0);
 await page.getByRole('button',{name:'Add to Cart',exact:true}).first().click();
 await waitForStoredQuantity('bac-water-bacteriostatic',1);
 await gotoReady('/cart');
 await page.getByTestId('cart-subtotal').waitFor();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/210/);
 await page.getByRole('button',{name:'Remove BAC water',exact:true}).click();
 await waitForStoredQuantity('bac-water-bacteriostatic',0);
 await gotoReady('/product/tesamorelin');
 await page.getByRole('heading',{name:'Tesamorelin 5 mg',exact:true}).waitFor();
 assert.equal(await page.locator('img[src*="tesamorelin-5mg.webp"]').count()>0,true);
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
 await gotoReady('/product/kpv');
 await page.getByTestId('selected-inclusions').waitFor();
 await page.getByRole('button',{name:'Add to Cart',exact:true}).first().click();
 await waitForStoredQuantity('kpv',1);
 await expect(page.getByTestId('cart-drawer-total')).toHaveText(/1[,\s]096/);
 await gotoReady('/cart');
 await page.getByTestId('cart-subtotal').waitFor();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/1[,\s]007/);
 await page.getByRole('button',{name:'Add BAC water 10 ml',exact:true}).click();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/1[,\s]217/);
 await page.getByRole('button',{name:'Increase BAC water quantity',exact:true}).click();
 assert.match(await page.getByTestId('free-shipping-bar').innerText(),/away from free shipping/);
 await page.getByRole('button',{name:'Increase BAC water quantity',exact:true}).click();
 assert.match(await page.getByTestId('cart-subtotal').innerText(),/1[,\s]637/);
 assert.match(await page.getByTestId('free-shipping-bar').innerText(),/unlocked free shipping/);
 await waitForStoredQuantity('bac-water-bacteriostatic',3);
 const recommendation=page.getByTestId('pack-supplies-rail');
 await expect(recommendation).toContainText('3 vials');
 assert.equal(await recommendation.getByRole('link',{name:'View BAC water 10 ml product'}).getAttribute('href'),'/product/bac-water-bacteriostatic');
 await gotoReady('/checkout');
 await expect(page.getByTestId('checkout-shipping')).toContainText('Free');
 await expect(page.getByTestId('checkout-total')).toHaveText(/1[,\s]637/);
 await gotoReady('/cart');
 await recommendation.getByRole('button',{name:'Remove BAC water',exact:true}).click();
 await waitForStoredQuantity('bac-water-bacteriostatic',0);
 await expect(page.getByTestId('cart-total')).toHaveText(/1[,\s]096/);
 await gotoReady('/checkout');
 await expect(page.getByTestId('checkout-shipping')).toContainText(/R\s?89\b/);
 await expect(page.getByTestId('checkout-total')).toHaveText(/1[,\s]096/);
 await gotoReady('/cart');
 await recommendation.getByRole('button',{name:'Add BAC water 10 ml',exact:true}).click();
 await waitForStoredQuantity('bac-water-bacteriostatic',1);
 await gotoReady('/checkout');
 await expect(page.getByTestId('checkout-total')).toHaveText(/1[,\s]306/);
 await page.screenshot({path:`${out}/${name}-checkout.png`,fullPage:false});
 if (name === 'mobile') {
   await page.getByRole('button',{name:/Order summary/}).tap();
   await expect(page.getByTestId('checkout-total')).toBeVisible();
   await page.getByRole('button',{name:/Order summary/}).tap();
   await expect(page.getByTestId('checkout-total')).toBeHidden();
   const fixtureToken = 'checkout-browser-fixture';
   const fixtureReference = 'PSA-FIXTUR';
   let submissions = 0;
   let requestId;
   let paymentStatus = 'pending';
   await page.route(base+'/api/eft-create-order', async route => {
     assert.equal(route.request().method(),'POST');
     const body = route.request().postDataJSON();
     assert.equal(body.consent.researchPurchaseAcknowledged,true);
     assert.equal(body.delivery.postal_code,'8001');
     submissions++;
     if (submissions === 1) {
       requestId = body.requestId;
       await route.fulfill({status:503,json:{error:'Payment is temporarily unavailable. Please try again shortly.'}});
       return;
     }
     assert.equal(body.requestId,requestId);
     await route.fulfill({json:{
       order_id:'browser-fixture',amount:1306,payment_reference:fixtureReference,
       bank:{account_name:'Test only',bank:'Test only',account_number:'0000000000',branch_code:'000000'},
       tracking_url:base+'/track-order#'+fixtureToken,
     }});
   });
   await page.route(base+'/api/guest-order-status', async route => {
     assert.equal(route.request().method(),'POST');
     assert.equal(route.request().postDataJSON().token,fixtureToken);
     if (paymentStatus === 'expired') {
       await route.fulfill({status:404,json:{error:'This tracking link is invalid or expired.'}});
       return;
     }
     await route.fulfill({json:{status:paymentStatus,total:1306,currency:'ZAR'}});
   });
   await page.goto(base+'/checkout', {waitUntil:'domcontentloaded'});
   const cookieBanner = page.getByRole('dialog',{name:'Cookie preferences',exact:true});
   await expect(cookieBanner).toBeVisible();
   for (const [label,value] of Object.entries({
     'Email address':'checkout-fixture@example.invalid','First name':'Test','Last name':'Customer',
     'Street address':'1 Fixture Street','City':'Cape Town','Postal code':'8001',
   })) {
     await page.getByLabel(label,{exact:true}).fill(value);
   }
   await page.getByLabel('Province',{exact:true}).selectOption('Western Cape');
   const submit = page.getByRole('button',{name:/Place order/i});
   await submit.tap();
   await expect(page.getByRole('alert').filter({hasText:'Confirm the research purchase acknowledgement'})).toBeVisible();
   const acknowledgement = page.getByRole('checkbox').first();
   await expect(acknowledgement).toBeFocused();
   assert.equal(submissions,0);
   await acknowledgement.check();
   await expect(cookieBanner).toBeVisible();
   await submit.tap();
   await expect(page.getByText('Payment is temporarily unavailable. Please try again shortly.',{exact:true})).toBeVisible();
   await expect(page.getByLabel('Email address',{exact:true})).toHaveValue('checkout-fixture@example.invalid');
   await submit.tap();
   await expect(page.getByRole('heading',{name:'Pay by EFT',exact:true})).toBeVisible();
   assert.equal(submissions,2);
   const proofLink = page.getByRole('link',{name:'Send proof of payment'});
   const proofUrl = new URL(await proofLink.getAttribute('href'));
   assert.equal(proofUrl.origin,'https://wa.me');
   assert.match(proofUrl.pathname,/^\/27\d{9}$/);
   assert.match(proofUrl.searchParams.get('text'),new RegExp(fixtureReference));
   await expect(page.getByRole('button',{name:"I've made the payment"})).toHaveCount(0);
   await expect(page.getByRole('link',{name:'Return to checkout'})).toHaveCount(0);
   const trackOrder = page.getByRole('link',{name:'Track this order securely'});
   const orderStatus = page.getByRole('main').getByRole('status');
   await trackOrder.click();
   await expect(orderStatus).toContainText('Awaiting EFT payment');
   paymentStatus = 'paid';
   await page.getByRole('button',{name:'Check again'}).click();
   await expect(orderStatus).toContainText('Payment confirmed');
   paymentStatus = 'expired';
   await page.getByRole('button',{name:'Check again'}).click();
   await expect(orderStatus).toContainText('invalid or expired');
   await page.goBack({waitUntil:'domcontentloaded'});
   await expect(page.getByRole('heading',{name:'Bank details',exact:true})).toBeVisible();
   await expect(trackOrder).toBeVisible();
   await page.goto(base+'/track-order', {waitUntil:'domcontentloaded'});
   await expect(orderStatus).toContainText('secure link in your EFT instructions email');
   await page.goto(base+'/product/ghk-cu-50mg', {waitUntil:'domcontentloaded'});
   await expect(cookieBanner).toBeVisible();
   await page.getByRole('button',{name:'Add to Cart',exact:true}).first().tap();
   await page.getByRole('link',{name:'Continue to checkout',exact:true}).tap();
   await expect(page.getByRole('heading',{name:'Checkout',exact:true})).toBeVisible();
   await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
   await expect(page.getByRole('button',{name:'Close cart',exact:true})).toHaveCount(0);
   await expect(page.getByLabel('Email address',{exact:true})).toHaveCSS('font-size','16px');
 }
 await gotoReady('/build-your-stack');
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
 // Retired products may return a static 404 without the React app or cookie UI.
 await page.goto(base+'/product/glow70', {waitUntil:'networkidle'});
 await page.getByRole('heading',{name:/^(Product Not Found|Page not found)$/i}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Add to Cart',exact:true}).count(),0);
 assert.deepEqual(errors,[]);
 const checks = ['strengths','Tesamorelin 5 mg branded artwork','pack inclusions','no subscription or 10-pack','BAC standalone purchase','BAC optional canonical quantity','BAC cart recommendation add/remove','delivery add/remove recalculation','checkout','mixed-five R4060','hidden product route','no horizontal overflow','no runtime errors'];
 if (name === 'mobile') checks.push('one-tap cart checkout with cookie banner visible','expandable mobile order summary','validation and failed-request recovery','simulated EFT payment handoff','guest status refresh and expired-link guidance');
 results.push({viewport:name,result:'passed',checks});
 await context.close();
}
fs.writeFileSync(`${out}/summary.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
} finally {await browser.close();}
