import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {calculators,categories} from '../src/catalog.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173/calculator-world/';
const folder=new URL('../qa/',import.meta.url);await mkdir(folder,{recursive:true});
const errors=[],results=[];
try{
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:740},{width:768,height:1024}]){
  const context=await browser.newContext({viewport}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto(base);await page.locator('#search').fill('mortgage');assert.equal(await page.locator('.card:visible').count(),1);
  await page.locator('#search').fill('zxy-nothing');assert.ok(await page.locator('#no-results').isVisible());
  await page.locator('#search').fill('');assert.equal(await page.locator('.card:visible').count(),86);
  await page.screenshot({path:fileURLToPath(new URL(`home-${viewport.width}.png`,folder))});
  const list=viewport.width===1280||viewport.width===390?calculators:calculators.filter(c=>['mortgage-calculator','fraction-calculator','temperature-converter'].includes(c.id));
  for(const c of list){
   const response=await page.goto(base+c.id+'.html');assert.equal(response.status(),200,c.id);
   await page.getByRole('button',{name:'Calculate',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('#result h2')||!document.querySelector('#form-error').hidden);
   assert.ok(await page.locator('#form-error').isHidden(),c.id+': '+await page.locator('#form-error').textContent());
   assert.ok((await page.locator('#result dd').count())>0,c.id);assert.ok(!/NaN|Infinity/.test(await page.locator('#result').textContent()),c.id);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,c.id+' overflow at '+viewport.width);
   const unlabeled=await page.evaluate(()=>[...document.querySelectorAll('input,select,textarea')].some(e=>!e.labels?.length));assert.equal(unlabeled,false,c.id);
   if(c.id==='mortgage-calculator'){
    await page.screenshot({path:fileURLToPath(new URL(`mortgage-${viewport.width}.png`,folder)),fullPage:true});
    await page.getByLabel('Mortgage principal',{exact:true}).fill('');await page.waitForFunction(()=>!document.querySelector('#form-error').hidden);assert.ok((await page.locator('#form-error').textContent()).includes('Enter'));
    await page.getByRole('button',{name:'Reset example'}).click();assert.ok(await page.locator('#form-error').isHidden());
    await page.getByLabel('Mortgage principal',{exact:true}).fill('1200');await page.getByLabel('Annual interest rate (%)',{exact:true}).fill('0');await page.getByLabel('Term (years)',{exact:true}).fill('1');await page.getByLabel('Monthly taxes, insurance and other costs',{exact:true}).fill('0');await page.getByLabel('Term (years)',{exact:true}).press('Enter');await page.waitForFunction(()=>document.querySelector('#result dd')?.textContent==='100');
   }
  }
  for(const key of Object.keys(categories)){await page.goto(base+'category-'+key+'.html');assert.ok(await page.locator('.card').count()>0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
  for(const path of ['about.html','privacy.html','terms.html','contact.html','404.html']){await page.goto(base+path);assert.equal(await page.locator('h1').count(),1);}
  await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
  results.push({viewport,calculatorsChecked:list.length,categoryPages:11,supportPages:5,errors:errors.length});await context.close();
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('browser-results.json',folder),JSON.stringify({base,results,consoleErrors:errors},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
