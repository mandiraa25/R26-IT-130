/*
 * FILE PURPOSE
 * Presentation switch that chooses which improvement screen or game is visible.
 *
 * HOW IT CONNECTS
 * ImprovementPage passes the props object p. This file selects PatternGame, PictureMemoryGame,
 * InstructionsGame or NumberMemoryGame and reuses HowToPlay, Feedback, ActivityResults and
 * LevelCompletion.
 * Direct source importers: ImprovementPage.jsx.
 * Local feature/style dependencies: ../shared/ActivityResults.jsx, ../shared/LevelCompletion.jsx,
 * ../shared/Feedback.jsx, games/PatternGame.jsx, games/PictureMemoryGame.jsx,
 * games/InstructionsGame.jsx, games/NumberMemoryGame.jsx, ../config/levelThemes.js,
 * ../shared/GameLayout.jsx, ../shared/HowToPlay.jsx, ../styles/contentRefinement.css,
 * ../styles/gameLevels.css, ../config/gameConfig.js, ../styles/improvementLayout.css.
 *
 * THINGS TO REMEMBER
 * Read phase to find the tutorial/result branches. MemoryStage and MemoryNav surround all branches.
 * The old variable levelOne is true for every supported level, so shared feedback/results apply to
 * Levels 1-4. Base styles: memoryUI.css; refinements: contentRefinement.css, gameLevels.css and
 * improvementLayout.css.
 */

// VIVA: Choose the visible tutorial, game, feedback or results from controller props.
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

/*
 * FUNCTION / COMPONENT: ActivityScreen
 * React renders this component when its parent uses <ActivityScreen /> or when its state/props change.
 * INPUT PROPS: p. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function ActivityScreen(p) {
  // VIVA: This component chooses what to render from the controller's phase;
  // answer checking, timers and saving remain in ImprovementPage.
  const si = p.i18n.language?.startsWith("si");
  const text = (en, sinhala) => si ? sinhala : en;
  const { phase, subCategoryKey: game, currentQuestion: q, levelNumber, slots = [] } = p;
  const Game = { pattern: PatternGame, words: PictureMemoryGame, instructions: InstructionsGame, numbers: NumberMemoryGame }[game] || InstructionsGame;
  // VIVA: The stored key "words" means Picture Memory, not a spelling game.
  const answered = phase === "feedback";
  const levelFour = Number(levelNumber) === 4;
  const levelThree = Number(levelNumber) === 3;
  const levelTwo = Number(levelNumber) === 2;
  const levelOne = Number(levelNumber) === 1 || levelTwo || levelThree || levelFour;
  // VIVA: Despite its historic name, levelOne enables the shared results and
  // feedback presentation for every supported level (1 through 4).
  const title = text({ pattern: "Pattern Recognition", words: "Picture Memory", instructions: "Following Instructions", numbers: "Number Memory" }[game], { pattern: "රටා මතකය", words: "පින්තූර මතකය", instructions: "උපදෙස් අනුගමනය", numbers: "අංක මතකය" }[game]);
  const bubble = getImprovementBunnyMessage({ game, phase, awaiting: game === "numbers" ? p.numbersAwaitingPlay : p.wordsAwaitingPlay, correct: p.isCurrentCorrect, backward: q?.isBackward, si });
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <MemoryStage level={levelNumber} className={`lx-game${levelFour ? " lx-level-four" : levelThree ? " lx-level-three" : levelTwo ? " lx-level-two" : levelOne ? " lx-level-one" : ""} lx-game--${game} lx-phase--${phase}`}>
    {/* VIVA: The level/game title, back button and total stars are here. */}
    <MemoryNav title={levelFour && phase === "levelComplete" ? text("Level 4 Results", "\u0db8\u0da7\u0dca\u0da7\u0db8 4") : levelThree && phase === "levelComplete" ? text("Level 3 Results", "\u0db8\u0da7\u0dca\u0da7\u0db8 3") : levelTwo && phase === "levelComplete" ? text("Level 2 Results", "මට්ටම 2 ප්‍රතිඵල") : `${text("Level", "මට්ටම")} ${levelNumber} • ${title}`} onBack={p.handleBackToLevels} stars={p.totalStars} />
    {phase === "video" ? <HowToPlay key={`${game}-${levelNumber}-${p.i18n.language}`} levelNumber={levelNumber} gameType={game} videoUrl={p.subCatData?.videoUrl || p.subCatData?.youtubeVideoUrl} onSkipAndPlay={p.handleSkipAndPlay} language={p.i18n.language} /> : levelOne && phase === "levelComplete" ? <LevelCompletion p={p} si={si} /> : levelOne && phase === "result" ? <ActivityResults p={p} title={title} si={si} /> : game === "pattern" && phase !== "levelComplete" ? <Game {...p} /> : <>
      {!["result", "levelComplete"].includes(phase) && <MemoryTracker current={p.currentIdx + 1} total={p.questions.length} responses={p.results} questionIds={p.questions.map(question => question.id)} />}
      <MemoryBunny message={bubble} />
      {/* VIVA: The activity board hosts game content; feedback follows an answer. */}
      <MemoryBoard className={phase === "result" ? "lx-results" : ""} data-question-id={q?.id}>
        {phase === "result" ? <LegacyActivityResults p={p} title={title} si={si} /> : phase === "levelComplete" ? <>
          <img src={`${UI}/icons/star.svg`} alt="" width="95" height="95" /><h1 className="lx-result-title">{text("Level complete!", "මට්ටම සම්පූර්ණයි!")}</h1><p>{text("You finished all four games. Well done!", "ඔබ ක්‍රීඩා හතරම සම්පූර්ණ කළා. හොඳයි!")}</p><MemoryButton onClick={p.handleContinueLevel}>{text(Number(levelNumber) < 4 ? "Next level" : "Back to levels", Number(levelNumber) < 4 ? "ඊළඟ මට්ටම" : "මට්ටම් වෙත")}</MemoryButton>
        </> : <><div className="lx-game-activity" inert={answered ? true : undefined} style={{ "--item-count": Math.max(q?.showItems?.length || 0, slots.length, 1) }}>{<Game key={`${q?.id}-${p.currentIdx}`} {...p} />}</div>{answered && (levelOne ? <div className="lx-feedback-footer lx-level-one-actions"><MemoryButton onClick={p.handleNextQuestion}>{text(p.currentIdx === p.questions.length - 1 ? "See results" : "Next", p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ")}</MemoryButton></div> : <InlineFeedback p={p} si={si} />)}</>}
      </MemoryBoard>
      {answered && levelOne && <Feedback p={p} si={si} />}
    </>}
  </MemoryStage>;
}
