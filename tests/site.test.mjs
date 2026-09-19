import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {config} from '../src/config.mjs';
import {calculators,categories} from '../src/catalog.mjs';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
test('every HTML page: metadata, local links, language, headings, forms and scripts',async()=>{
 const files=(await readdir(root)).filter(x=>x.endsWith('.html')),titles=new Set(),descriptions=new Set();
 for(const f of files){const html=await read(f);assert.match(html,/<html lang="en">/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,f);assert.match(html,new RegExp(config.verification));
 const title=html.match(/<title>(.*?)<\/title>/)?.[1],description=html.match(/<meta name="description" content="(.*?)">/)?.[1];assert.ok(title&&description,f);assert.ok(!titles.has(title),'duplicate title '+f);titles.add(title);assert.ok(!descriptions.has(description),'duplicate description '+f);descriptions.add(description);
 assert.ok(html.includes(`rel="canonical" href="${config.origin+config.base+(f==='index.html'?'':f)}"`),f);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'duplicate IDs '+f);
 for(const [,attr,value] of html.matchAll(/\b(href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(value))continue;
  const resolved=new URL(value,config.origin+config.base+f);assert.ok(resolved.pathname.startsWith(config.base),'subdirectory escape: '+f+' '+value);
  const relative=resolved.pathname.slice(config.base.length)||'index.html';assert.ok((await stat(new URL(relative,root))).isFile(),f+' missing '+relative);
  if(resolved.hash&&attr==='href'){const target=relative===f?html:await read(relative);assert.ok(target.includes(`id="${resolved.hash.slice(1)}"`),f+' missing anchor '+value);}
 }
 for(const [,id] of html.matchAll(/<(?:input|select|textarea)\b[^>]*\bid="([^"]+)"/g))assert.ok(html.includes(`for="${id}"`),f+' missing label');
 for(const [,schema] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))assert.equal(JSON.parse(schema)['@type'],'BreadcrumbList');
 assert.ok(!/Advertising space|reserved for AdSense|TODO|Lorem ipsum/.test(html),f+' placeholder');
 }
 assert.equal(files.length,calculators.length+Object.keys(categories).length+6);
});
test('sitemap exactly covers indexable pages and excludes 404',async()=>{
 const xml=await read('sitemap.xml'),urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 const files=(await readdir(root)).filter(f=>f.endsWith('.html')&&f!=='404.html');
 assert.deepEqual(urls.sort(),files.map(f=>config.origin+config.base+(f==='index.html'?'':f)).sort());assert.equal(urls.length,new Set(urls).size);
 assert.match(await read('robots.txt'),/Allow: \//);assert.ok((await read('robots.txt')).includes(config.origin+config.base+'sitemap.xml'));
 assert.ok((await stat(new URL('.nojekyll',root))).isFile());
});
test('all calculators linked from home and category, and contain useful content',async()=>{
 const home=await read('index.html');
 for(const c of calculators){const html=await read(c.id+'.html'),hub=await read('category-'+c.category+'.html');assert.ok(home.includes(c.id+'.html'));assert.ok(hub.includes(c.id+'.html'));for(const title of ['Formula and method','Worked example','Assumptions and interpretation','Common question','Related calculators'])assert.ok(html.includes(title),c.id+': '+title);assert.ok(c.notes.length>80&&c.example.length>30);}
});
test('tracking and advertising disabled; per-page payload stays small',async()=>{
 assert.equal(config.analytics.enabled,false);assert.equal(config.advertising.enabled,false);assert.equal(config.analytics.measurementId,'');assert.equal(config.advertising.publisherId,'');
 const common=(await stat(new URL('assets/app.mjs',root))).size+(await stat(new URL('assets/core.mjs',root))).size+(await stat(new URL('styles.css',root))).size;
 for(const c of calculators)assert.ok(common+(await stat(new URL('assets/tools/'+c.id+'.mjs',root))).size<35000,c.id+' asset budget');
});
