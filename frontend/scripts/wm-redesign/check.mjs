import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out='../.design-backups/full-redesign-before/qa'; fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
const progress={isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:100,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:false}))}))};
await context.addInitScript(()=>{if(location.hostname!=="127.0.0.1")return;localStorage.setItem('token','ui-test');localStorage.setItem('studentId','ui-test');localStorage.setItem('i18nextLng','en');window.speechSynthesis.speak=u=>{u.onstart?.();setTimeout(()=>u.onend?.(),1)};window.speechSynthesis.cancel=()=>{};const interval=window.setInterval;window.setInterval=(fn,ms,...a)=>interval(fn,ms===1000?100:ms,...a);});
const submissions=[];
await context.route('**/api/**',async r=>{if(r.request().url().includes('submit-attempt')){submissions.push(r.request().postDataJSON());return r.fulfill({json:{success:true,data:{isPassed:true,totalStars:120}}});}if(r.request().url().includes('/progress/'))return r.fulfill({json:{success:true,data:progress}});return r.fulfill({json:{_id:'ui-test',grade:'3',fullName:'UI Review',totalStars:100}});});
await context.route('**/*youtube*',r=>r.fulfill({body:'',contentType:'text/html'}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const shot=async name=>{await page.locator("img").evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));await page.screenshot({path:`${out}/${name}.png`});};
async function bounds(name){const bad=await page.evaluate(()=>{const board=document.querySelector('.adaptive-vine-board,.result-vine-board');if(!board)return [];const b=board.getBoundingClientRect();return [...board.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.x<b.x-2||r.right>b.right+2||r.y<b.y-2||r.bottom>b.bottom+2)}).map(e=>e.textContent.trim())});if(bad.length)console.log('BOUNDS',name,JSON.stringify(bad));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow');}
for(const level of (process.env.QA_LEVELS||"1,2,3,4").split(",").map(Number))for(const game of ['pattern','numbers','words','instructions']){
 await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/3/${level}/${game}`);
 await page.locator('.how-video-board').waitFor();await page.getByRole('button',{name:'Skip video and play',exact:true}).click();await page.getByRole('button',{name:'Start the game',exact:true}).click();
 const data=await page.evaluate(async({level,game})=>{const m=await import('/src/pages/workingMemory/data/improvement/index.js');return m.getSubCategoryData('3',level,game,'en').questions;},{level,game});
 for(let index=0;index<5;index++){
  if(game==='pattern'){
   await page.locator('.pattern-choice-tile').first().waitFor();if(index===0)await shot(`${level}-${game}-answer`);
   const seq=await page.locator('.pattern-answer-sequence-panel .pattern-sequence-tile').allTextContents();const q=data.find(q=>q.showItems.join('')===seq.join(''));assert(q,'actual pattern');const answer=(process.env.QA_WRONG_FIRST && index===0) ? q.options.find(o=>o!==q.missingAnswer) : q.missingAnswer??q.correct[0];
   const choices=page.locator('.pattern-choice-tile');const texts=await choices.allTextContents();await choices.nth(texts.findIndex(t=>t.trim()===answer)).click();await page.locator('[data-action="check"]').click();
  }else if(game==='numbers'){
   await page.locator('.number-sequence-panel').waitFor();const nums=(await page.locator('.number-sequence-panel .level-number-circle').allTextContents()).map(x=>x.trim());if(index===0)await shot(`${level}-${game}-show`);
   await page.locator('.number-choice-panel').waitFor();if(index===0)await shot(`${level}-${game}-answer`);
   const q=data.find(q=>q.showItems.join()===nums.join());assert(q);if(index===0){await page.locator(".number-choice-panel button").filter({hasText:new RegExp("^"+q.correct[0]+"$")}).press("Enter");await page.locator(".number-answer-slots button").first().click();assert.equal(await page.locator(".number-choice-panel button").count(),10);}const answer=[...q.correct];if(process.env.QA_WRONG_FIRST&&index===0)answer.reverse();for(const n of answer)await page.locator('.number-choice-panel button').filter({hasText:new RegExp('^'+n+'$')}).click();await page.locator('[data-action="check"]').click();
  }else if(game==='words'){
   await page.locator('.words-memory-grid--original').waitFor();const ids=await page.locator('.words-memory-grid--original > [data-item-id]').evaluateAll(es=>es.map(e=>e.dataset.itemId));await page.locator('[data-action="play"]').click();if(index===0)await shot(`${level}-${game}-show`);
   await page.locator('.words-drag-pool').waitFor();if(index===0)await shot(`${level}-${game}-answer`);
   if(process.env.QA_WRONG_FIRST&&index===0)ids.reverse();if(index===0&&!process.env.QA_WRONG_FIRST){
 const slots=page.locator('.words-answer-slots > div');const first=page.locator('.words-drag-pool [data-item-id]').first();const id=await first.getAttribute('data-item-id');
 await first.dragTo(slots.nth(0));assert.equal(await slots.nth(0).locator('[data-item-id]').getAttribute('data-item-id'),id);
 const second=page.locator('.words-drag-pool [data-item-id]').first();const id2=await second.getAttribute('data-item-id');await second.dragTo(slots.nth(1));
 await slots.nth(0).locator('[data-item-id]').dragTo(slots.nth(1));assert.equal(await slots.nth(1).locator('[data-item-id]').getAttribute('data-item-id'),id);assert.equal(await slots.nth(0).locator('[data-item-id]').getAttribute('data-item-id'),id2);
 for(let i=0;i<2;i++){await slots.nth(i).click();await slots.nth(i).press('Enter');}
 assert.equal(await page.locator('.words-drag-pool [data-item-id]').count(),ids.length);
}
for(const id of ids)await page.locator(`.words-drag-pool [data-item-id="${id}"]`).click();await page.locator('[data-action="check"]').click();
  }else{
   await page.locator('[data-action="show-question"]').waitFor();if(index===0)await shot(`${level}-${game}-listen`);await page.locator('[data-action="listen-again"]').click();await page.locator('[data-action="show-question"]').click();
   const title=(await page.locator('.instructions-vine-board .instruction-tag span').first().textContent()).trim();const options=await page.locator('.instructions-vine-board .grid button').allTextContents();const q=data.find(q=>q.questionText===title && q.options.every(o=>options.some(t=>t.trim()===o)));assert(q,'actual instruction');if(index===0)await shot(`${level}-${game}-answer`);await page.locator('.instructions-vine-board .grid button').filter({hasText:process.env.QA_WRONG_FIRST&&index===0?q.options.find(o=>o!==q.correct):q.correct}).click();
  }
  await page.locator('[data-action="next"],[data-action="finish"]').waitFor();await bounds(`${level}-${game}-feedback`);if(index===0)await shot(`${level}-${game}-feedback`);await page.locator('[data-action="next"],[data-action="finish"]').click();
 }
 await page.locator('.result-vine-board').waitFor();await bounds(`${level}-${game}-result`);await shot(`${level}-${game}-result`);const attempt=submissions.at(-1);assert.equal(attempt.score,process.env.QA_WRONG_FIRST?4:5);assert.equal(attempt.questionResults.length,5);console.log('PASS',level,game,attempt.score+'/5 submission');
}
await page.goto('http://127.0.0.1:5173/improvement-wm/3');await page.locator('.wm-level-card').first().waitFor();await shot('level-map');await page.locator('.wm-level-card').first().click();await shot('game-selection');assert.deepEqual(errors,[]);console.log('PASS: requested full games, score/submission; no browser exceptions.');await browser.close();
