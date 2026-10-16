// Execute the real controller with in-memory model doubles. Never connects to MongoDB.
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(path.resolve('../backend/src/modules/workingMemory/controllers/workingMemoryImprove.controller.js'),'utf8');
async function run(score,{completed=false,last=false,screeningGrades=['3']}={}){
 const categories=['pattern','words','instructions','numbers'];
 const progress={maxUnlockedLevel:1,totalStars:20,levelsProgress:[1,2].map(levelNumber=>({levelNumber,isCompleted:false,subCategories:categories.map((subCategoryKey,i)=>({subCategoryKey,isUnlocked:levelNumber===1&&(last||i===0),isCompleted:levelNumber===1&&(completed||(last&&i<3))}))})),save:async()=>{}};
 const exports={};let starUpdate;
 const models={WorkingMemoryImproveProgress:{findOne:async()=>progress},WorkingMemoryImproveAttempt:class{constructor(data){Object.assign(this,data)}async save(){}}};
 const requireMock=name=>name.includes('workingMemoryImprove.model')?models:name.includes('workingMemoryIdentify.model')?{findOne:async filter=>screeningGrades.map(grade=>({grade})).find(record=>!filter.grade||record.grade===filter.grade)}:{findByIdAndUpdate:async(id,update)=>{starUpdate=update}};
 vm.runInNewContext(source,{require:requireMock,exports,console,Date,Number,Math});
 let status,result;
 const response={status(n){status=n;return this},json(data){result=data;return this}};
 await exports.submitSubCategoryAttempt({body:{studentId:'memory-only',grade:'3',language:'en',levelNumber:1,subCategoryKey:last?'numbers':'pattern',score,totalQuestions:5,questionResults:Array.from({length:5},(_,i)=>({questionId:`q${i}`,isCorrect:i<score})),totalTimeTaken:50}},response);
 if(!screeningGrades.includes('3')){assert.equal(status,403);assert.equal(starUpdate,undefined);return;}
 assert.equal(status,201);assert.equal(result.data.isPassed,score>=3);assert.equal(result.data.starsEarned,score*5);assert.equal(starUpdate.$inc.totalStars,score*5);
 assert.equal(progress.levelsProgress[0].subCategories[last?3:0].isCompleted,completed||score>=3);
 if(!last)assert.equal(progress.levelsProgress[0].subCategories[1].isUnlocked,score>=3);
 if(last)assert.equal(progress.maxUnlockedLevel,score>=3?2:1);
}
(async()=>{for(let n=0;n<=5;n++)await run(n);await run(1,{completed:true});await run(2,{last:true});await run(3,{last:true});await run(1,{screeningGrades:['4','3']});await run(3,{screeningGrades:['4','3']});await run(3,{screeningGrades:['4']});console.log('PASS real backend controller: scores 0–5; 3/5 threshold; stars; historical completion retained; next activity and level unlocks; current-grade screening found after older different-grade record; missing current-grade screening still rejected. No database writes.');})().catch(e=>{console.error(e);process.exitCode=1});
