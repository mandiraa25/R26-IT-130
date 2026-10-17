import ActivityResults, { LegacyActivityResults } from "./ActivityResults";
import LevelCompletion from "./LevelCompletion";
import Feedback, { InlineFeedback } from "./Feedback";
import PatternGame from "../improvement/games/PatternGame";
import PictureMemoryGame from "../improvement/games/PictureMemoryGame";
import InstructionsGame from "../improvement/games/InstructionsGame";
import NumberMemoryGame from "../improvement/games/NumberMemoryGame";
import { UI } from "../config/levelThemes";

import { MemoryStage, MemoryNav, MemoryTracker, MemoryBunny, MemoryBoard, MemoryButton } from "./GameLayout";
import HowToPlay from "./HowToPlay";

import "../styles/contentRefinement.css";

import "../styles/levelOne.css";
import "../styles/levelTwo.css";
import "../styles/levelThree.css";
import "../styles/levelFour.css";

import { numberStageInstruction } from "../config/gameConfig";

export default function ActivityScreen(p) {
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const { phase, subCategoryKey: game, currentQuestion: q, levelNumber, slots = [] } = p;
  const Game = { pattern: PatternGame, words: PictureMemoryGame, instructions: InstructionsGame, numbers: NumberMemoryGame }[game] || InstructionsGame;
  const answered = phase === "feedback";
  const activityPhase = answered ? "answer" : phase;
  const levelFour = Number(levelNumber) === 4;
  const levelThree = Number(levelNumber) === 3;
  const levelTwo = Number(levelNumber) === 2;
  const levelOne = Number(levelNumber) === 1 || levelTwo || levelThree || levelFour;
  const numberInstruction = levelThree || levelFour ? numberStageInstruction({ recall: activityPhase === "answer", awaiting: p.numbersAwaitingPlay, backward: q?.isBackward, si }) : null;
  const title = text({ pattern: "Pattern Recognition", words: "Picture Memory", instructions: "Following Instructions", numbers: levelTwo || levelThree ? "Number Memory" : "Number Recall" }[game], { pattern: "රටා මතකය", words: "පින්තූර මතකය", instructions: "උපදෙස් අනුගමනය", numbers: "අංක මතකය" }[game]);
  const bubble = phase === "feedback" ? text(p.isCurrentCorrect ? "Well done! Keep going!" : "Good try! Let's keep learning!", p.isCurrentCorrect ? "හොඳයි! ඉදිරියට යමු!" : "හොඳ උත්සාහයක්! ඉගෙන ගනිමු!") : phase === "result" ? text("You worked hard! Well done!", "ඔබ හොඳින් උත්සාහ කළා!") : game === "pattern" ? text("Look at the pattern carefully and guess it!", "රටාව හොඳින් බලා පිළිතුර තෝරන්න!") : game === "words" ? text(activityPhase === "answer" ? "Drag and drop the pictures in the correct order!" : p.wordsAwaitingPlay ? "Tap the Ready button when you are ready!" : "Remember the picture order carefully!", activityPhase === "answer" ? "පින්තූර නිවැරදි අනුපිළිවෙලට තබන්න!" : p.wordsAwaitingPlay ? "සූදානම් වූ විට බොත්තම ඔබන්න!" : "පින්තූර අනුපිළිවෙල මතක තබා ගන්න!") : game === "numbers" ? text(phase === "answer" ? "Tap the numbers in the correct order!" : "Remember the number order carefully!", phase === "answer" ? "අංක නිවැරදි අනුපිළිවෙලට ඔබන්න!" : "අංක අනුපිළිවෙල මතක තබා ගන්න!") : text("Choose the correct instruction!", "නිවැරදි උපදෙස තෝරන්න!");
  return <MemoryStage level={levelNumber} className={`lx-game${levelFour ? " lx-level-four" : levelThree ? " lx-level-three" : levelTwo ? " lx-level-two" : levelOne ? " lx-level-one" : ""} lx-game--${game} lx-phase--${phase}`}>
    <MemoryNav title={levelFour && phase === "levelComplete" ? text("Level 4 Results", "\u0db8\u0da7\u0dca\u0da7\u0db8 4") : levelThree && phase === "levelComplete" ? text("Level 3 Results", "\u0db8\u0da7\u0dca\u0da7\u0db8 3") : levelTwo && phase === "levelComplete" ? text("Level 2 Results", "????? 2 ????????") : `${text("Level", "මට්ටම")} ${levelNumber} • ${title}`} onBack={p.handleBackToLevels} stars={p.totalStars} />
    {phase === "video" ? <HowToPlay key={`${game}-${levelNumber}-${p.i18n.language}`} levelNumber={levelNumber} gameType={game} videoUrl={p.subCatData?.videoUrl || p.subCatData?.youtubeVideoUrl} onSkipAndPlay={p.handleSkipAndPlay} language={p.i18n.language} /> : levelOne && phase === "levelComplete" ? <LevelCompletion p={p} si={si} /> : levelOne && phase === "result" ? <ActivityResults p={p} title={title} si={si} /> : game === "pattern" && phase !== "levelComplete" ? <Game {...p} /> : <>
      {!["result", "levelComplete"].includes(phase) && <MemoryTracker correctOnly={levelFour} current={p.currentIdx + 1} total={p.questions.length} responses={p.results} />}
      {!(game === "instructions" && phase === "show") && <MemoryBunny message={(levelThree || levelFour) && game === "numbers" ? numberInstruction : bubble} />}
      <MemoryBoard className={phase === "result" ? "lx-results" : ""} data-question-id={q?.id}>
        {phase === "result" ? <LegacyActivityResults p={p} title={title} si={si} /> : phase === "levelComplete" ? <>
          <img src={`${UI}/icons/star.svg`} alt="" width="95" height="95" /><h1 className="lx-result-title">{text("Level complete!", "මට්ටම සම්පූර්ණයි!")}</h1><p>{text("You finished all four games. Well done!", "ඔබ ක්‍රීඩා හතරම සම්පූර්ණ කළා. හොඳයි!")}</p><MemoryButton onClick={p.handleContinueLevel}>{text(Number(levelNumber) < 4 ? "Next level" : "Back to levels", Number(levelNumber) < 4 ? "ඊළඟ මට්ටම" : "මට්ටම් වෙත")}</MemoryButton>
        </> : <><div className="lx-game-activity" inert={answered ? true : undefined} style={{ "--item-count": Math.max(q?.showItems?.length || 0, slots.length, 1) }}>{<Game {...p} />}</div>{answered && (levelOne ? <div className="lx-level-one-actions"><MemoryButton onClick={p.handleNextQuestion}>{text(p.currentIdx === p.questions.length - 1 ? "See results" : "Next", p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ")}</MemoryButton></div> : <InlineFeedback p={p} si={si} />)}</>}
      </MemoryBoard>
    </>}
    {levelOne && answered && <Feedback p={p} si={si} />}
  </MemoryStage>;
}

