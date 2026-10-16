import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import fs from 'node:fs';
const out='../.design-backups/pattern-reference-before/qa-final';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
await context.addInitScript(()=>{if(location.origin!=='http://127.0.0.1:5173')return;localStorage.setItem('token','pattern-review');if(!localStorage.getItem('i18nextLng'))localStorage.setItem('i18nextLng','en');window.speechSynthesis.speak=u=>u.onend?.();window.speechSynthesis.cancel=()=>{}});
const progress={studentId:'review',isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:350,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:false}))}))};
await context.route('**/api/students/profile',r=>r.fulfill({json:{_id:'review',grade:'3'}}));await context.route('**/api/working-memory/improvement/progress/**',r=>r.fulfill({json:{success:true,data:progress}}));await context.route('**/*youtube*',r=>r.fulfill({body:''}));
const submissions=[];await context.route('**/api/working-memory/improvement/submit-attempt',r=>{const body=r.request().postDataJSON();submissions.push(body);if(submissions.length===1)return r.fulfill({status:500,json:{message:'Test save failure'}});return r.fulfill({status:201,json:{success:true,data:{isPassed:body.score>=3,totalStars:350+body.score*5,progress}}})});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function shot(name){await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${out}/${name}.png`})}
const boards=[];
for(const level of [1,2,3,4])for(const correctCount of [1,3,4]){
 await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/3/${level}/pattern`);await page.getByRole('button',{name:'Skip & Play',exact:true}).click();await page.locator('.lx-pattern-question').waitFor();const ids=[];
 boards.push(await page.locator('.lx-pattern-question').evaluate(e=>getComputedStyle(e).backgroundImage));
 assert(boards.at(-1).includes('/ui/vine-board.webp'));
 assert.deepEqual(await page.locator('.lx-pattern-question').evaluate(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}),[300,175,1000,580]);
 for(let i=0;i<5;i++){
  const id=await page.locator('.lx-pattern-question').getAttribute('data-question-id');ids.push(id);
  const q=await page.evaluate(async({level,id})=>(await import('/src/pages/workingMemory/data/improvement/index.js')).getSubCategoryData('3',level,'pattern','en').questions.find(q=>q.id===id),{level,id});
  const labels=await page.locator('.lx-pattern-option').evaluateAll(bs=>bs.map(b=>b.getAttribute('aria-label')));const index=labels.findIndex(label=>i<correctCount?label===`Answer: ${q.missingAnswer}`:label!==`Answer: ${q.missingAnswer}`);
  await page.locator('.lx-pattern-question').evaluate(e=>e.dataset.qaIdentity='same-board');if(i===0)await shot(`level-${level}-question`);
  await page.locator('.lx-pattern-option').nth(index).evaluate(b=>{b.click();b.click()});await page.locator('.lx-pattern-toast').waitFor();
  assert.equal(await page.locator('.lx-pattern-question').getAttribute('data-qa-identity'),'same-board');assert.equal(await page.locator('.lx-pattern-question').getAttribute('data-question-id'),id);
  assert.equal(await page.locator('.lx-pattern-option[aria-pressed=true]').count(),1);assert.equal(await page.locator('.lx-pattern-option:enabled').count(),0);assert.equal(await page.locator('.lx-feedback-summary').count(),0);assert(!(await page.locator('.lx-pattern-toast').textContent()).includes('Correct answer'));
  assert.equal(await page.locator('.lx-pattern-toast.is-incorrect').count(),i<correctCount?0:1);
  if(i===0)await shot(`level-${level}-feedback-correct`);
  if(i===correctCount)await shot(`level-${level}-feedback-wrong`);
  await page.getByRole('button',{name:i===4?'See results':'Next',exact:true}).evaluate(b=>{b.click();b.click()});
 }
 await page.getByTestId('pattern-results').waitFor();await page.waitForFunction(()=>!document.querySelector('.lx-pattern-save-status').textContent.includes('Saving'));
 assert((await page.getByTestId('pattern-results').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('/pattern/vine-board.webp'));
 if(level===1&&correctCount===1){await page.getByRole('button',{name:'Retry saving',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.lx-pattern-save-status')?.textContent.includes('3 out of 5'));}
 assert.equal(await page.getByTestId('pattern-score').textContent(),`${correctCount} / 5`);assert.equal(submissions.at(-1).score,correctCount);assert.equal(submissions.at(-1).questionResults.length,5);assert.equal(new Set(ids).size,5);
 assert.equal(await page.getByRole('button',{name:'Next game',exact:true}).isDisabled(),correctCount<3);assert.equal(await page.locator('.lx-pattern-stars .is-earned').count(),correctCount);assert.equal(await page.locator('.lx-pattern-statistics .is-stars strong').textContent(),String(correctCount*5));
 await shot(`level-${level}-${correctCount===4?'passed':'retry'}`);
 if(correctCount<3)assert((await page.locator('.lx-pattern-save-status').textContent()).includes('3 out of 5'));
 if(correctCount>=3&&level>1){await page.getByRole('button',{name:'Next game',exact:true}).click();await page.locator('.lx-howto-board').waitFor();assert(page.url().endsWith(`/improvement-activity-wm/3/${level}/words`));}
 else {await page.getByRole('button',{name:correctCount<3?'Try again':'Play again',exact:true}).click();await page.locator('.lx-pattern-question').waitFor();assert.equal(await page.locator('.lx-pattern-toast').count(),0);assert.equal(await page.locator('.lx-pattern-option[aria-pressed=true]').count(),0);}
 console.log(`PASS level ${level} ${correctCount}/5: real questions, same-board feedback, one score per answer, results/stars, pass gate and fresh retry`);
}
assert.equal(new Set(boards).size,1);assert.equal(submissions.length,13);
await page.goto('http://127.0.0.1:5173/improvement-activity-wm/3/4/pattern');await page.locator('.lx-howto-skip').click();await page.locator('.lx-pattern-question').waitFor();
await page.setViewportSize({width:1366,height:768});await shot('laptop-question');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.evaluate(()=>localStorage.setItem('i18nextLng','si'));await page.reload();await page.locator('.lx-howto-skip').click();await page.locator('.lx-pattern-question').waitFor();await shot('sinhala-question');assert.equal(await page.locator('.lx-viewport').getAttribute('lang'),'si');
for(let i=0;i<5;i++){
 const id=await page.locator('.lx-pattern-question').getAttribute('data-question-id');const q=await page.evaluate(async id=>(await import('/src/pages/workingMemory/data/improvement/index.js')).getSubCategoryData('3',4,'pattern','si').questions.find(q=>q.id===id),id);
 const labels=await page.locator('.lx-pattern-option').evaluateAll(bs=>bs.map(b=>b.getAttribute('aria-label')));const index=labels.findIndex(label=>i===0?label===`Answer: ${q.missingAnswer}`:label!==`Answer: ${q.missingAnswer}`);await page.locator('.lx-pattern-option').nth(index).click();await page.locator('.lx-pattern-next').click();
}
await page.getByTestId('pattern-results').waitFor();await shot('sinhala-retry');assert.equal(await page.getByTestId('pattern-score').textContent(),'1 / 5');
const alpha=await page.evaluate(async()=>{const img=new Image();img.src='/images/workingMemory/pattern/vine-board.webp';await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);return x.getImageData(0,0,1,1).data[3]});assert.equal(alpha,0);assert.deepEqual(errors,[]);
console.log('PASS all four themes, one identical board, laptop/Sinhala, transparent assets. Artifacts:',out);await browser.close();
