// Preserve source PNGs and alpha; export the full-screen background at 16:9.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const directory='public/images/workingMemory/map-menu';
const browser=await chromium.launch();const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
let before=0,after=0;
for(const file of fs.readdirSync(directory).filter(name=>name.endsWith('.png'))){
 const encoded=await page.evaluate(async name=>{const image=new Image();image.src=`/images/workingMemory/map-menu/${name}`;await image.decode();const canvas=document.createElement('canvas');canvas.width=name==='map-background.png'?1600:image.naturalWidth;canvas.height=name==='map-background.png'?900:image.naturalHeight;const scale=Math.max(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);const width=image.naturalWidth*scale,height=image.naturalHeight*scale;canvas.getContext('2d').drawImage(image,(canvas.width-width)/2,(canvas.height-height)/2,width,height);return canvas.toDataURL('image/webp',.94).split(',')[1]},file);
 const target=`${directory}/${file.replace('.png','.webp')}`;fs.writeFileSync(target,Buffer.from(encoded,'base64'));before+=fs.statSync(`${directory}/${file}`).size;after+=fs.statSync(target).size;
}
console.log(`Web delivery: ${before} → ${after} bytes (${Math.round((1-after/before)*100)}% smaller). Original PNG assets retained.`);await browser.close();
