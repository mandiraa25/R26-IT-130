import ActivityResults, { LegacyActivityResults } from "../shared/ActivityResults";
import LevelCompletion from "../shared/LevelCompletion";
import Feedback, { InlineFeedback } from "../shared/Feedback";
import PatternGame from "./games/PatternGame";
import PictureMemoryGame from "./games/PictureMemoryGame";
import InstructionsGame from "./games/InstructionsGame";
import NumberMemoryGame from "./games/NumberMemoryGame";
import { UI } from "../config/levelThemes";

import { MemoryStage, MemoryNav, MemoryTracker, MemoryBunny, MemoryBoard, MemoryButton } from "../shared/GameLayout";
import HowToPlay from "../shared/HowToPlay";

import "../styles/contentRefinement.css";

import "../styles/gameLevels.css";

import { getImprovementBunnyMessage } from "../config/gameConfig";
import "../styles/improvementLayout.css";

export default function ActivityScreen(p) {
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const { phase, subCategoryKey: game, currentQuestion: q, levelNumber, slots = [] } = p;
  const Game = { pattern: PatternGame, words: PictureMemoryGame, instructions: InstructionsGame, numbers: NumberMemoryGame }[game] || InstructionsGame;
  const answered = phase === "feedback";
  const levelFour = Number(levelNumber) === 4;
  const levelThree = Number(levelNumber) === 3;
  const levelTwo = Number(levelNumber) === 2;
  const levelOne = Number(levelNumber) === 1 || levelTwo || levelThree || levelFour;
  const title = text({ pattern: "Pattern Recognition", words: "Picture Memory", instructions: "Following Instructions", numbers: "Number Memory" }[game], { pattern: "රටා මතකය", words: "පින්තූර මතකය", instructions: "උපදෙස් අනුගමනය", numbers: "අංක මතකය" }[game]);
  const bubble = getImprovementBunnyMessage({ game, phase, awaiting: game === "numbers" ? p.numbersAwaitingPlay : p.wordsAwaitingPlay, correct: p.isCurrentCorrect, backward: q?.isBackward, si });
  return <MemoryStage level={levelNumber} className={`lx-game${levelFour ? " lx-level-four" : levelThree ? " lx-level-three" : levelTwo ? " lx-level-two" : levelOne ? " lx-level-one" : ""} lx-game--${game} lx-phase--${phase}`}>
    <MemoryNav title={levelFour && phase === "levelComplete" ? text("Level 4 Results", "\u0db8\u0da7\u0dca\u0da7\u0db8 4") : levelThree && phase === "levelComplete" ? text("Level 3 Results", "\u0db8\u0da7\u0dca\u0da7\u0db8 3") : levelTwo && phase === "levelComplete" ? text("Level 2 Results", "මට්ටම 2 ප්‍රතිඵල") : `${text("Level", "මට්ටම")} ${levelNumber} • ${title}`} onBack={p.handleBackToLevels} stars={p.totalStars} />
    {phase === "video" ? <HowToPlay key={`${game}-${levelNumber}-${p.i18n.language}`} levelNumber={levelNumber} gameType={game} videoUrl={p.subCatData?.videoUrl || p.subCatData?.youtubeVideoUrl} onSkipAndPlay={p.handleSkipAndPlay} language={p.i18n.language} /> : levelOne && phase === "levelComplete" ? <LevelCompletion p={p} si={si} /> : levelOne && phase === "result" ? <ActivityResults p={p} title={title} si={si} /> : game === "pattern" && phase !== "levelComplete" ? <Game {...p} /> : <>
      {!["result", "levelComplete"].includes(phase) && <MemoryTracker current={p.currentIdx + 1} total={p.questions.length} responses={p.results} questionIds={p.questions.map(question => question.id)} />}
      <MemoryBunny message={bubble} />
      <MemoryBoard className={phase === "result" ? "lx-results" : ""} data-question-id={q?.id}>
        {phase === "result" ? <LegacyActivityResults p={p} title={title} si={si} /> : phase === "levelComplete" ? <>
          <img src={`${UI}/icons/star.svg`} alt="" width="95" height="95" /><h1 className="lx-result-title">{text("Level complete!", "මට්ටම සම්පූර්ණයි!")}</h1><p>{text("You finished all four games. Well done!", "ඔබ ක්‍රීඩා හතරම සම්පූර්ණ කළා. හොඳයි!")}</p><MemoryButton onClick={p.handleContinueLevel}>{text(Number(levelNumber) < 4 ? "Next level" : "Back to levels", Number(levelNumber) < 4 ? "ඊළඟ මට්ටම" : "මට්ටම් වෙත")}</MemoryButton>
        </> : <><div className="lx-game-activity" inert={answered ? true : undefined} style={{ "--item-count": Math.max(q?.showItems?.length || 0, slots.length, 1) }}>{<Game key={`${q?.id}-${p.currentIdx}`} {...p} />}</div>{answered && (levelOne ? <div className="lx-feedback-footer lx-level-one-actions"><MemoryButton onClick={p.handleNextQuestion}>{text(p.currentIdx === p.questions.length - 1 ? "See results" : "Next", p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ")}</MemoryButton></div> : <InlineFeedback p={p} si={si} />)}</>}
      </MemoryBoard>
      {answered && levelOne && <Feedback p={p} si={si} />}
    </>}
  </MemoryStage>;
}
