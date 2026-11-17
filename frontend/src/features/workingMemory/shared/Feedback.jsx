/*
 * FILE PURPOSE
 * Reusable correct/incorrect messages shown after an improvement answer.
 *
 * HOW IT CONNECTS
 * ActivityScreen and PatternGame pass controller state p and si. gameConfig supplies the messages;
 * GameLayout supplies optional picture examples and Next button.
 * Direct source importers: ../improvement/ActivityScreen.jsx, ../improvement/games/PatternGame.jsx.
 * Local feature/style dependencies: GameLayout.jsx, ../config/gameConfig.js.
 *
 * THINGS TO REMEMBER
 * isCurrentCorrect selects styling; lastStarReward shows the actual reward. The three decorative stars
 * do not mean three points. Supported levels use Feedback below the board; InlineFeedback remains as
 * an alternate branch. Base memoryUI.css and improvementLayout.css style it.
 */

// VIVA: Shared correct/incorrect feedback and the displayed per-answer reward.
import { X } from "lucide-react";
import { MemoryButton, MemoryPicture } from "./GameLayout";
import { getImprovementFeedback } from "../config/gameConfig";

/*
 * FUNCTION / COMPONENT: FeedbackMessage
 * One shared message body reused by normal and inline answer feedback.
 * PROPS: p supplies correctness/last reward; si selects bilingual feedback from gameConfig.
 * RETURNS: Three decorative stars or encouragement icon, title, note and actual reward.
 * The three stars are artwork. A correct improvement answer still earns five reward stars.
 */
function FeedbackMessage({ p, si }) {
  // VIVA: Feedback displays the controller's correctness and actual last reward;
  // the decorative star images do not calculate points or unlock activities.
  const { title, note } = getImprovementFeedback({ correct: p.isCurrentCorrect, si });
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    {/* VIVA: Reward artwork or encouragement appears above the feedback text. */}
    {p.isCurrentCorrect
      ? <div className="lx-feedback-stars" aria-hidden="true">{[0, 1, 2].map(index => <img key={index} src="/images/workingMemory/shared/feedback/star.webp" alt="" />)}</div>
      : <div className="lx-feedback-encouragement" aria-hidden="true"><X strokeWidth={4} /></div>}
    <h2>{title}</h2>
    <p>{note}</p>
    {p.isCurrentCorrect && <span className="lx-feedback-reward">+{p.lastStarReward} {si ? "තරු" : "stars"}</span>}
  </>;
}

/*
 * FUNCTION / COMPONENT: Feedback
 * React renders this component when its parent uses <Feedback /> or when its state/props change.
 * INPUT PROPS: { p, si }. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function Feedback({ p, si }) {
  // VIVA: The status panel beneath the activity displays feedback after Submit.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <aside className={`lx-level-one-feedback lx-answer-feedback${p.isCurrentCorrect ? " is-correct" : " is-incorrect"}`}
    data-testid="level-one-feedback" role="status" aria-live="polite" aria-atomic="true">
    <FeedbackMessage p={p} si={si} />
  </aside>;
}

/*
 * FUNCTION / COMPONENT: InlineFeedback
 * React renders this component when its parent uses <InlineFeedback /> or when its state/props change.
 * INPUT PROPS: { p, si }. These values/callbacks come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export function InlineFeedback({ p, si }) {
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className={`lx-feedback lx-answer-feedback ${p.isCurrentCorrect ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite" aria-atomic="true">
    <FeedbackMessage p={p} si={si} />
    {!p.isCurrentCorrect && <div className="lx-feedback-summary"><small>{si ? "නිවැරදි පිළිතුර:" : "Correct answer:"}</small>{p.subCategoryKey === "words" ? p.currentQuestion.correct.map((item, i) => <MemoryPicture key={i} item={item} level={p.levelNumber} />) : <strong>{Array.isArray(p.currentQuestion.correct) ? p.currentQuestion.correct.join(" · ") : p.currentQuestion.correct}</strong>}</div>}
    <MemoryButton onClick={p.handleNextQuestion}>{si ? p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ" : p.currentIdx === p.questions.length - 1 ? "See results" : "Next"}</MemoryButton>
  </div>;
}
