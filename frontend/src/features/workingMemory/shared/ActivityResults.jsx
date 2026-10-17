import { UI } from "../config/levelThemes";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { MemoryBoard, MemoryButton, DashboardBunny } from "./GameLayout";
import { GAME_CATEGORIES as CATEGORIES, DASHBOARD_CONTENT } from "../config/gameConfig";
import { getSavedLevel } from "../logic/progression";
import "../styles/patternReference.css";
import "../styles/levelOneDashboard.css";
const ART = "/images/workingMemory/shared";

export default function ActivityResults({ p, title, si = false }) {
  const level = Number(p.levelNumber);
  const isFinal = level === 4;
  const messages = DASHBOARD_CONTENT[level];
  const text = (en, sinhala) => si ? sinhala : en;
  const totalQuestions = p.questions?.length || 5;
  // Keep the original Pattern dashboard expression at exactly 3/5: happy.
  // This expression is independent of saved completion and unlock status.
  const happyExpression = p.score >= 3;
  const canContinueAttempt = p.score >= 3 && !p.isSubmitting && Boolean(p.submitResult);
  const savedLevel = getSavedLevel(p.savedProgress || p.submitResult?.progress, level);
  const currentSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === p.subCategoryKey);
  const nextCategory = CATEGORIES[CATEGORIES.findIndex(category => category.key === p.subCategoryKey) + 1];
  const nextSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === nextCategory?.key);
  const isLastGame = p.subCategoryKey === "numbers";
  const earnedStars = p.submitResult?.starsEarned ?? p.submitResult?.carrotsEarned ?? p.earnedStars;
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const categoryStars = recordsAvailable ? p.levelHistory.filter(attempt => Number(attempt.levelNumber) === level && attempt.subCategoryKey === p.subCategoryKey).reduce((total, attempt) => { const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned); return total + (Number.isFinite(stars) && stars >= 0 ? stars : 0); }, 0) : null;
  const continuation = isLastGame
    ? savedLevel?.isCompleted ? text("View Level Results", "මට්ටමේ ප්‍රතිඵල බලන්න") : text("Back to games", "ක්‍රීඩා වෙත යන්න")
    : text("Next Game", "ඊළඟ ක්‍රීඩාව");

  let status;
  if (p.isSubmitting) status = text("Saving your progress…", "ප්‍රගතිය සුරකිමින්…");
  else if (p.submissionError) status = text("Your progress could not be saved. Retry saving to continue.", "ප්‍රගතිය සුරැකීමට නොහැකි විය. ඉදිරියට යාමට නැවත සුරකින්න.");
  else if (p.progressLoading) status = text("Refreshing your saved progress…", "සුරැකි ප්‍රගතිය නැවත ලබා ගනිමින්…");
  else if (p.progressError && p.submitResult) status = text("Result saved. Refresh progress to confirm the latest unlocks.", "ප්‍රතිඵල සුරැකී ඇත. නව ප්‍රගතිය තහවුරු කිරීමට නැවත ලබා ගන්න.");
  else if (!p.submitResult) status = text("Your result needs to be saved before you can continue.", "ඉදිරියට යාමට පෙර ප්‍රතිඵල සුරැකිය යුතුය.");
  else if (p.score < 3) status = currentSaved?.isCompleted
    ? text("Your earlier completion is saved. Get at least 3 out of 5 on this attempt to continue.", "ඔබේ පෙර සම්පූර්ණ කිරීම සුරැකී ඇත. ඉදිරියට යාමට මෙම වාරයේ 5 න් 3 ක් නිවැරදි කරන්න.")
    : text("Get at least 3 out of 5 correct to unlock the next game. You can try again!", "ඊළඟ ක්‍රීඩාව විවෘත කිරීමට 5 න් 3 ක් නිවැරදි කරන්න. නැවත උත්සාහ කරමු!");
  else if (isLastGame) status = savedLevel?.isCompleted
    ? text(messages.gamesComplete.en, messages.gamesComplete.si)
    : text("Progress saved. Visit the game menu to finish the remaining activities.", "ප්‍රගතිය සුරැකී ඇත. ඉතිරි ක්‍රියාකාරකම් සම්පූර්ණ කිරීමට ක්‍රීඩා මෙනුව වෙත යන්න.");
  else status = nextSaved?.isUnlocked
    ? text("Progress saved. The next game is unlocked!", "ප්‍රගතිය සුරැකී ඇත. ඊළඟ ක්‍රීඩාව විවෘතයි!")
    : text("You reached the 3 out of 5 pass mark. Your result is saved.", "ඔබ 5 න් 3 සමත් ලකුණ ලබා ඇත. ප්‍රතිඵල සුරැකී ඇත.");

  return <>
    <DashboardBunny happy={happyExpression} si={si} message={text(happyExpression ? "Well done! You kept going!" : "Good effort! Keep learning.", happyExpression ? "හොඳයි! ඔබ දිගටම උත්සාහ කළා!" : "හොඳ උත්සාහයක්! ඉගෙන ගනිමු.")} />
    <MemoryBoard className={`lx-level-one-dashboard lx-pattern-reference-board lx-pattern-result ${happyExpression ? "is-celebrating" : "is-encouraging"}`} data-testid={messages.ids.results} data-game={p.subCategoryKey}>
      <header className="lx-pattern-result-heading">
        {happyExpression && <img src={`${ART}/feedback/trophy.webp`} alt="" />}
        <div><h1>{text(happyExpression ? "Great Job!" : "Keep Going!", happyExpression ? "හොඳයි!" : "දිගටම උත්සාහ කරමු!")}</h1><p>{title} · {text(messages.level.en, messages.level.si)}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score: ${p.score} out of ${totalQuestions}`, `ඔබේ ලකුණු: ${totalQuestions} න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid={messages.ids.score}>{p.score} / {totalQuestions}</strong></div>
        <div className="lx-pattern-stars" aria-hidden="true">{Array.from({ length: totalQuestions }, (_, index) => <img key={index} className={index < p.score ? "is-earned" : ""} src={`${ART}/feedback/star.webp`} alt="" />)}</div>
      </section>
      <div className="lx-pattern-statistics">
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{totalQuestions - p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/feedback/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong data-testid={messages.ids.earnedStars}>{earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status"><span>{status}</span>{isFinal && (recordsAvailable || p.historyLoading || p.historyError) && <><small className="lx-category-record">{recordsAvailable ? text(`Recorded stars in this game: ${categoryStars}`, `\u0db8\u0dd9\u0db8 \u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf\u0dc0\u0dda \u0dc3\u0dd4\u0dbb\u0dd0\u0d9a\u0dd2 \u0dad\u0dbb\u0dd4: ${categoryStars}`) : p.historyLoading ? text("Loading recorded stars...", "\u0dad\u0dbb\u0dd4 \u0dbd\u0db6\u0dcf \u0d9c\u0db1\u0dd2\u0db8\u0dd2\u0db1\u0dca...") : text("Recorded stars unavailable", "\u0dc3\u0dd4\u0dbb\u0dd0\u0d9a\u0dd2 \u0dad\u0dbb\u0dd4 \u0dbd\u0db6\u0dcf \u0d9c\u0dad \u0db1\u0ddc\u0dc4\u0dd0\u0d9a.")}</small>{p.historyError && <button type="button" onClick={p.handleRetryLevelHistory}>{text("Refresh recorded stars", "\u0dad\u0dbb\u0dd4 \u0db1\u0dd0\u0dc0\u0dad \u0dbd\u0db6\u0dcf \u0d9c\u0db1\u0dca\u0db1")}</button>}</>}{p.progressError && p.submitResult && !p.submissionError && <button type="button" disabled={p.progressLoading} onClick={p.handleRetryProgress}>{text("Refresh Progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</p>
      <div className="lx-pattern-result-actions">
        <MemoryButton variant="secondary" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text("Play Again", "නැවත ක්‍රීඩා කරන්න")}</MemoryButton>
        <MemoryButton className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : !canContinueAttempt} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{p.submissionError ? text("Retry Saving", "නැවත සුරකින්න") : continuation}<ArrowRight aria-hidden="true" /></MemoryButton>
      </div>
    </MemoryBoard>
  </>;
}

