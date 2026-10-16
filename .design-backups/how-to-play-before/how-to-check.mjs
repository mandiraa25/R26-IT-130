import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.route('**/*youtube*',r=>r.fulfill({body:'<html>Video preview</html>',contentType:'text/html'}));
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let count=0;
for(const viewport of [{width:1366,height:768},{width:1280,height:720}]){
 await page.setViewportSize(viewport);
 for(const game of ['pattern','numbers','words','instructions']) for(const level of [1,2,3,4]){
  await page.goto(`http://127.0.0.1:5173/how-to-preview.html?game=${game}&level=${level}`);
  await page.locator('.how-video-board').waitFor();
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  const state=await page.evaluate(()=>{const board=document.querySelector('.how-video-board');const b=board.getBoundingClientRect();const controls=[...document.querySelectorAll('.how-video-actions button')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}});return {board:getComputedStyle(board).backgroundImage,background:document.querySelector('img[src*="how-to-backgrounds"]')?.getAttribute('src'),b:{x:b.x,y:b.y,right:b.right,bottom:b.bottom},controls,overflow:document.documentElement.scrollWidth>innerWidth,missing:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}});
  assert(state.board.endsWith('/how-to-boards/L1.png")'));assert.equal(state.background,`/images/workingMemory/improve/themes/how-to-backgrounds/L${level}.png`);assert(!state.overflow);assert.deepEqual(state.missing,[]);
  for(const c of state.controls){assert(c.x>=state.b.x&&c.right<=state.b.right);assert(c.y>=state.b.y&&c.bottom<=state.b.bottom);}
  await page.getByRole('button',{name:'Watch tutorial video'}).click();await page.getByRole('button',{name:'Skip video and play'}).click();assert.deepEqual(await page.evaluate(()=>window.calls),{watch:1,skip:1});
  if(viewport.width===1366&&game==='numbers') await page.screenshot({path:`.design-backups/how-to-play-before/after-level-${level}.png`});count++;
 }
}
await page.goto('http://127.0.0.1:5173/how-to-preview.html?game=words&level=4&lang=si');await page.locator('.how-video-board').waitFor();assert.equal(await page.locator('.how-video-actions button').count(),2);
assert.deepEqual(errors,[]);console.log(`PASS: ${count} game/level/laptop combinations; shared board, supplied backgrounds, assets, button bounds, callbacks; Sinhala render; no browser errors.`);await browser.close();
