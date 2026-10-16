import { chromium } from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='../.design-backups/approved-redesign-before/qa';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
const progress={isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:35,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:false}))}))};
await context.addInitScript(()=>{if(location.hostname!=='127.0.0.1')return;localStorage.setItem('token','ui-regression');localStorage.setItem('studentId','ui-regression');localStorage.setItem('i18nextLng','en');window.speechSynthesis.speak=u=>{u.onstart?.();setTimeout(()=>u.onend?.(),80)};window.speechSynthesis.cancel=()=>{};});
await context.route('**/api/students/profile',r=>r.fulfill({json:{_id:'ui-regression',grade:'3',fullName:'Review'}}));await context.route('**/api/working-memory/improvement/progress/**',r=>r.fulfill({json:{success:true,data:progress}}));await context.route('**/*youtube*',r=>r.fulfill({body:'',contentType:'text/html'}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function shot(name){await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));await page.screenshot({path:`${out}/${name}.png`});console.log('Captured',name)}
await page.goto('http://127.0.0.1:5173/improvement-wm/3');await page.locator('.lx-level-card').first().waitFor();await page.waitForFunction(()=>!document.querySelector('.lx-level-card').disabled);await shot('01-level-map');await page.locator('.lx-level-card').first().click();await page.locator('.lx-menu-board').waitFor();await shot('02-level-menu');await page.getByRole('button',{name:'Pattern',exact:true}).click();await page.locator('.lx-howto-board').waitFor();await shot('how-to-play');await page.getByRole('button',{name:"Skip & Play",exact:true}).click();await page.locator('.lx-pattern-options').waitFor();await shot('03-pattern');assert.equal(await page.locator('.lx-nav-language').count(),0);
for(const game of ['words','instructions','numbers']){
 await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/3/1/${game}`);await page.getByRole('button',{name:"Skip & Play",exact:true}).click();await page.locator('.lx-board').waitFor();await shot(`${game}-initial`);
 if(game==='words'){assert.equal(await page.locator('.lx-picture-sequence [data-item-id]').count(),0);await page.getByRole('button',{name:'Ready',exact:true}).click();await shot('10-picture-memorise');await page.locator('.lx-picture-pool').waitFor({timeout:15000});await shot('11-picture-drag-drop');}
 if(game==='instructions'){assert.equal(await page.getByRole('button',{name:'Show the Question',exact:true}).count(),0);await page.getByRole('button',{name:'Listen',exact:true}).click();await page.getByRole('button',{name:'Show the Question',exact:true}).waitFor({timeout:15000});await page.getByRole('button',{name:'Show the Question',exact:true}).click();await shot('05-instructions-question');}
 if(game==='numbers'){await page.locator('.lx-keypad').waitFor({timeout:15000});assert.equal(await page.locator('.lx-keypad button').count(),10);await shot('08-numbers-keypad');}
}
assert.deepEqual(errors,[]);await browser.close();
