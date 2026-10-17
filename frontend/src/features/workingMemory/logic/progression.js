/*
 * Working Memory: progress, question selection and practice recommendations
 *
 * What is inside
 *   - getSavedLevel, readTotalStars: read saved progress and stars from the API.
 *   - selectAttemptQuestions: picks the 5 questions for an attempt, preferring
 *     ones the child has not just seen.
 *   - SCREENING_CATEGORIES, getPracticeRecommendations: after screening, ranks
 *     the games the child should practise from their mistakes.
 *
 * Why it is here
 *   These helpers decide what the child sees next. They never change unlock,
 *   reward or completion rules, which the backend applies.
 *
 * Where it is used
 *   - improvement/ImprovementPage.jsx  getSavedLevel, readTotalStars, selectAttemptQuestions
 *   - shared/ActivityResults.jsx, shared/LevelCompletion.jsx  getSavedLevel, readTotalStars
 *   - shared/ScreeningResults.jsx      getPracticeRecommendations
 *   - tests/unit/practiceRecommendations.test.js
 */
import { shuffleArray } from "./presentation";

// ---------------------------------------------------------------------------
// Saved progress
// ---------------------------------------------------------------------------
// Read saved progress without changing any unlock, reward or completion rules.
export const getSavedLevel = (progress, levelNumber) =>
  progress?.levelsProgress?.find(level => Number(level.levelNumber) === Number(levelNumber));

export const readTotalStars = payload =>
  Math.max(0, Number(payload?.totalStars ?? payload?.totalCarrots) || 0);

// ---------------------------------------------------------------------------
// Question selection for an attempt
// ---------------------------------------------------------------------------
// Prefer unseen questions if a pool grows beyond five; keep each grade's pool intact.
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

// ---------------------------------------------------------------------------
// Practice recommendations after screening
// ---------------------------------------------------------------------------
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
