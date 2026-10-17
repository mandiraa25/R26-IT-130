import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out='../.design-backups/ui-refinement-before/qa/visual';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
await context.addInitScript(()=>{if(location.origin!=='http://127.0.0.1:5173')return;localStorage.setItem('token','refinement-review');localStorage.setItem('i18nextLng','en');window.speechSynthesis.speak=u=>{window.__speech=u;u.onstart?.()};window.speechSynthesis.cancel=()=>{}});
const progress={isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:360,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:true}))}))};
await context.route('**/api/**',r=>r.fulfill({json:r.request().url().includes('/profile')?{_id:'review',grade:'3'}:{success:true,data:progress}}));
await context.route('**/*youtube*',r=>r.fulfill({body:''}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.clock.install();
async function shot(name){await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));await page.evaluate(()=>document.fonts.ready);
 const overflow=await page.locator('.lx-board').evaluate(board=>{const r=board.getBoundingClientRect();return [...board.querySelectorAll('button,h1,[role=button]')].filter(e=>{if(!e.getClientRects().length)return false;const b=e.getBoundingClientRect();return b.left<r.left||b.right>r.right||b.top<r.top||b.bottom>r.bottom}).map(e=>e.textContent)});
 assert.deepEqual(overflow,[],`Clipped controls: ${name}`);
 await page.screenshot({path:`${out}/${name}.png`});console.log('Captured',name)}
async function board(){assert.deepEqual(await page.locator('.lx-board').evaluate(e=>{const s=getComputedStyle(e);return [s.left,s.top,s.width,s.height]}),['300px','175px','1000px','580px']);}
for(const game of ['pattern','words','instructions','numbers']){
 await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/3/1/${game}`);await page.locator('.lx-howto-skip').click();await page.locator('.lx-board').waitFor();await board();await shot(`${game}-initial`);
 if(game==='words'){
  await page.getByRole('button',{name:'Ready',exact:true}).click();await shot('words-memorise');
  await page.clock.runFor(10050);await page.locator('.lx-picture-pool').waitFor();await shot('words-reorder');
  await page.locator('.lx-picture-pool [data-item-id]').first().dragTo(page.locator('.lx-picture-slot').first());await shot('words-reordered-one');
 }
 if(game==='numbers'){await page.clock.runFor(12100);await page.locator('.lx-keypad').waitFor();await shot('numbers-keypad');}
 if(game==='instructions'){
  await page.getByRole('button',{name:'Listen',exact:true}).click();await shot('instructions-listening');
  // Complete the real ordered speech callbacks, including the existing step gaps.
  for(let i=0;i<8 && !await page.getByRole('button',{name:'Show the Question',exact:true}).count();i++){await page.evaluate(()=>window.__speech?.onend?.());await page.clock.runFor(1050);}
  await shot('instructions-ready');await page.getByRole('button',{name:'Show the Question',exact:true}).click();await shot('instructions-options');
 }
}
// Real screening order, all fifteen questions, including each study/answer stage.
await page.goto('http://127.0.0.1:5173/working-memory/3?ids=all');
assert.equal(await page.locator('.lx-background').getAttribute('src'),'/images/workingMemory/shared/backgrounds/screening/forest.webp');
assert.equal(await page.locator('.wm-screen__standing-bunny').getAttribute('src'),'/images/workingMemory/shared/bunny/screening/bunny.webp');
const questions=await page.evaluate(async()=>(await import('/src/features/workingMemory/identification/data/index.js')).QUIZ_DATA['3'].en);
const captured=new Set();
for(let i=0;i<questions.length;i++){
 const q=questions[i];await page.locator('.wm-screen__question-title').waitFor();await board();
 assert.equal(await page.locator('.wm-screen__stars li').count(),15);
 const label=q.category.toLowerCase().replaceAll(' ','-');
 if(!captured.has(label)){await shot(`screening-${label}-initial`);}
 if(q.category==='Instruction'){await page.evaluate(()=>window.__speech?.onend?.());}
 else if(q.category!=='Pattern'){await page.clock.runFor(8050);}
 const options=page.getByTestId(q.category==='Pattern'?'wm-pattern-option':'wm-choice-option');await options.first().waitFor();
 if(!captured.has(label)){await shot(`screening-${label}-answer`);captured.add(label);}
 await options.nth(q.options.indexOf(q.correct)).click();
}
await page.getByTestId('wm-finished').waitFor();await shot('screening-complete');
assert.deepEqual(errors,[]);console.log('PASS unchanged board bounds, 1920x1080 stage captures, real 15-step screening flow.');await browser.close();
