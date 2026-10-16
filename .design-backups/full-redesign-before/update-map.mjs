import fs from 'node:fs';
const root='frontend/src/pages/workingMemory/';
let s=fs.readFileSync(root+'ImprovementLevelsWM.jsx','utf8');s='import ActionButton from "./components/ActionButton";\nimport { getWorkingMemoryThemeAssets } from "./utils/themeAssets";\nimport "./styles/redesign.css";\n'+s;
s=s.replace('className="relative w-full min-h-screen','className="wm-level-map relative w-full min-h-screen');
s=s.replace('key={lvl.num}\n','key={lvl.num}\n');
s=s.replace(/key=\{lvl.num\}/,'key={lvl.num}\n                data-level={lvl.num}\n                className_PLACEHOLDER');s=s.replace('                className_PLACEHOLDER','');
s=s.replace(/className=\{`group relative bg-white\/95/, 'className={`wm-level-card group relative bg-white/95');
const start=s.indexOf('                {/* Level Graphic (Emoji) */}'),end=s.indexOf('                {/* Level Description */}',start);
s=s.slice(0,start)+`                <div className="wm-level-scene" aria-hidden="true">
                  <img src={getWorkingMemoryThemeAssets(lvl.num).background} alt="" />
                  <img className="wm-level-scene__bunny" src="/images/workingMemory/improve/reference-art/standing-bunny.png" alt="" />
                  {isLocked && <span className="wm-level-lock">🔒</span>}
                </div>

`+s.slice(end);
s=s.replace(/<button\b[\s\S]*?<\/button>/g,b=>b.includes('{t("level_play")}')?b.replace('<button','<ActionButton action="play"').replace('</button>','</ActionButton>'):b);
fs.writeFileSync(root+'ImprovementLevelsWM.jsx',s);
for(const file of ['identify/ScreeningUI.jsx','identify/IdentifyIntroScreens.jsx']){
 let s=fs.readFileSync(root+file,'utf8');
 if(file.endsWith('ScreeningUI.jsx'))s=s.replace('`url(\'${ART}forest.png\')`','"url(\'/images/workingMemory/improve/reference-art/screening-background.png\')"');
 else s=s.replace('const IDENTIFY_BG = "/images/workingMemory/identify/working-memory-identify-quiz-bg.jpeg";','const IDENTIFY_BG = "/images/workingMemory/improve/reference-art/screening-background.png";');
 fs.writeFileSync(root+file,s);
}
