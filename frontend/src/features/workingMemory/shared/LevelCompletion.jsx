import { ArrowRight, Hash, Images, ListOrdered, LockKeyhole, Shapes } from "lucide-react";
import { MemoryBoard, MemoryButton, DashboardBunny } from "./GameLayout";
import { GAME_CATEGORIES as CATEGORIES, DASHBOARD_CONTENT } from "../config/gameConfig";
import { getSavedLevel } from "../logic/progression";
import "../styles/patternReference.css";
import "../styles/levelOneDashboard.css";
const CATEGORY_ICONS = { Hash, Images, ListOrdered, Shapes };
const ART = "/images/workingMemory/shared";

export default function LevelCompletion({ p, si = false }) {
  const level = Number(p.levelNumber);
  const isFinal = level === 4;
  const messages = DASHBOARD_CONTENT[level];
  const text = (en, sinhala) => si ? sinhala : en;
  const progress = p.savedProgress || p.submitResult?.progress;
  const savedLevel = getSavedLevel(p.savedProgress || p.submitResult?.progress, level);
  const recordedCategories = savedLevel?.subCategories || [];
  const completedCount = CATEGORIES.filter(category => recordedCategories.some(saved => saved.subCategoryKey === category.key && saved.isCompleted)).length;
  const isComplete = Boolean(savedLevel?.isCompleted) && completedCount === CATEGORIES.length;
  const nextLevel = progress?.levelsProgress?.find(saved => Number(saved.levelNumber) === level + 1);
  const nextPattern = nextLevel?.subCategories?.find(category => category.subCategoryKey === "pattern");
  const isNextLevelUnlocked = Number(progress?.maxUnlockedLevel) >= level + 1 && Boolean(nextPattern?.isUnlocked);
  const recordsAvailable = Array.isArray(p.levelHistory) && !p.historyLoading && !p.historyError;
  const recordedStars = Object.fromEntries(CATEGORIES.map(category => [category.key, 0]));
  if (recordsAvailable) {
    for (const attempt of p.levelHistory) {
      if (Number(attempt.levelNumber) !== level || !Object.hasOwn(recordedStars, attempt.subCategoryKey)) continue;
      const stars = Number(attempt.starsEarned ?? attempt.carrotsEarned);
      if (Number.isFinite(stars) && stars >= 0) recordedStars[attempt.subCategoryKey] += stars;
    }
  }
  const totalLevelStars = Object.values(recordedStars).reduce((total, stars) => total + stars, 0);
  const starsValue = value => recordsAvailable ? value : "—";

  let status;
  if (p.progressLoading) status = text("Checking your saved progress…", "සුරැකි ප්‍රගතිය පරීක්ෂා කරමින්…");
  else if (p.progressError) status = text("Your saved progress could not be refreshed. Please retry.", "සුරැකි ප්‍රගතිය නැවත ලබා ගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
  else if (isFinal) status = text(isComplete ? "All four Level 4 games are complete. Well done!" : "Complete all four games with at least 3 out of 5 to finish Level 4.", isComplete ? "\u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf \u0dc4\u0dad\u0dbb\u0db8 \u0dc3\u0db8\u0dca\u0db4\u0dd6\u0dbb\u0dca\u0dab\u0dba\u0dd2!" : "\u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf \u0dc4\u0dad\u0dbb\u0db8 5 \u0db1\u0dca 3 \u0d9a\u0dca \u0dbd\u0db6\u0dcf \u0dc3\u0db8\u0dca\u0db4\u0dd6\u0dbb\u0dca\u0dab \u0d9a\u0dbb\u0db1\u0dca\u0db1.");
  else if (isNextLevelUnlocked) status = text(messages.nextUnlocked.en, messages.nextUnlocked.si);
  else status = text(messages.nextLocked.en, messages.nextLocked.si);

  return <>
    <DashboardBunny happy si={si} message={text(isComplete ? "Well done! What an adventure!" : "Every step helps you grow!", isComplete ? "හොඳයි! අපූරු වික්‍රමයක්!" : "සෑම පියවරක්ම ඔබට උපකාරී වේ!")} />
    <MemoryBoard className="lx-level-one-dashboard lx-level-one-completion lx-pattern-reference-board lx-pattern-result" data-testid={messages.ids.completion}>
      <header className="lx-pattern-result-heading"><img src={`${ART}/feedback/trophy.webp`} alt="" /><div><h1>{text(isComplete ? messages.completionTitle.en : messages.progressTitle.en, isComplete ? messages.completionTitle.si : messages.progressTitle.si)}</h1><p>{text("Your saved journey across all four games", "ක්‍රීඩා හතරේම සුරැකි ප්‍රගතිය")}</p></div></header>
      <section className="lx-level-one-overview">
        <div className="lx-level-one-total"><img src={`${ART}/feedback/star.webp`} alt="" /><div><span>{text(messages.totalStarsLabel.en, messages.totalStarsLabel.si)}</span><strong data-testid={messages.ids.totalStars}>{starsValue(totalLevelStars)}</strong></div></div>
        <div className="lx-level-one-progress"><span>{text("Overall progress", "සමස්ත ප්‍රගතිය")}</span><strong>{completedCount} / {CATEGORIES.length} {text("games complete", "ක්‍රීඩා සම්පූර්ණයි")}</strong><div role="progressbar" aria-label={text(messages.completionLabel.en, messages.completionLabel.si)} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-valuenow={completedCount}><i style={{ width: `${completedCount / CATEGORIES.length * 100}%` }} /></div></div>
      </section>
      <div className="lx-level-one-category-results">{CATEGORIES.map(category => {
        const { key, en, si: sinhala, icon } = category;
        const Icon = CATEGORY_ICONS[icon];
        const saved = recordedCategories.find(category => category.subCategoryKey === key);
        return <section key={key} data-category={key} className={`lx-level-one-category ${saved?.isCompleted ? "is-complete" : ""}`}>
          <Icon className="lx-level-one-category-icon" aria-hidden="true" /><div><h2>{text(isFinal && key === "numbers" ? "Number Recall" : en, sinhala)}</h2><p>{text(saved?.isCompleted ? "Complete" : saved?.isUnlocked ? "Ready to practise" : "Locked", saved?.isCompleted ? "සම්පූර්ණයි" : saved?.isUnlocked ? "පුහුණුවට සූදානම්" : "අගුළු දමා ඇත")}</p></div><strong><img src={`${ART}/feedback/star.webp`} alt={text("Recorded stars", "සුරැකි තරු")} /><span>{starsValue(recordedStars[key])}</span></strong>
        </section>;
      })}</div>
      <div className="lx-level-one-completion-status" role="status"><p>{!isFinal && !isNextLevelUnlocked && <LockKeyhole aria-hidden="true" />}{status}</p>{p.historyLoading && <small>{text("Loading recorded stars…", "සුරැකි තරු ලබා ගනිමින්…")}</small>}{p.historyError && <small>{text("Recorded stars could not be loaded.", "සුරැකි තරු ලබා ගැනීමට නොහැකි විය.")} <button type="button" onClick={p.handleRetryLevelHistory}>{text("Retry loading stars", "තරු නැවත ලබා ගන්න")}</button></small>}{p.progressError && <button type="button" onClick={p.handleRetryProgress}>{text("Refresh progress", "ප්‍රගතිය නැවත ලබා ගන්න")}</button>}</div>
      {isFinal ? <div className="lx-pattern-result-actions lx-final-actions"><MemoryButton className="lx-pattern-continue" onClick={p.handleBackToLevels}>{text("Back to Levels", "\u0db8\u0da7\u0dca\u0da7\u0db8\u0dca \u0dc0\u0dd9\u0dad")}</MemoryButton></div> : <div className="lx-pattern-result-actions"><MemoryButton variant="secondary" className="lx-pattern-retry" onClick={p.handleBackToLevels}>{text("Back to Games", "ක්‍රීඩා වෙත යන්න")}</MemoryButton><MemoryButton className="lx-pattern-continue" onClick={p.handleContinueLevel} disabled={!isNextLevelUnlocked || p.progressLoading}>{text("Next Level", "ඊළඟ මට්ටම")}<ArrowRight aria-hidden="true" /></MemoryButton></div>}
    </MemoryBoard>
  </>;
}
