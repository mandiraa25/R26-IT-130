import { MemoryButton, MemoryPicture } from "./GameLayout";

export default function Feedback({ p, si }) {
  return <aside className={`lx-level-one-feedback${p.isCurrentCorrect ? " is-correct" : " is-incorrect"}`}
    data-testid="level-one-feedback" role="status" aria-live="polite" aria-atomic="true">
    <div className="lx-feedback-stars" aria-hidden="true">{[0,1,2].map(index => <img key={index} src="/images/workingMemory/shared/feedback/star.webp" alt="" />)}</div>
    <p>{si ? p.isCurrentCorrect ? "නිවැරදියි! හොඳයි!" : "හොඳ උත්සාහයක්! දිගටම උත්සාහ කරමු!" : p.isCurrentCorrect ? "Correct! Well done!" : "Not quite. Keep trying!"}</p>
    {p.isCurrentCorrect && <span className="lx-feedback-reward">+{p.lastStarReward} {si ? "තරු" : "stars"}</span>}
  </aside>;
}

export function InlineFeedback({ p, si }) {
  return <div className={`lx-feedback ${p.isCurrentCorrect ? "" : "is-incorrect"}`} role="status">
    <h2>{si ? p.isCurrentCorrect ? "හොඳයි!" : "හොඳ උත්සාහයක්!" : p.isCurrentCorrect ? "Great job!" : "Good try!"}</h2>
    <p>{si ? p.isCurrentCorrect ? "ඔබ නිවැරදි පිළිතුර තෝරා ගත්තා!" : "අපි දිගටම ඉගෙන ගනිමු." : p.isCurrentCorrect ? "You remembered correctly!" : "Let's keep learning together."}</p>
    {p.isCurrentCorrect && <p>+{p.lastStarReward} {si ? "තරු" : "stars"}</p>}
    {!p.isCurrentCorrect && <div className="lx-feedback-summary"><small>{si ? "නිවැරදි පිළිතුර:" : "Correct answer:"}</small>{p.subCategoryKey === "words" ? p.currentQuestion.correct.map((item, i) => <MemoryPicture key={i} item={item} level={p.levelNumber} />) : <strong>{Array.isArray(p.currentQuestion.correct) ? p.currentQuestion.correct.join(" · ") : p.currentQuestion.correct}</strong>}</div>}
    <MemoryButton onClick={p.handleNextQuestion}>{si ? p.currentIdx === p.questions.length - 1 ? "ප්‍රතිඵල" : "ඊළඟ" : p.currentIdx === p.questions.length - 1 ? "See results" : "Next"}</MemoryButton>
  </div>;
}
