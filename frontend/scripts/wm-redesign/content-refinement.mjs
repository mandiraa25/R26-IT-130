import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const out="../.design-backups/ui-refinement-before/qa/flows";
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
const progress={isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:35,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,isCompleted:true,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:true}))}))};
await context.addInitScript(()=>{
 if(location.origin!=='http://127.0.0.1:5173')return;
 localStorage.setItem('token','ui-regression');localStorage.setItem('studentId','ui-regression');localStorage.setItem('i18nextLng','en');
 window.__speech=[];window.speechSynthesis.speak=u=>{window.__speech.push({text:u.text,lang:u.lang,time:performance.now()});u.onstart?.();setTimeout(()=>u.onend?.(),20)};window.speechSynthesis.cancel=()=>{};
 const interval=window.setInterval;window.setInterval=(fn,ms,...args)=>interval(fn,ms===1000?30:ms,...args);
 const timeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timeout(fn,ms===1000?50:ms,...args);
});
await context.route('**/api/students/profile',r=>r.fulfill({json:{_id:'ui-regression',grade:'3'}}));
await context.route('**/api/working-memory/improvement/progress/**',r=>r.fulfill({json:{success:true,data:progress}}));
const submissions=[];
await context.route('**/api/working-memory/improvement/submit-attempt',r=>{const body=r.request().postDataJSON();submissions.push(body);return r.fulfill({status:201,json:{success:true,data:{isPassed:body.score>=3,progress,totalStars:35+body.score*5}}})});
await context.route('**/*youtube*',r=>r.fulfill({body:'',contentType:'text/html'}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function question(level,game){const id=await page.locator('.lx-board').getAttribute('data-question-id');return page.evaluate(async({level,game,id})=>{const {getSubCategoryData}=await import('/src/features/workingMemory/improvement/data/index.js');return getSubCategoryData('3',level,game,'en').questions.find(q=>q.id===id)},{level,game,id})}
async function answer(level,game,correct=true,extra=false){
 const q=await question(level,game);assert(q,'real question must exist');
 if(game==='pattern'){
  const value=correct?q.missingAnswer:q.dragPool?.find(v=>v!==q.missingAnswer);
  const buttons=page.locator('.lx-pattern-option');
  const labels=await buttons.evaluateAll(bs=>bs.map(b=>b.getAttribute('aria-label')));
  const index=correct?labels.indexOf(`Answer: ${value}`):labels.findIndex(v=>v!==`Answer: ${q.missingAnswer}`);
  await buttons.nth(index).evaluate(b=>{b.click();b.click()});
  await page.locator('.lx-pattern-check').evaluate(b=>{b.click();b.click()});
 } else if(game==='words'){
  assert.equal(await page.locator('.lx-picture-sequence [data-item-id]').count(),0);
  await page.getByRole('button',{name:'Ready',exact:true}).click();
  await page.locator('.lx-picture-pool').waitFor();
  if(extra){await page.locator('.lx-picture-pool [data-item-id]').first().dragTo(page.locator('.lx-picture-slot').first());assert.equal(await page.locator('.lx-picture-slots [data-item-id]').count(),1);await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await page.locator('.lx-picture-slots [data-item-id]').count(),0);await page.locator('.lx-picture-pool [data-item-id]').first().click();await page.getByRole('button',{name:'Start over',exact:true}).click();}
  const items=correct?q.correct:[...q.correct.slice(1),q.correct[0]];
  for(const item of items)await page.locator('.lx-picture-pool').locator(`[data-item-id="${item.id}"]`).click();
  await page.getByRole('button',{name:'Submit',exact:true}).click();
 } else if(game==='numbers'){
  await page.locator('.lx-keypad').waitFor();assert.equal(await page.locator('.lx-keypad button').count(),10);
  if(extra){await page.getByRole('button',{name:'Digit 2',exact:true}).click();await page.getByRole('button',{name:'Digit 2',exact:true}).click();await page.getByRole('button',{name:'Undo',exact:true}).click();assert.deepEqual(await page.locator('.lx-number-slot').allTextContents(),['2',...q.correct.slice(1).map(()=> '')]);await page.getByRole('button',{name:'Undo',exact:true}).click();}
  const digits=correct?q.correct:q.correct.map(n=>String((Number(n)+1)%10));
  for(const digit of digits)await page.getByRole('button',{name:`Digit ${digit}`,exact:true}).click();
  await page.getByRole('button',{name:'Submit',exact:true}).click();
 } else {
  assert.equal(await page.getByRole('button',{name:'Show the Question',exact:true}).count(),0);
  await page.getByRole('button',{name:'Listen',exact:true}).click();
  await page.getByRole('button',{name:'Show the Question',exact:true}).click();
  const option=correct?q.correct:q.options.find(v=>v!==q.correct);
  const index=await page.locator('.lx-instruction-option').evaluateAll((buttons,value)=>buttons.findIndex(b=>b.lastElementChild.textContent===value),option);
  assert(index>=0);await page.locator('.lx-instruction-option').nth(index).click();
 }
 await page.locator(game==='pattern'?'.lx-pattern-toast':'.lx-feedback').waitFor();
 assert.equal(await page.locator(game==='pattern'?'.lx-pattern-toast.is-incorrect':'.lx-feedback.is-incorrect').count(),correct?0:1);
 return q.id;
}
for(const level of [1,2,3,4])for(const game of ['pattern','words','instructions','numbers']){
 await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/3/${level}/${game}`);
 await page.getByRole('button',{name:"Skip & Play",exact:true}).click();
 const ids=[];
 for(let i=0;i<5;i++){
  ids.push(await answer(level,game,i<3,i===0));
  if(i===0)await page.screenshot({path:`${out}/feedback-${level}-${game}.png`});
  const next=page.getByRole('button',{name:i===4?'See results':'Next',exact:true});
  await next.evaluate(b=>{b.click();b.click()});
 }
 await page.locator(game==='pattern'?'[data-testid=pattern-results]':'.lx-results').waitFor();await page.getByRole('button',{name:'Next game',exact:true}).waitFor();
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Next game')?.disabled);
 assert.equal(submissions.at(-1).score,3);assert.equal(submissions.at(-1).questionResults.length,5);assert.equal(new Set(submissions.at(-1).questionResults.map(q=>q.questionId)).size,5);
 await page.screenshot({path:`${out}/results-${level}-${game}.png`});
 await page.getByRole('button',{name:'Play again',exact:true}).click();
 const retry=await question(level,game);assert(retry);assert(!await page.locator('.lx-results').count());
 console.log(`PASS level ${level} ${game}: five real questions, 3 correct / 2 incorrect, one submission, retry reset`);
}
assert.equal(submissions.length,16);assert.deepEqual(errors,[]);
await page.goto('http://127.0.0.1:5173/improvement-wm/3');
await page.getByRole('button',{name:'Mute music',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('lexiland-wm-muted')),'true');
await page.locator('.lx-level-card').first().click();await page.locator('.lx-menu-board').waitFor();assert.equal(await page.locator('.lx-nav-language').count(),1);await page.reload();await page.getByRole('button',{name:'Unmute music',exact:true}).waitFor();
await page.setViewportSize({width:1366,height:768});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
console.log('PASS music mute persists across navigation/reload; language restricted to map; laptop scaling has no horizontal overflow');
await browser.close();
