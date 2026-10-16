import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out='../.design-backups/map-menu-clean-before/qa-final';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
await context.addInitScript(()=>{localStorage.setItem('token','popup-review');localStorage.setItem('i18nextLng','en')});
const progress={studentId:'review',isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:350,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map((subCategoryKey,i)=>({subCategoryKey,isUnlocked:levelNumber!==2||i===0,isCompleted:i<levelNumber}))}))};
await context.route('**/api/students/profile',r=>r.fulfill({json:{_id:'review',grade:'3'}}));await context.route('**/api/working-memory/improvement/progress/**',r=>r.fulfill({json:{success:true,data:progress}}));await context.route('**/*youtube*',r=>r.fulfill({body:''}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function shot(name){await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${out}/${name}.png`});console.log('Captured',name)}
await page.goto('http://127.0.0.1:5173/improvement-wm/3');await page.locator('.lx-level-card:not(:disabled)').first().waitFor();await shot('level-map');assert.equal(await page.locator('.lx-nav-stars strong').textContent(),'350');
for(let level=1;level<=4;level++){
 await page.locator('.lx-level-card').nth(level-1).click();await page.getByRole('dialog').waitFor();assert.equal(await page.locator('.lx-level-cards').count(),1);assert.equal(await page.locator('.lx-popup-game').count(),4);assert.equal(await page.locator('.lx-map-underlay').getAttribute('inert'),'');
 assert(await page.getByRole('dialog').evaluate(e=>{const r=e.getBoundingClientRect();return r.width<innerWidth&&r.height<innerHeight}));
 await shot(`level-${level}-popup`);
 assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
 if(level===2){await page.getByRole('button',{name:'Picture Game, locked',exact:true}).click();assert((await page.locator('.lx-popup-notice').textContent()).length>0);assert((await page.url()).includes('improvement-wm'));}
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),0);
}
await page.locator('.lx-level-card').first().click();await page.getByRole('button',{name:'Close game menu',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),0);
await page.locator('.lx-level-card').first().click();await page.getByRole('button',{name:'Numbers',exact:true}).click();await page.locator('.lx-howto-board').waitFor();assert(page.url().endsWith('/improvement-activity-wm/3/1/numbers'));
await page.getByRole('button',{name:'Back to game menu',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
await page.setViewportSize({width:1366,height:768});await shot('level-map-laptop');await page.locator('.lx-level-card').first().click();await shot('popup-laptop');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Numbers');
await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close game menu');
for(const [name,key] of [['Pattern','pattern'],['Picture Game','words'],['Instructions','instructions'],['Numbers','numbers']]){
 await page.getByRole('button',{name,exact:true}).click();await page.locator('.lx-howto-board').waitFor();assert(page.url().endsWith(`/improvement-activity-wm/3/1/${key}`));
 await page.getByRole('button',{name:'Back to game menu',exact:true}).click();await page.getByRole('dialog').waitFor();
}
await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});await page.locator('.lx-nav-language button').last().click();
await page.waitForFunction(()=>document.querySelector('.lx-adventure-heading')?.textContent.includes('ක්‍රියාකාරී'));await shot('level-map-sinhala');await page.locator('.lx-level-card').first().click();await page.getByRole('dialog').waitFor();await shot('popup-sinhala');
assert(!(await page.getByRole('dialog').textContent()).includes('???'));
const alphas=await page.evaluate(async()=>{const result={};for(const name of ['popup-vine-board','level-card-frame','thumb-pattern','thumb-words','thumb-instructions','thumb-numbers']){const img=new Image();img.src=`/images/workingMemory/map-menu/${name}.webp`;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);result[name]=[...x.getImageData(0,0,1,1).data][3]}return result});console.log('Corner alpha:',alphas);assert.equal(alphas['popup-vine-board'],0);
await page.locator('.lx-menu-overlay').click({position:{x:5,y:5}});
await page.getByRole('dialog').waitFor({state:'hidden'});
assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');
assert.equal(await page.locator('.lx-level-card').first().evaluate(e=>e===document.activeElement),true);
const dimensions=await page.evaluate(async()=>{const img=new Image();img.src='/images/workingMemory/map-menu/map-background.webp';await img.decode();return [img.naturalWidth,img.naturalHeight]});
assert.deepEqual(dimensions,[1600,900]);
assert.deepEqual(errors,[]);console.log('PASS popup, Escape/close/backdrop, restored focus/scroll, four game cards, live stars, locked games, routes, returning popup, 16:9 background, laptop layout. Artifacts:',out);await browser.close();
