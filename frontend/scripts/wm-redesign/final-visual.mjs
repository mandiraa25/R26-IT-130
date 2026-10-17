import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=`../.design-backups/approved-redesign-before/qa/final-${Date.now()}`;fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
await context.addInitScript(()=>{localStorage.setItem('token','visual-review');localStorage.setItem('studentId','visual-review');localStorage.setItem('i18nextLng','si');window.speechSynthesis.speak=u=>{u.onstart?.();setTimeout(()=>u.onend?.(),20)};window.speechSynthesis.cancel=()=>{};});
const progress={isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:40,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:true}))}))};
await context.route('**/api/students/profile',r=>r.fulfill({json:{_id:'visual-review',grade:'3'}}));await context.route('**/api/working-memory/improvement/progress/**',r=>r.fulfill({json:{success:true,data:progress}}));await context.route('**/*youtube*',r=>r.fulfill({body:''}));
const page=await context.newPage();let missing=[];page.on('response',r=>{if(r.status()>=400&&/\.(png|webp|svg|ttf|mp3)/.test(r.url()))missing.push(r.url())});
async function shot(name){await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${out}/${name}.png`});console.log(name)}
await page.goto('http://127.0.0.1:5173/improvement-wm/3');await page.locator('.lx-level-card:not(:disabled)').first().waitFor();await shot('map-si');
console.log('Font check',await page.evaluate(()=>({lexend:document.fonts.check('600 22px Lexend'),fredoka:document.fonts.check('700 38px Fredoka'),sinhala:document.fonts.check('600 22px "Noto Sans Sinhala"')})));
const boards=[];
for(const level of [1,2,3,4]){
 await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/3/${level}/pattern`);await page.locator('.lx-howto-board').waitFor();boards.push(await page.locator('.lx-howto-board').evaluate(e=>getComputedStyle(e).backgroundImage));await shot(`how-to-${level}-si`);
 await page.locator('.lx-howto-skip').click();await page.locator('.lx-pattern-options').waitFor();await shot(`pattern-${level}-si`);
 assert.equal(await page.locator('.lx-nav-language').count(),0);
}
assert.equal(new Set(boards).size,1);assert(boards[0].includes('how-to-boards/L1.png'));
await page.setViewportSize({width:1366,height:768});await shot('laptop-pattern-4-si');
const screeningId=await page.evaluate(async()=>{const {QUIZ_DATA}=await import('/src/features/workingMemory/identification/data/index.js');return QUIZ_DATA['3'].si[0].id});
await page.goto(`http://127.0.0.1:5173/working-memory/3?ids=${screeningId}`);await page.locator('.wm-screen__category').waitFor();await shot('screening-si');assert.equal(await page.locator('.lx-tracker li').count(),15);assert.equal(await page.locator('.wm-screen__stars li').count(),15);
await page.goto('http://127.0.0.1:5173/working-memory/3');await page.locator('.wm-intro-panel').waitFor();await shot('screening-intro-si');
assert.deepEqual(missing,[]);console.log('PASS shared Level 01 tutorial board, all four backgrounds, 15-step screening tracker, no missing image/font/audio requests. Artifacts:',out);await browser.close();
