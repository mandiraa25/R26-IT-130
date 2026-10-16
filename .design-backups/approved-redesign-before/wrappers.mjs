import fs from 'node:fs';
const root='frontend/src/pages/workingMemory/';
for(const [file,name] of [['Patterngame.jsx','PatternGame'],['WordsGame.jsx','WordsGame'],['Numbersgame.jsx','NumbersGame'],['Instructionsgame.jsx','InstructionsGame']])fs.writeFileSync(root+'games/'+file,`import GamePresentation from "../components/GamePresentation";\n\nexport default function ${name}(props) { return <GamePresentation {...props} />; }\n`);
