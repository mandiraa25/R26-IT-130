// Read-only helpers: saved progress, question pick, practice suggestions.
// Unlock/completion rules live on the backend — this file does not unlock games.

import { shuffleArray } from "./presentation";

// Find one level in saved progress
export const getSavedLevel = (progress, levelNumber) =>
  progress?.levelsProgress?.find(level => Number(level.levelNumber) === Number(levelNumber));

// Prefer totalStars; fall back to legacy totalCarrots
export const readTotalStars = payload =>
  Math.max(0, Number(payload?.totalStars ?? payload?.totalCarrots) || 0);

// Pick up to 5 questions; prefer ones not in the last attempt
export function selectAttemptQuestions(pool, previousIds = []) {
  const seen = new Set(previousIds);
  const fresh = shuffleArray(pool.filter(q => !seen.has(q.id)));
  const repeated = shuffleArray(pool.filter(q => seen.has(q.id)));
  let selected = [...fresh, ...repeated].slice(0, 5);
  if (selected.length > 1 && selected.every((q, i) => q.id === previousIds[i])) {
    selected = [...selected.slice(1), selected[0]];
  }
  return selected;
}

// Screening category → improvement game key
export const SCREENING_CATEGORIES = Object.freeze([
  { category: "Pattern", key: "pattern", label: "screen_pattern_memory" },
  { category: "Picture Memory", key: "words", label: "screen_picture_memory" },
  { category: "Instruction", key: "instructions", label: "screen_instructions" },
  { category: "Number Memory", key: "numbers", label: "screen_number_memory" },
]);

// Rank weak categories for practice tips (does not unlock anything)
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
