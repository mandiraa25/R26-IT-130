// Web delivery exports only; the supplied PNG originals remain untouched.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch();const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
const folders={forest:'shared/backgrounds/screening',bunny:'shared/bunny/screening'};
for(const name of ['forest','bunny']){
 const result=await page.evaluate(async ([name,folder])=>{
  const img=new Image();img.src=`/images/workingMemory/${folder}/${name}.png`;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=name==='forest'?1600:img.naturalWidth;canvas.height=name==='forest'?900:img.naturalHeight;
  const scale=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight),width=img.naturalWidth*scale,height=img.naturalHeight*scale;
  const ctx=canvas.getContext('2d');ctx.drawImage(img,(canvas.width-width)/2,(canvas.height-height)/2,width,height);
  return {data:canvas.toDataURL('image/webp',.94).split(',')[1],width:canvas.width,height:canvas.height,cornerAlpha:ctx.getImageData(0,0,1,1).data[3]};
 },[name,folders[name]]);
 fs.writeFileSync(`public/images/workingMemory/${folders[name]}/${name}.webp`,Buffer.from(result.data,'base64'));
 console.log(name,{width:result.width,height:result.height,cornerAlpha:result.cornerAlpha});
}
await browser.close();
