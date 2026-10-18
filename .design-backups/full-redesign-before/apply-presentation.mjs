import fs from 'node:fs';
const root='frontend/src/pages/workingMemory/';
for(const file of ['games/Patterngame.jsx','games/Numbersgame.jsx','games/WordsGame.jsx','games/Instructionsgame.jsx']){
 let s=fs.readFileSync(root+file,'utf8');
 s='import ActionButton from "../components/ActionButton";\n'+s;
 const at=s.indexOf('  return (');const cls=s.indexOf('className={',at);
 // Each game root has the existing level class. Scope all new styles to this root.
 const part=s.slice(cls);s=s.slice(0,cls)+part.replace('className={`','data-level={levelNumber} lang={i18n.language} className={`wm-game-root ');
 s=s.replace(/<button\b[\s\S]*?<\/button>/g, block=>{
 let action;
 if(/onClick=\{handlePatternConfirm\}|onClick=\{handleDragSubmit\}/.test(block))action='"check"';
 else if(/onClick=\{handleNextQuestion\}/.test(block))action='{currentIdx < questions.length - 1 ? "next" : "finish"}';
 else if(/onClick=\{startWordsMemory\}/.test(block))action='"play"';
 else if(/onClick=\{handleShowQuestion\}/.test(block))action='"show-question"';
 else if(block.includes('playInstructionSequence(currentQuestion.instruction)'))action='"listen-again"';
 if(!action)return block;
 return block.replace('<button',`<ActionButton action=${action}`).replace('</button>','</ActionButton>');
 });
 fs.writeFileSync(root+file,s);
}
let s=fs.readFileSync(root+'components/SharedScreens.jsx','utf8');
s='import ActionButton from "./ActionButton";\n'+s;
s=s.replace(/<button\b[\s\S]*?<\/button>/g,b=>{
 let a;if(b.includes('onClick={onReady}'))a='play';else if(b.includes('onClick={startQuiz}'))a='try-again';else if(b.includes('onClick={handleNextSubCategory}'))a='continue';else if(b.includes('onClick={handleBackToLevels}')&&b.includes('Games Dashboard'))a='back';
 return a?b.replace('<button',`<ActionButton action="${a}"`).replace('</button>','</ActionButton>'):b;
});
// Replace only IntroScreen's empty presentation container. Keep its existing label and handler.
const start=s.indexOf('export const IntroScreen =');const end=s.indexOf('export const BunnyMascot',start);
let intro=s.slice(start,end);
intro=intro.replace('<div className="flex items-center justify-center">','<section className="wm-ready-board" style={{ backgroundImage: `url(\'${getWorkingMemoryThemeAssets(levelNumber).questionBoard}\')` }}>\n        <img className="wm-ready-bunny" src="/images/workingMemory/improve/reference-art/bunny.png" alt="" />');
intro=intro.replace('      </div>\n    </main>','      </section>\n    </main>');
s=s.slice(0,start)+intro+s.slice(end);
s=s.replace('title="Go Back"','title="Go Back" aria-label="Go back to levels"');
s=s.replace('onClick={() => setSoundEnabled(!soundEnabled)}','aria-label={soundEnabled ? "Mute sound" : "Enable sound"} aria-pressed={soundEnabled}\n          onClick={() => setSoundEnabled(!soundEnabled)}');
fs.writeFileSync(root+'components/SharedScreens.jsx',s);
