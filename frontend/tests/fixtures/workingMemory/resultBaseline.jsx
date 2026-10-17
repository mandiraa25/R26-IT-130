// Frozen pre-migration dashboard renderers, used only for equivalence tests.
import React from "react";
import { ArrowRight, Check, Hash, Images, ListOrdered, LockKeyhole, RotateCcw, Shapes, X } from "lucide-react";
import { MemoryBoard, MemoryButton } from "../../../src/features/workingMemory/shared/GameLayout";

const level1 = (() => {
const ART = "/images/workingMemory/shared";

const CATEGORIES = [
  { key: "pattern", en: "Pattern Recognition", si: "රටා හඳුනාගැනීම", Icon: Shapes },
  { key: "words", en: "Picture Memory", si: "පින්තූර මතකය", Icon: Images },
  { key: "instructions", en: "Following Instructions", si: "උපදෙස් අනුගමනය", Icon: ListOrdered },
  { key: "numbers", en: "Number Memory", si: "අංක මතකය", Icon: Hash },
];

function DashboardBunny({ happy, message, si }) {
  return <>
    <img className="lx-pattern-result-bunny lx-level-one-result-bunny" src={`${ART}/bunny/bunny-${happy ? "happy" : "sad"}.webp`} alt={si ? happy ? "සතුටු හාවා" : "දිරිගන්වන හාවා" : happy ? "Happy bunny" : "Encouraging bunny"} />
    <aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>
  </>;
}

function savedLevelFor(p) {
  const progress = p.savedProgress || p.submitResult?.progress;
  return progress?.levelsProgress?.find(level => Number(level.levelNumber) === 1);
}

function LevelOneResultDashboard({ p, title, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const totalQuestions = p.questions?.length || 5;
  // Keep the original Pattern dashboard expression at exactly 3/5: happy.
  // This expression is independent of saved completion and unlock status.
  const happyExpression = p.score >= 3;
  const canContinueAttempt = p.score >= 3 && !p.isSubmitting && Boolean(p.submitResult);
  const savedLevel = savedLevelFor(p);
  const currentSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === p.subCategoryKey);
  const nextCategory = CATEGORIES[CATEGORIES.findIndex(category => category.key === p.subCategoryKey) + 1];
  const nextSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === nextCategory?.key);
  const isLastGame = p.subCategoryKey === "numbers";
  const earnedStars = p.submitResult?.starsEarned ?? p.submitResult?.carrotsEarned ?? p.earnedStars;
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
    ? text("Progress saved. All four Level 1 games are complete!", "ප්‍රගතිය සුරැකී ඇත. පළමු මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!")
    : text("Progress saved. Visit the game menu to finish the remaining activities.", "ප්‍රගතිය සුරැකී ඇත. ඉතිරි ක්‍රියාකාරකම් සම්පූර්ණ කිරීමට ක්‍රීඩා මෙනුව වෙත යන්න.");
  else status = nextSaved?.isUnlocked
    ? text("Progress saved. The next game is unlocked!", "ප්‍රගතිය සුරැකී ඇත. ඊළඟ ක්‍රීඩාව විවෘතයි!")
    : text("You reached the 3 out of 5 pass mark. Your result is saved.", "ඔබ 5 න් 3 සමත් ලකුණ ලබා ඇත. ප්‍රතිඵල සුරැකී ඇත.");

  return <>
    <DashboardBunny happy={happyExpression} si={si} message={text(happyExpression ? "Well done!" : "Good try! Let's keep learning.", happyExpression ? "හොඳයි!" : "හොඳ උත්සාහයක්! දිගටම ඉගෙන ගනිමු.")} />
    <MemoryBoard className={`lx-level-one-dashboard lx-pattern-reference-board lx-pattern-result ${happyExpression ? "is-celebrating" : "is-encouraging"}`} data-testid="level-one-results" data-game={p.subCategoryKey}>
      <header className="lx-pattern-result-heading">
        {happyExpression && <img src={`${ART}/feedback/trophy.webp`} alt="" />}
        <div><h1>{text(happyExpression ? "Great Job!" : "Keep Going!", happyExpression ? "හොඳයි!" : "දිගටම උත්සාහ කරමු!")}</h1><p>{title} · {text("Level 1", "මට්ටම 1")}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score: ${p.score} out of ${totalQuestions}`, `ඔබේ ලකුණු: ${totalQuestions} න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid="level-one-score">{p.score} / {totalQuestions}</strong></div>
        <div className="lx-pattern-stars" aria-hidden="true">{Array.from({ length: totalQuestions }, (_, index) => <img key={index} className={index < p.score ? "is-earned" : ""} src={`${ART}/feedback/star.webp`} alt="" />)}</div>
      </section>
      <div className="lx-pattern-statistics">
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{totalQuestions - p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/feedback/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong data-testid="level-one-earned-stars">{earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status"><span>{status}</span>{p.progressError && p.submitResult && !p.submissionError && <button type="button" disabled={p.progressLoading} onClick={p.handleRetryProgress}>{text("Refresh Progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</p>
      <div className="lx-pattern-result-actions">
        <MemoryButton variant="secondary" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text("Play Again", "නැවත ක්‍රීඩා කරන්න")}</MemoryButton>
        <MemoryButton className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : !canContinueAttempt} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{p.submissionError ? text("Retry Saving", "නැවත සුරකින්න") : continuation}<ArrowRight aria-hidden="true" /></MemoryButton>
      </div>
    </MemoryBoard>
  </>;
}

function LevelOneCompletionDashboard({ p, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const progress = p.savedProgress || p.submitResult?.progress;
  const savedLevel = savedLevelFor(p);
  const recordedCategories = savedLevel?.subCategories || [];
  const completedCount = CATEGORIES.filter(category => recordedCategories.some(saved => saved.subCategoryKey === category.key && saved.isCompleted)).length;
  const isComplete = Boolean(savedLevel?.isCompleted) && completedCount === CATEGORIES.length;
  const nextLevel = progress?.levelsProgress?.find(level => Number(level.levelNumber) === 2);
  const nextPattern = nextLevel?.subCategories?.find(category => category.subCategoryKey === "pattern");
  const isNextLevelUnlocked = Number(progress?.maxUnlockedLevel) >= 2 && Boolean(nextPattern?.isUnlocked);
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const recordedStars = Object.fromEntries(CATEGORIES.map(category => [category.key, 0]));
  if (recordsAvailable) {
    for (const attempt of p.levelHistory) {
      if (Number(attempt.levelNumber) !== 1 || !Object.hasOwn(recordedStars, attempt.subCategoryKey)) continue;
      const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned);
      if (Number.isFinite(stars) && stars >= 0) recordedStars[attempt.subCategoryKey] += stars;
    }
  }
  const totalLevelStars = Object.values(recordedStars).reduce((total, stars) => total + stars, 0);
  const starsValue = value => recordsAvailable ? value : "—";

  let status;
  if (p.progressLoading) status = text("Checking your saved progress…", "සුරැකි ප්‍රගතිය පරීක්ෂා කරමින්…");
  else if (p.progressError) status = text("Your saved progress could not be refreshed. Please retry.", "සුරැකි ප්‍රගතිය නැවත ලබා ගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
  else if (isNextLevelUnlocked) status = text("Level 2 is unlocked. Your next adventure is ready!", "දෙවන මට්ටම විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!");
  else status = text("Level 2 is locked. Complete all four Level 1 games with at least 3 out of 5 to unlock it.", "දෙවන මට්ටම අගුළු දමා ඇත. එය විවෘත කිරීමට පළමු මට්ටමේ ක්‍රීඩා හතරම 5 න් 3 ක් ලබා සම්පූර්ණ කරන්න.");

  return <>
    <DashboardBunny happy si={si} message={text(isComplete ? "Well done! What an adventure!" : "Every step helps you grow!", isComplete ? "හොඳයි! අපූරු වික්‍රමයක්!" : "සෑම පියවරක්ම ඔබට උපකාරී වේ!")} />
    <MemoryBoard className="lx-level-one-dashboard lx-level-one-completion lx-pattern-reference-board lx-pattern-result" data-testid="level-one-completion">
      <header className="lx-pattern-result-heading"><img src={`${ART}/feedback/trophy.webp`} alt="" /><div><h1>{text(isComplete ? "Level 1 Complete!" : "Level 1 Progress", isComplete ? "මට්ටම 1 සම්පූර්ණයි!" : "මට්ටම 1 ප්‍රගතිය")}</h1><p>{text("Your saved journey across all four games", "ක්‍රීඩා හතරේම සුරැකි ප්‍රගතිය")}</p></div></header>
      <section className="lx-level-one-overview">
        <div className="lx-level-one-total"><img src={`${ART}/feedback/star.webp`} alt="" /><div><span>{text("Total Level 1 stars", "මට්ටම 1 මුළු තරු")}</span><strong data-testid="level-one-total-stars">{starsValue(totalLevelStars)}</strong></div></div>
        <div className="lx-level-one-progress"><span>{text("Overall progress", "සමස්ත ප්‍රගතිය")}</span><strong>{completedCount} / {CATEGORIES.length} {text("games complete", "ක්‍රීඩා සම්පූර්ණයි")}</strong><div role="progressbar" aria-label={text("Level 1 completion", "මට්ටම 1 සම්පූර්ණ කිරීම")} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-valuenow={completedCount}><i style={{ width: `${completedCount / CATEGORIES.length * 100}%` }} /></div></div>
      </section>
      <div className="lx-level-one-category-results">{CATEGORIES.map(category => {
        const { key, en, si: sinhala, Icon } = category;
        const saved = recordedCategories.find(category => category.subCategoryKey === key);
        return <section key={key} data-category={key} className={`lx-level-one-category ${saved?.isCompleted ? "is-complete" : ""}`}>
          <Icon className="lx-level-one-category-icon" aria-hidden="true" /><div><h2>{text(en, sinhala)}</h2><p>{text(saved?.isCompleted ? "Complete" : saved?.isUnlocked ? "Ready to practise" : "Locked", saved?.isCompleted ? "සම්පූර්ණයි" : saved?.isUnlocked ? "පුහුණුවට සූදානම්" : "අගුළු දමා ඇත")}</p></div><strong><img src={`${ART}/feedback/star.webp`} alt={text("Recorded stars", "සුරැකි තරු")} /><span>{starsValue(recordedStars[key])}</span></strong>
        </section>;
      })}</div>
      <div className="lx-level-one-completion-status" role="status"><p>{!isNextLevelUnlocked && <LockKeyhole aria-hidden="true" />}{status}</p>{p.historyLoading && <small>{text("Loading recorded stars…", "සුරැකි තරු ලබා ගනිමින්…")}</small>}{p.historyError && <small>{text("Recorded stars could not be loaded.", "සුරැකි තරු ලබා ගැනීමට නොහැකි විය.")} <button type="button" onClick={p.handleRetryLevelHistory}>{text("Retry loading stars", "තරු නැවත ලබා ගන්න")}</button></small>}{p.progressError && <button type="button" onClick={p.handleRetryProgress}>{text("Refresh progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</div>
      <div className="lx-pattern-result-actions"><MemoryButton variant="secondary" className="lx-pattern-retry" onClick={p.handleBackToLevels}>{text("Back to Games", "ක්‍රීඩා වෙත යන්න")}</MemoryButton><MemoryButton className="lx-pattern-continue" onClick={p.handleContinueLevel} disabled={!isNextLevelUnlocked || p.progressLoading}>{text("Next Level", "ඊළඟ මට්ටම")}<ArrowRight aria-hidden="true" /></MemoryButton></div>
    </MemoryBoard>
  </>;
}
return { ActivityResults: LevelOneResultDashboard, LevelCompletion: LevelOneCompletionDashboard };
})();

const level2 = (() => {
const ART = "/images/workingMemory/shared";

const CATEGORIES = [
  { key: "pattern", en: "Pattern Recognition", si: "රටා හඳුනාගැනීම", Icon: Shapes },
  { key: "words", en: "Picture Memory", si: "පින්තූර මතකය", Icon: Images },
  { key: "instructions", en: "Following Instructions", si: "උපදෙස් අනුගමනය", Icon: ListOrdered },
  { key: "numbers", en: "Number Memory", si: "අංක මතකය", Icon: Hash },
];

function DashboardBunny({ happy, message, si }) {
  return <>
    <img className="lx-pattern-result-bunny lx-level-one-result-bunny" src={`${ART}/bunny/bunny-${happy ? "happy" : "sad"}.webp`} alt={si ? happy ? "සතුටු හාවා" : "දිරිගන්වන හාවා" : happy ? "Happy bunny" : "Encouraging bunny"} />
    <aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>
  </>;
}

function savedLevelFor(p) {
  const progress = p.savedProgress || p.submitResult?.progress;
  return progress?.levelsProgress?.find(level => Number(level.levelNumber) === 2);
}

function LevelTwoResultDashboard({ p, title, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const totalQuestions = p.questions?.length || 5;
  // Keep the original Pattern dashboard expression at exactly 3/5: happy.
  // This expression is independent of saved completion and unlock status.
  const happyExpression = p.score >= 3;
  const canContinueAttempt = p.score >= 3 && !p.isSubmitting && Boolean(p.submitResult);
  const savedLevel = savedLevelFor(p);
  const currentSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === p.subCategoryKey);
  const nextCategory = CATEGORIES[CATEGORIES.findIndex(category => category.key === p.subCategoryKey) + 1];
  const nextSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === nextCategory?.key);
  const isLastGame = p.subCategoryKey === "numbers";
  const earnedStars = p.submitResult?.starsEarned ?? p.submitResult?.carrotsEarned ?? p.earnedStars;
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
    ? text("Progress saved. All four Level 2 games are complete!", "ප්‍රගතිය සුරැකී ඇත. පළමු මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!")
    : text("Progress saved. Visit the game menu to finish the remaining activities.", "ප්‍රගතිය සුරැකී ඇත. ඉතිරි ක්‍රියාකාරකම් සම්පූර්ණ කිරීමට ක්‍රීඩා මෙනුව වෙත යන්න.");
  else status = nextSaved?.isUnlocked
    ? text("Progress saved. The next game is unlocked!", "ප්‍රගතිය සුරැකී ඇත. ඊළඟ ක්‍රීඩාව විවෘතයි!")
    : text("You reached the 3 out of 5 pass mark. Your result is saved.", "ඔබ 5 න් 3 සමත් ලකුණ ලබා ඇත. ප්‍රතිඵල සුරැකී ඇත.");

  return <>
    <DashboardBunny happy={happyExpression} si={si} message={text(happyExpression ? "Well done!" : "Good try! Let's keep learning.", happyExpression ? "හොඳයි!" : "හොඳ උත්සාහයක්! දිගටම ඉගෙන ගනිමු.")} />
    <MemoryBoard className={`lx-level-one-dashboard lx-pattern-reference-board lx-pattern-result ${happyExpression ? "is-celebrating" : "is-encouraging"}`} data-testid="level-two-results" data-game={p.subCategoryKey}>
      <header className="lx-pattern-result-heading">
        {happyExpression && <img src={`${ART}/feedback/trophy.webp`} alt="" />}
        <div><h1>{text(happyExpression ? "Great Job!" : "Keep Going!", happyExpression ? "හොඳයි!" : "දිගටම උත්සාහ කරමු!")}</h1><p>{title} · {text("Level 2", "මට්ටම 1")}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score: ${p.score} out of ${totalQuestions}`, `ඔබේ ලකුණු: ${totalQuestions} න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid="level-two-score">{p.score} / {totalQuestions}</strong></div>
        <div className="lx-pattern-stars" aria-hidden="true">{Array.from({ length: totalQuestions }, (_, index) => <img key={index} className={index < p.score ? "is-earned" : ""} src={`${ART}/feedback/star.webp`} alt="" />)}</div>
      </section>
      <div className="lx-pattern-statistics">
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{totalQuestions - p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/feedback/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong data-testid="level-two-earned-stars">{earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status"><span>{status}</span>{p.progressError && p.submitResult && !p.submissionError && <button type="button" disabled={p.progressLoading} onClick={p.handleRetryProgress}>{text("Refresh Progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</p>
      <div className="lx-pattern-result-actions">
        <MemoryButton variant="secondary" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text("Play Again", "නැවත ක්‍රීඩා කරන්න")}</MemoryButton>
        <MemoryButton className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : !canContinueAttempt} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{p.submissionError ? text("Retry Saving", "නැවත සුරකින්න") : continuation}<ArrowRight aria-hidden="true" /></MemoryButton>
      </div>
    </MemoryBoard>
  </>;
}

function LevelTwoCompletionDashboard({ p, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const progress = p.savedProgress || p.submitResult?.progress;
  const savedLevel = savedLevelFor(p);
  const recordedCategories = savedLevel?.subCategories || [];
  const completedCount = CATEGORIES.filter(category => recordedCategories.some(saved => saved.subCategoryKey === category.key && saved.isCompleted)).length;
  const isComplete = Boolean(savedLevel?.isCompleted) && completedCount === CATEGORIES.length;
  const nextLevel = progress?.levelsProgress?.find(level => Number(level.levelNumber) === 3);
  const nextPattern = nextLevel?.subCategories?.find(category => category.subCategoryKey === "pattern");
  const isNextLevelUnlocked = Number(progress?.maxUnlockedLevel) >= 3 && Boolean(nextPattern?.isUnlocked);
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const recordedStars = Object.fromEntries(CATEGORIES.map(category => [category.key, 0]));
  if (recordsAvailable) {
    for (const attempt of p.levelHistory) {
      if (Number(attempt.levelNumber) !== 2 || !Object.hasOwn(recordedStars, attempt.subCategoryKey)) continue;
      const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned);
      if (Number.isFinite(stars) && stars >= 0) recordedStars[attempt.subCategoryKey] += stars;
    }
  }
  const totalLevelStars = Object.values(recordedStars).reduce((total, stars) => total + stars, 0);
  const starsValue = value => recordsAvailable ? value : "—";

  let status;
  if (p.progressLoading) status = text("Checking your saved progress…", "සුරැකි ප්‍රගතිය පරීක්ෂා කරමින්…");
  else if (p.progressError) status = text("Your saved progress could not be refreshed. Please retry.", "සුරැකි ප්‍රගතිය නැවත ලබා ගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
  else if (isNextLevelUnlocked) status = text("Level 3 is unlocked. Your next adventure is ready!", "දෙවන මට්ටම විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!");
  else status = text("Level 3 is locked. Complete all four Level 2 games with at least 3 out of 5 to unlock it.", "දෙවන මට්ටම අගුළු දමා ඇත. එය විවෘත කිරීමට පළමු මට්ටමේ ක්‍රීඩා හතරම 5 න් 3 ක් ලබා සම්පූර්ණ කරන්න.");

  return <>
    <DashboardBunny happy si={si} message={text(isComplete ? "Well done! What an adventure!" : "Every step helps you grow!", isComplete ? "හොඳයි! අපූරු වික්‍රමයක්!" : "සෑම පියවරක්ම ඔබට උපකාරී වේ!")} />
    <MemoryBoard className="lx-level-one-dashboard lx-level-one-completion lx-pattern-reference-board lx-pattern-result" data-testid="level-two-completion">
      <header className="lx-pattern-result-heading"><img src={`${ART}/feedback/trophy.webp`} alt="" /><div><h1>{text(isComplete ? "Level 2 Complete!" : "Level 2 Progress", isComplete ? "මට්ටම 1 සම්පූර්ණයි!" : "මට්ටම 1 ප්‍රගතිය")}</h1><p>{text("Your saved journey across all four games", "ක්‍රීඩා හතරේම සුරැකි ප්‍රගතිය")}</p></div></header>
      <section className="lx-level-one-overview">
        <div className="lx-level-one-total"><img src={`${ART}/feedback/star.webp`} alt="" /><div><span>{text("Total Level 2 stars", "මට්ටම 1 මුළු තරු")}</span><strong data-testid="level-two-total-stars">{starsValue(totalLevelStars)}</strong></div></div>
        <div className="lx-level-one-progress"><span>{text("Overall progress", "සමස්ත ප්‍රගතිය")}</span><strong>{completedCount} / {CATEGORIES.length} {text("games complete", "ක්‍රීඩා සම්පූර්ණයි")}</strong><div role="progressbar" aria-label={text("Level 2 completion", "මට්ටම 1 සම්පූර්ණ කිරීම")} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-valuenow={completedCount}><i style={{ width: `${completedCount / CATEGORIES.length * 100}%` }} /></div></div>
      </section>
      <div className="lx-level-one-category-results">{CATEGORIES.map(category => {
        const { key, en, si: sinhala, Icon } = category;
        const saved = recordedCategories.find(category => category.subCategoryKey === key);
        return <section key={key} data-category={key} className={`lx-level-one-category ${saved?.isCompleted ? "is-complete" : ""}`}>
          <Icon className="lx-level-one-category-icon" aria-hidden="true" /><div><h2>{text(en, sinhala)}</h2><p>{text(saved?.isCompleted ? "Complete" : saved?.isUnlocked ? "Ready to practise" : "Locked", saved?.isCompleted ? "සම්පූර්ණයි" : saved?.isUnlocked ? "පුහුණුවට සූදානම්" : "අගුළු දමා ඇත")}</p></div><strong><img src={`${ART}/feedback/star.webp`} alt={text("Recorded stars", "සුරැකි තරු")} /><span>{starsValue(recordedStars[key])}</span></strong>
        </section>;
      })}</div>
      <div className="lx-level-one-completion-status" role="status"><p>{!isNextLevelUnlocked && <LockKeyhole aria-hidden="true" />}{status}</p>{p.historyLoading && <small>{text("Loading recorded stars…", "සුරැකි තරු ලබා ගනිමින්…")}</small>}{p.historyError && <small>{text("Recorded stars could not be loaded.", "සුරැකි තරු ලබා ගැනීමට නොහැකි විය.")} <button type="button" onClick={p.handleRetryLevelHistory}>{text("Retry loading stars", "තරු නැවත ලබා ගන්න")}</button></small>}{p.progressError && <button type="button" onClick={p.handleRetryProgress}>{text("Refresh progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</div>
      <div className="lx-pattern-result-actions"><MemoryButton variant="secondary" className="lx-pattern-retry" onClick={p.handleBackToLevels}>{text("Back to Games", "ක්‍රීඩා වෙත යන්න")}</MemoryButton><MemoryButton className="lx-pattern-continue" onClick={p.handleContinueLevel} disabled={!isNextLevelUnlocked || p.progressLoading}>{text("Next Level", "ඊළඟ මට්ටම")}<ArrowRight aria-hidden="true" /></MemoryButton></div>
    </MemoryBoard>
  </>;
}
return { ActivityResults: LevelTwoResultDashboard, LevelCompletion: LevelTwoCompletionDashboard };
})();

const level3 = (() => {
const ART = "/images/workingMemory/shared";

const CATEGORIES = [
  { key: "pattern", en: "Pattern Recognition", si: "රටා හඳුනාගැනීම", Icon: Shapes },
  { key: "words", en: "Picture Memory", si: "පින්තූර මතකය", Icon: Images },
  { key: "instructions", en: "Following Instructions", si: "උපදෙස් අනුගමනය", Icon: ListOrdered },
  { key: "numbers", en: "Number Memory", si: "අංක මතකය", Icon: Hash },
];

function DashboardBunny({ happy, message, si }) {
  return <>
    <img className="lx-pattern-result-bunny lx-level-one-result-bunny" src={`${ART}/bunny/bunny-${happy ? "happy" : "sad"}.webp`} alt={si ? happy ? "සතුටු හාවා" : "දිරිගන්වන හාවා" : happy ? "Happy bunny" : "Encouraging bunny"} />
    <aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>
  </>;
}

function savedLevelFor(p) {
  const progress = p.savedProgress || p.submitResult?.progress;
  return progress?.levelsProgress?.find(level => Number(level.levelNumber) === 3);
}

function LevelThreeResultDashboard({ p, title, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const totalQuestions = p.questions?.length || 5;
  // Keep the original Pattern dashboard expression at exactly 3/5: happy.
  // This expression is independent of saved completion and unlock status.
  const happyExpression = p.score >= 3;
  const canContinueAttempt = p.score >= 3 && !p.isSubmitting && Boolean(p.submitResult);
  const savedLevel = savedLevelFor(p);
  const currentSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === p.subCategoryKey);
  const nextCategory = CATEGORIES[CATEGORIES.findIndex(category => category.key === p.subCategoryKey) + 1];
  const nextSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === nextCategory?.key);
  const isLastGame = p.subCategoryKey === "numbers";
  const earnedStars = p.submitResult?.starsEarned ?? p.submitResult?.carrotsEarned ?? p.earnedStars;
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
    ? text("Progress saved. All four Level 3 games are complete!", "ප්‍රගතිය සුරැකී ඇත. තෙවන මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!")
    : text("Progress saved. Visit the game menu to finish the remaining activities.", "ප්‍රගතිය සුරැකී ඇත. ඉතිරි ක්‍රියාකාරකම් සම්පූර්ණ කිරීමට ක්‍රීඩා මෙනුව වෙත යන්න.");
  else status = nextSaved?.isUnlocked
    ? text("Progress saved. The next game is unlocked!", "ප්‍රගතිය සුරැකී ඇත. ඊළඟ ක්‍රීඩාව විවෘතයි!")
    : text("You reached the 3 out of 5 pass mark. Your result is saved.", "ඔබ 5 න් 3 සමත් ලකුණ ලබා ඇත. ප්‍රතිඵල සුරැකී ඇත.");

  return <>
    <DashboardBunny happy={happyExpression} si={si} message={text(happyExpression ? "Well done!" : "Good try! Let's keep learning.", happyExpression ? "හොඳයි!" : "හොඳ උත්සාහයක්! දිගටම ඉගෙන ගනිමු.")} />
    <MemoryBoard className={`lx-level-one-dashboard lx-pattern-reference-board lx-pattern-result ${happyExpression ? "is-celebrating" : "is-encouraging"}`} data-testid="level-three-results" data-game={p.subCategoryKey}>
      <header className="lx-pattern-result-heading">
        {happyExpression && <img src={`${ART}/feedback/trophy.webp`} alt="" />}
        <div><h1>{text(happyExpression ? "Great Job!" : "Keep Going!", happyExpression ? "හොඳයි!" : "දිගටම උත්සාහ කරමු!")}</h1><p>{title} · {text("Level 3", "මට්ටම 3")}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score: ${p.score} out of ${totalQuestions}`, `ඔබේ ලකුණු: ${totalQuestions} න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid="level-three-score">{p.score} / {totalQuestions}</strong></div>
        <div className="lx-pattern-stars" aria-hidden="true">{Array.from({ length: totalQuestions }, (_, index) => <img key={index} className={index < p.score ? "is-earned" : ""} src={`${ART}/feedback/star.webp`} alt="" />)}</div>
      </section>
      <div className="lx-pattern-statistics">
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{totalQuestions - p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/feedback/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong data-testid="level-three-earned-stars">{earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status"><span>{status}</span>{p.progressError && p.submitResult && !p.submissionError && <button type="button" disabled={p.progressLoading} onClick={p.handleRetryProgress}>{text("Refresh Progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</p>
      <div className="lx-pattern-result-actions">
        <MemoryButton variant="secondary" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text("Play Again", "නැවත ක්‍රීඩා කරන්න")}</MemoryButton>
        <MemoryButton className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : !canContinueAttempt} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{p.submissionError ? text("Retry Saving", "නැවත සුරකින්න") : continuation}<ArrowRight aria-hidden="true" /></MemoryButton>
      </div>
    </MemoryBoard>
  </>;
}

function LevelThreeCompletionDashboard({ p, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const progress = p.savedProgress || p.submitResult?.progress;
  const savedLevel = savedLevelFor(p);
  const recordedCategories = savedLevel?.subCategories || [];
  const completedCount = CATEGORIES.filter(category => recordedCategories.some(saved => saved.subCategoryKey === category.key && saved.isCompleted)).length;
  const isComplete = Boolean(savedLevel?.isCompleted) && completedCount === CATEGORIES.length;
  const nextLevel = progress?.levelsProgress?.find(level => Number(level.levelNumber) === 4);
  const nextPattern = nextLevel?.subCategories?.find(category => category.subCategoryKey === "pattern");
  const isNextLevelUnlocked = Number(progress?.maxUnlockedLevel) >= 4 && Boolean(nextPattern?.isUnlocked);
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const recordedStars = Object.fromEntries(CATEGORIES.map(category => [category.key, 0]));
  if (recordsAvailable) {
    for (const attempt of p.levelHistory) {
      if (Number(attempt.levelNumber) !== 3 || !Object.hasOwn(recordedStars, attempt.subCategoryKey)) continue;
      const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned);
      if (Number.isFinite(stars) && stars >= 0) recordedStars[attempt.subCategoryKey] += stars;
    }
  }
  const totalLevelStars = Object.values(recordedStars).reduce((total, stars) => total + stars, 0);
  const starsValue = value => recordsAvailable ? value : "—";

  let status;
  if (p.progressLoading) status = text("Checking your saved progress…", "සුරැකි ප්‍රගතිය පරීක්ෂා කරමින්…");
  else if (p.progressError) status = text("Your saved progress could not be refreshed. Please retry.", "සුරැකි ප්‍රගතිය නැවත ලබා ගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
  else if (isNextLevelUnlocked) status = text("Level 4 is unlocked. Your next adventure is ready!", "හතරවන මට්ටම විවෘතයි. ඊළඟ වික්‍රමය සූදානම්!");
  else status = text("Level 4 is locked. Complete all four Level 3 games with at least 3 out of 5 to unlock it.", "හතරවන මට්ටම අගුළු දමා ඇත. එය විවෘත කිරීමට තෙවන මට්ටමේ ක්‍රීඩා හතරම 5 න් 3 ක් ලබා සම්පූර්ණ කරන්න.");

  return <>
    <DashboardBunny happy si={si} message={text(isComplete ? "Well done! What an adventure!" : "Every step helps you grow!", isComplete ? "හොඳයි! අපූරු වික්‍රමයක්!" : "සෑම පියවරක්ම ඔබට උපකාරී වේ!")} />
    <MemoryBoard className="lx-level-one-dashboard lx-level-one-completion lx-pattern-reference-board lx-pattern-result" data-testid="level-three-completion">
      <header className="lx-pattern-result-heading"><img src={`${ART}/feedback/trophy.webp`} alt="" /><div><h1>{text(isComplete ? "Level 3 Complete!" : "Level 3 Progress", isComplete ? "මට්ටම 3 සම්පූර්ණයි!" : "මට්ටම 3 ප්‍රගතිය")}</h1><p>{text("Your saved journey across all four games", "ක්‍රීඩා හතරේම සුරැකි ප්‍රගතිය")}</p></div></header>
      <section className="lx-level-one-overview">
        <div className="lx-level-one-total"><img src={`${ART}/feedback/star.webp`} alt="" /><div><span>{text("Total Level 3 stars", "මට්ටම 3 මුළු තරු")}</span><strong data-testid="level-three-total-stars">{starsValue(totalLevelStars)}</strong></div></div>
        <div className="lx-level-one-progress"><span>{text("Overall progress", "සමස්ත ප්‍රගතිය")}</span><strong>{completedCount} / {CATEGORIES.length} {text("games complete", "ක්‍රීඩා සම්පූර්ණයි")}</strong><div role="progressbar" aria-label={text("Level 3 completion", "මට්ටම 3 සම්පූර්ණ කිරීම")} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-valuenow={completedCount}><i style={{ width: `${completedCount / CATEGORIES.length * 100}%` }} /></div></div>
      </section>
      <div className="lx-level-one-category-results">{CATEGORIES.map(category => {
        const { key, en, si: sinhala, Icon } = category;
        const saved = recordedCategories.find(category => category.subCategoryKey === key);
        return <section key={key} data-category={key} className={`lx-level-one-category ${saved?.isCompleted ? "is-complete" : ""}`}>
          <Icon className="lx-level-one-category-icon" aria-hidden="true" /><div><h2>{text(en, sinhala)}</h2><p>{text(saved?.isCompleted ? "Complete" : saved?.isUnlocked ? "Ready to practise" : "Locked", saved?.isCompleted ? "සම්පූර්ණයි" : saved?.isUnlocked ? "පුහුණුවට සූදානම්" : "අගුළු දමා ඇත")}</p></div><strong><img src={`${ART}/feedback/star.webp`} alt={text("Recorded stars", "සුරැකි තරු")} /><span>{starsValue(recordedStars[key])}</span></strong>
        </section>;
      })}</div>
      <div className="lx-level-one-completion-status" role="status"><p>{!isNextLevelUnlocked && <LockKeyhole aria-hidden="true" />}{status}</p>{p.historyLoading && <small>{text("Loading recorded stars…", "සුරැකි තරු ලබා ගනිමින්…")}</small>}{p.historyError && <small>{text("Recorded stars could not be loaded.", "සුරැකි තරු ලබා ගැනීමට නොහැකි විය.")} <button type="button" onClick={p.handleRetryLevelHistory}>{text("Retry loading stars", "තරු නැවත ලබා ගන්න")}</button></small>}{p.progressError && <button type="button" onClick={p.handleRetryProgress}>{text("Refresh progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</div>
      <div className="lx-pattern-result-actions"><MemoryButton variant="secondary" className="lx-pattern-retry" onClick={p.handleBackToLevels}>{text("Back to Games", "ක්‍රීඩා වෙත යන්න")}</MemoryButton><MemoryButton className="lx-pattern-continue" onClick={p.handleContinueLevel} disabled={!isNextLevelUnlocked || p.progressLoading}>{text("Next Level", "ඊළඟ මට්ටම")}<ArrowRight aria-hidden="true" /></MemoryButton></div>
    </MemoryBoard>
  </>;
}
return { ActivityResults: LevelThreeResultDashboard, LevelCompletion: LevelThreeCompletionDashboard };
})();

const level4 = (() => {
const ART = "/images/workingMemory/shared";

const CATEGORIES = [
  { key: "pattern", en: "Pattern Recognition", si: "රටා හඳුනාගැනීම", Icon: Shapes },
  { key: "words", en: "Picture Memory", si: "පින්තූර මතකය", Icon: Images },
  { key: "instructions", en: "Following Instructions", si: "උපදෙස් අනුගමනය", Icon: ListOrdered },
  { key: "numbers", en: "Number Recall", si: "අංක මතකය", Icon: Hash },
];

function DashboardBunny({ happy, message, si }) {
  return <>
    <img className="lx-pattern-result-bunny lx-level-one-result-bunny" src={`${ART}/bunny/bunny-${happy ? "happy" : "sad"}.webp`} alt={si ? happy ? "සතුටු හාවා" : "දිරිගන්වන හාවා" : happy ? "Happy bunny" : "Encouraging bunny"} />
    <aside className="lx-pattern-speech lx-level-one-result-speech">{message}</aside>
  </>;
}

function savedLevelFor(p) {
  const progress = p.savedProgress || p.submitResult?.progress;
  return progress?.levelsProgress?.find(level => Number(level.levelNumber) === 4);
}

function LevelFourResultDashboard({ p, title, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const totalQuestions = p.questions?.length || 5;
  // Keep the original Pattern dashboard expression at exactly 3/5: happy.
  // This expression is independent of saved completion and unlock status.
  const happyExpression = p.score >= 3;
  const canContinueAttempt = p.score >= 3 && !p.isSubmitting && Boolean(p.submitResult);
  const savedLevel = savedLevelFor(p);
  const currentSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === p.subCategoryKey);
  const nextCategory = CATEGORIES[CATEGORIES.findIndex(category => category.key === p.subCategoryKey) + 1];
  const nextSaved = savedLevel?.subCategories?.find(category => category.subCategoryKey === nextCategory?.key);
  const isLastGame = p.subCategoryKey === "numbers";
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const categoryStars = recordsAvailable ? p.levelHistory.filter(attempt => Number(attempt.levelNumber) === 4 && attempt.subCategoryKey === p.subCategoryKey).reduce((total, attempt) => { const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned); return total + (Number.isFinite(stars) && stars >= 0 ? stars : 0); }, 0) : null;
  const earnedStars = p.submitResult?.starsEarned ?? p.submitResult?.carrotsEarned ?? p.earnedStars;
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
    ? text("Progress saved. All four Level 4 games are complete!", "ප්‍රගතිය සුරැකී ඇත. හතරවන මට්ටමේ ක්‍රීඩා හතරම සම්පූර්ණයි!")
    : text("Progress saved. Visit the game menu to finish the remaining activities.", "ප්‍රගතිය සුරැකී ඇත. ඉතිරි ක්‍රියාකාරකම් සම්පූර්ණ කිරීමට ක්‍රීඩා මෙනුව වෙත යන්න.");
  else status = nextSaved?.isUnlocked
    ? text("Progress saved. The next game is unlocked!", "ප්‍රගතිය සුරැකී ඇත. ඊළඟ ක්‍රීඩාව විවෘතයි!")
    : text("You reached the 3 out of 5 pass mark. Your result is saved.", "ඔබ 5 න් 3 සමත් ලකුණ ලබා ඇත. ප්‍රතිඵල සුරැකී ඇත.");

  return <>
    <DashboardBunny happy={happyExpression} si={si} message={text(happyExpression ? "Well done!" : "Good try! Let's keep learning.", happyExpression ? "හොඳයි!" : "හොඳ උත්සාහයක්! දිගටම ඉගෙන ගනිමු.")} />
    <MemoryBoard className={`lx-level-one-dashboard lx-pattern-reference-board lx-pattern-result ${happyExpression ? "is-celebrating" : "is-encouraging"}`} data-testid="level-four-results" data-game={p.subCategoryKey}>
      <header className="lx-pattern-result-heading">
        {happyExpression && <img src={`${ART}/feedback/trophy.webp`} alt="" />}
        <div><h1>{text(happyExpression ? "Great Job!" : "Keep Going!", happyExpression ? "හොඳයි!" : "දිගටම උත්සාහ කරමු!")}</h1><p>{title} · {text("Level 4", "මට්ටම 4")}</p></div>
      </header>
      <section className="lx-pattern-score" aria-label={text(`Your score: ${p.score} out of ${totalQuestions}`, `ඔබේ ලකුණු: ${totalQuestions} න් ${p.score}`)}>
        <div><span>{text("YOUR SCORE", "ඔබේ ලකුණු")}</span><strong data-testid="level-four-score">{p.score} / {totalQuestions}</strong></div>
        <div className="lx-pattern-stars" aria-hidden="true">{Array.from({ length: totalQuestions }, (_, index) => <img key={index} className={index < p.score ? "is-earned" : ""} src={`${ART}/feedback/star.webp`} alt="" />)}</div>
      </section>
      <div className="lx-pattern-statistics">
        <section className="is-correct"><span className="lx-pattern-stat-icon"><Check aria-hidden="true" /></span><span>{text("Correct", "නිවැරදි")}</span><strong>{p.score}</strong></section>
        <section className="is-incorrect"><span className="lx-pattern-stat-icon"><X aria-hidden="true" /></span><span>{text("Incorrect", "වැරදි")}</span><strong>{totalQuestions - p.score}</strong></section>
        <section className="is-stars"><img src={`${ART}/feedback/star.webp`} alt="" /><span>{text("Stars Earned", "ලැබුණු තරු")}</span><strong data-testid="level-four-earned-stars">{earnedStars}</strong></section>
      </div>
      <p className="lx-pattern-save-status" role="status"><span>{status}</span><small className="lx-category-record">{recordsAvailable ? text(`Recorded stars in this game: ${categoryStars}`, `\u0db8\u0dd9\u0db8 \u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf\u0dc0\u0dda \u0dc3\u0dd4\u0dbb\u0dd0\u0d9a\u0dd2 \u0dad\u0dbb\u0dd4: ${categoryStars}`) : p.historyLoading ? text("Loading recorded stars...", "\u0dad\u0dbb\u0dd4 \u0dbd\u0db6\u0dcf \u0d9c\u0db1\u0dd2\u0db8\u0dd2\u0db1\u0dca...") : text("Recorded stars unavailable", "\u0dc3\u0dd4\u0dbb\u0dd0\u0d9a\u0dd2 \u0dad\u0dbb\u0dd4 \u0dbd\u0db6\u0dcf \u0d9c\u0dad \u0db1\u0ddc\u0dc4\u0dd0\u0d9a.")}</small>{p.historyError && <button type="button" onClick={p.handleRetryLevelHistory}>{text("Refresh recorded stars", "\u0dad\u0dbb\u0dd4 \u0db1\u0dd0\u0dc0\u0dad \u0dbd\u0db6\u0dcf \u0d9c\u0db1\u0dca\u0db1")}</button>}{p.progressError && p.submitResult && !p.submissionError && <button type="button" disabled={p.progressLoading} onClick={p.handleRetryProgress}>{text("Refresh Progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</p>
      <div className="lx-pattern-result-actions">
        <MemoryButton variant="secondary" className="lx-pattern-retry" disabled={p.isSubmitting} onClick={p.startQuiz}><RotateCcw aria-hidden="true" />{text("Play Again", "නැවත ක්‍රීඩා කරන්න")}</MemoryButton>
        <MemoryButton className="lx-pattern-continue" disabled={p.submissionError ? p.isSubmitting : !canContinueAttempt} onClick={p.submissionError ? p.handleRetrySave : p.handleNextSubCategory}>{p.submissionError ? text("Retry Saving", "නැවත සුරකින්න") : continuation}<ArrowRight aria-hidden="true" /></MemoryButton>
      </div>
    </MemoryBoard>
  </>;
}

function LevelFourCompletionDashboard({ p, si = false }) {
  const text = (en, sinhala) => si ? sinhala : en;
  const savedLevel = savedLevelFor(p);
  const recordedCategories = savedLevel?.subCategories || [];
  const completedCount = CATEGORIES.filter(category => recordedCategories.some(saved => saved.subCategoryKey === category.key && saved.isCompleted)).length;
  const isComplete = Boolean(savedLevel?.isCompleted) && completedCount === CATEGORIES.length;
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const recordedStars = Object.fromEntries(CATEGORIES.map(category => [category.key, 0]));
  if (recordsAvailable) {
    for (const attempt of p.levelHistory) {
      if (Number(attempt.levelNumber) !== 4 || !Object.hasOwn(recordedStars, attempt.subCategoryKey)) continue;
      const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned);
      if (Number.isFinite(stars) && stars >= 0) recordedStars[attempt.subCategoryKey] += stars;
    }
  }
  const totalLevelStars = Object.values(recordedStars).reduce((total, stars) => total + stars, 0);
  const starsValue = value => recordsAvailable ? value : "—";

  let status;
  if (p.progressLoading) status = text("Checking your saved progress…", "සුරැකි ප්‍රගතිය පරීක්ෂා කරමින්…");
  else if (p.progressError) status = text("Your saved progress could not be refreshed. Please retry.", "සුරැකි ප්‍රගතිය නැවත ලබා ගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
  else status = text(isComplete ? "All four Level 4 games are complete. Well done!" : "Complete all four games with at least 3 out of 5 to finish Level 4.", isComplete ? "\u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf \u0dc4\u0dad\u0dbb\u0db8 \u0dc3\u0db8\u0dca\u0db4\u0dd6\u0dbb\u0dca\u0dab\u0dba\u0dd2!" : "\u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf \u0dc4\u0dad\u0dbb\u0db8 5 \u0db1\u0dca 3 \u0d9a\u0dca \u0dbd\u0db6\u0dcf \u0dc3\u0db8\u0dca\u0db4\u0dd6\u0dbb\u0dca\u0dab \u0d9a\u0dbb\u0db1\u0dca\u0db1.");

  return <>
    <DashboardBunny happy si={si} message={text(isComplete ? "Well done! What an adventure!" : "Every step helps you grow!", isComplete ? "හොඳයි! අපූරු වික්‍රමයක්!" : "සෑම පියවරක්ම ඔබට උපකාරී වේ!")} />
    <MemoryBoard className="lx-level-one-dashboard lx-level-one-completion lx-pattern-reference-board lx-pattern-result" data-testid="level-four-completion">
      <header className="lx-pattern-result-heading"><img src={`${ART}/feedback/trophy.webp`} alt="" /><div><h1>{text(isComplete ? "Level 4 Complete!" : "Level 4 Progress", isComplete ? "මට්ටම 4 සම්පූර්ණයි!" : "මට්ටම 4 ප්‍රගතිය")}</h1><p>{text("Your saved journey across all four games", "ක්‍රීඩා හතරේම සුරැකි ප්‍රගතිය")}</p></div></header>
      <section className="lx-level-one-overview">
        <div className="lx-level-one-total"><img src={`${ART}/feedback/star.webp`} alt="" /><div><span>{text("Total Level 4 stars", "මට්ටම 4 මුළු තරු")}</span><strong data-testid="level-four-total-stars">{starsValue(totalLevelStars)}</strong></div></div>
        <div className="lx-level-one-progress"><span>{text("Overall progress", "සමස්ත ප්‍රගතිය")}</span><strong>{completedCount} / {CATEGORIES.length} {text("games complete", "ක්‍රීඩා සම්පූර්ණයි")}</strong><div role="progressbar" aria-label={text("Level 4 completion", "මට්ටම 4 සම්පූර්ණ කිරීම")} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-valuenow={completedCount}><i style={{ width: `${completedCount / CATEGORIES.length * 100}%` }} /></div></div>
      </section>
      <div className="lx-level-one-category-results">{CATEGORIES.map(category => {
        const { key, en, si: sinhala, Icon } = category;
        const saved = recordedCategories.find(category => category.subCategoryKey === key);
        return <section key={key} data-category={key} className={`lx-level-one-category ${saved?.isCompleted ? "is-complete" : ""}`}>
          <Icon className="lx-level-one-category-icon" aria-hidden="true" /><div><h2>{text(en, sinhala)}</h2><p>{text(saved?.isCompleted ? "Complete" : saved?.isUnlocked ? "Ready to practise" : "Locked", saved?.isCompleted ? "සම්පූර්ණයි" : saved?.isUnlocked ? "පුහුණුවට සූදානම්" : "අගුළු දමා ඇත")}</p></div><strong><img src={`${ART}/feedback/star.webp`} alt={text("Recorded stars", "සුරැකි තරු")} /><span>{starsValue(recordedStars[key])}</span></strong>
        </section>;
      })}</div>
      <div className="lx-level-one-completion-status" role="status"><p>{status}</p>{p.historyLoading && <small>{text("Loading recorded stars…", "සුරැකි තරු ලබා ගනිමින්…")}</small>}{p.historyError && <small>{text("Recorded stars could not be loaded.", "සුරැකි තරු ලබා ගැනීමට නොහැකි විය.")} <button type="button" onClick={p.handleRetryLevelHistory}>{text("Retry loading stars", "තරු නැවත ලබා ගන්න")}</button></small>}{p.progressError && <button type="button" onClick={p.handleRetryProgress}>{text("Refresh progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</div>
      <div className="lx-pattern-result-actions lx-final-actions"><MemoryButton className="lx-pattern-continue" onClick={p.handleBackToLevels}>{text("Back to Levels", "\u0db8\u0da7\u0dca\u0da7\u0db8\u0dca \u0dc0\u0dd9\u0dad")}</MemoryButton></div>
    </MemoryBoard>
  </>;
}
return { ActivityResults: LevelFourResultDashboard, LevelCompletion: LevelFourCompletionDashboard };
})();

export const ORIGINAL_DASHBOARDS = { 1:level1, 2:level2, 3:level3, 4:level4 };
