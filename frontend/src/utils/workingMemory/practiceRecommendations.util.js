export const SCREENING_CATEGORIES = Object.freeze([
  { category: "Pattern", key: "pattern", label: "screen_pattern_memory" },
  { category: "Picture Memory", key: "words", label: "screen_picture_memory" },
  { category: "Instruction", key: "instructions", label: "screen_instructions" },
  { category: "Number Memory", key: "numbers", label: "screen_number_memory" },
]);

// Missing correctness data is unknown, not an invented mistake. Recorded skips
// and timeouts already have isCorrect:false under the assessment scoring rules.
export function getPracticeRecommendations(responses) {
  const summary = SCREENING_CATEGORIES.map((item, order) => ({ ...item, order, total: 0, incorrect: 0 }));
  for (const response of responses || []) {
    const group = summary.find(item => item.category === response.category);
    if (!group || typeof response.isCorrect !== "boolean") continue;
    group.total++;
    if (!response.isCorrect) group.incorrect++;
  }
  return {
    hasData: summary.some(item => item.total > 0),
    categories: summary.filter(item => item.incorrect > 0).sort((a, b) =>
      b.incorrect - a.incorrect || b.incorrect / b.total - a.incorrect / a.total || a.order - b.order),
  };
}

export function getPracticeLevel(progress, key) {
  if (!progress?.isIdentificationCompleted) return null;
  const levels = (progress.levelsProgress || []).filter(level =>
    level.levelNumber <= progress.maxUnlockedLevel &&
    level.subCategories?.some(item => item.subCategoryKey === key && item.isUnlocked));
  // Prefer the first unfinished accessible activity, then the highest accessible
  // level for replay. Never bypass the existing sequential category locks.
  return levels.find(level => level.subCategories.some(item => item.subCategoryKey === key && !item.isCompleted))?.levelNumber
    ?? levels.at(-1)?.levelNumber ?? null;
}
