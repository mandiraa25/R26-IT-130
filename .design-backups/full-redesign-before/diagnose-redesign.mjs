import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out='../.design-backups/full-redesign-before/qa'; fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
const progress={isIdentificationCompleted:true,maxUnlockedLevel:4,totalStars:100,levelsProgress:[1,2,3,4].map(levelNumber=>({levelNumber,subCategories:['pattern','words','instructions','numbers'].map(subCategoryKey=>({subCategoryKey,isUnlocked:true,isCompleted:false}))}))};
await context.addInitScript(()=>{localStorage.setItem('token','ui-test');localStorage.setItem('studentId','ui-test');localStorage.setItem('i18nextLng','en');window.speechSynthesis.speak=u=>{u.onstart?.();setTimeout(()=>u.onend?.(),1)};window.speechSynthesis.cancel=()=>{};const interval=window.setInterval;window.setInterval=(fn,ms,...a)=>interval(fn,ms===1000?100:ms,...a);});
const submissions=[];
await context.route('**/api/**',async r=>{if(r.request().url().includes('submit-attempt')){submissions.push(r.request().postDataJSON());return r.fulfill({json:{success:true,data:{isPassed:true,totalStars:120}}});}if(r.request().url().includes('/progress/'))return r.fulfill({json:{success:true,data:progress}});return r.fulfill({json:{_id:'ui-test',grade:'3',fullName:'UI Review',totalStars:100}});});
await context.route('**/*youtube*',r=>r.fulfill({body:'',contentType:'text/html'}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const shot=name=>page.screenshot({path:`${out}/${name}.png`});
async function bounds(name){const bad=await page.evaluate(()=>{const board=document.querySelector('.adaptive-vine-board,.result-vine-board');if(!board)return [];const b=board.getBoundingClientRect();return [...board.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.x<b.x-2||r.right>b.right+2||r.y<b.y-2||r.bottom>b.bottom+2)}).map(e=>e.textContent.trim())});if(bad.length)console.log('BOUNDS',name,JSON.stringify(bad));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow');}
await page.goto('http://127.0.0.1:5173/improvement-activity-wm/3/1/instructions');await page.getByRole('button',{name:'Skip video and play',exact:true}).click();await page.getByRole('button',{name:'Start the game',exact:true}).click();
console.log(JSON.stringify(await page.locator('.instructions-vine-board').evaluate(e=>[...e.children].map(c=>({tag:c.tagName,cls:c.className,rect:c.getBoundingClientRect().toJSON(),css:{position:getComputedStyle(c).position,display:getComputedStyle(c).display,flex:getComputedStyle(c).flex,padding:getComputedStyle(c).padding}}))),null,2));await shot('diagnostic-listen');await browser.close();