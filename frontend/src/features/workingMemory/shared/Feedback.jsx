import { X } from "lucide-react";
import { MemoryButton, MemoryPicture } from "./GameLayout";
import { getImprovementFeedback } from "../config/gameConfig";

function FeedbackMessage({ p, si }) {
  const { title, note } = getImprovementFeedback({ correct: p.isCurrentCorrect, si });
  return <>
    {p.isCurrentCorrect
      ? <div className="lx-feedback-stars" aria-hidden="true">{[0, 1, 2].map(index => <img key={index} src="/images/workingMemory/shared/feedback/star.webp" alt="" />)}</div>
      : <div className="lx-feedback-encouragement" aria-hidden="true"><X strokeWidth={4} /></div>}
    <h2>{title}</h2>
    <p>{note}</p>
    {p.isCurrentCorrect && <span className="lx-feedback-reward">+{p.lastStarReward} {si ? "තරු" : "stars"}</span>}
  </>;
}

export default function Feedback({ p, si }) {
  return <aside className={`lx-level-one-feedback lx-answer-feedback${p.isCurrentCorrect ? " is-correct" : " is-incorrect"}`}
    data-testid="level-one-feedback" role="status" aria-live="polite" aria-atomic="true">
    <FeedbackMessage p={p} si={si} />
  </aside>;
}

export function InlineFeedback({ p, si }) {
  return <div className={`lx-feedback lx-answer-feedback ${p.isCurrentCorrect ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite" aria-atomic="true">
    <FeedbackMessage p={p} si={si} />
    {!p.isCurrentCorrect && <div className="lx-feedback-summary"><small>{si ? "නිවැරදි පිළිතුර:" : "Correct answer:"}</small>{p.subCategoryKey === "words" ? p.currentQuestion.correct.map((item, i) => <MemoryPicture key={i} item={item} level={p.levelNumber} />) : <strong>{Array.isArray(p.currentQuestion.correct) ? p.currentQuestion.correct.join(" · ") : p.currentQuestion.correct}</strong>}</div>}
    <MemoryButton onClick={p.handleNextQuestion}>{si ? p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ" : p.currentIdx === p.questions.length - 1 ? "See results" : "Next"}</MemoryButton>
  </div>;
}