export function LegacyActivityResults({ p, title, si }) {
  const passed = p.score >= 3;
  return <>
    <h1 className="lx-result-title">{si ? passed ? "සුබ පැතුම්!" : "හොඳ උත්සාහයක්!" : passed ? "CONGRATULATIONS!" : "NICE TRY!"}</h1><p className="lx-note">{title} · {si ? "මට්ටම" : "Level"} {p.levelNumber}</p>
    <div className="lx-score"><div><small>{si ? "ඔබේ ලකුණු" : "YOUR SCORE"}</small><strong>{p.score} / {p.questions.length}</strong></div><div className="lx-earned-stars">{Array.from({ length: 5 }, (_, i) => <img className={i < p.score ? "is-earned" : ""} key={i} src={`${UI}/icons/star.svg`} alt={i < p.score ? "Earned star" : ""} />)}</div></div>
    <div className="lx-result-stats">{[[si ? "නිවැරදි" : "Correct", p.score], [si ? "වැරදි" : "Incorrect", p.questions.length - p.score], [si ? "ලැබුණු තරු" : "Stars Earned", p.earnedStars]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <p className="lx-result-notice" role="status">{p.isSubmitting ? (si ? "ප්‍රගතිය සුරකිමින්..." : "Saving your progress…") : p.submissionError ? (si ? "සුරැකීමට නොහැක. නැවත උත්සාහ කරන්න." : "We couldn't save your progress. Please try again.") : passed ? (si ? "හොඳයි! ඔබ ක්‍රීඩාව සමත් වුණා." : "Well done! You passed this game.") : (si ? "ඊළඟ ක්‍රීඩාවට නිවැරදි පිළිතුරු 3 ක් අවශ්‍යයි. නැවත උත්සාහ කරමු!" : "Get 3 correct to unlock the next game. Let's try again!")}</p>
    <div className="lx-actions"><MemoryButton variant="secondary" onClick={p.startQuiz} disabled={p.isSubmitting}>{si ? "නැවත ක්‍රීඩා කරන්න" : "Play again"}</MemoryButton>{p.submissionError ? <MemoryButton onClick={p.handleRetrySave}>{si ? "නැවත සුරකින්න" : "Retry saving"}</MemoryButton> : <MemoryButton variant="play" disabled={!passed || p.isSubmitting || !p.submitResult} onClick={p.handleNextSubCategory}>{si ? "ඊළඟ ක්‍රීඩාව" : "Next game"}</MemoryButton>}</div>
  </>;
}
