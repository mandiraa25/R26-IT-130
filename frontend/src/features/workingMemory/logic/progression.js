/*
 * FILE PURPOSE
 * Read-only saved-progress helpers, attempt question selection and screening practice recommendations.
 *
 * HOW IT CONNECTS
 * ImprovementPage selects questions and reads stars; ActivityResults/LevelCompletion read saved
 * levels; ScreeningResults asks for practice recommendations.
 * Direct source importers: ../improvement/ImprovementPage.jsx, ../shared/ActivityResults.jsx,
 * ../shared/LevelCompletion.jsx, ../shared/ScreeningResults.jsx.
 * Local feature/style dependencies: presentation.js.
 *
 * THINGS TO REMEMBER
 * Selection prefers IDs absent from the previous attempt and takes at most five. Recommendations rank
 * category mistakes; they do not unlock games. totalCarrots is a legacy fallback for stars. Actual
 * progression writes belong to the backend controller.
 */

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
/*
 * FUNCTION: getSavedLevel - find one level in the saved progress response.
 * Result views call this with a route/display level; numeric conversion tolerates URL strings.
 * It returns an existing record or undefined and never unlocks or edits anything.
 */
export const getSavedLevel = (progress, levelNumber) =>
  progress?.levelsProgress?.find(level => Number(level.levelNumber) === Number(levelNumber));

/*
 * FUNCTION: readTotalStars - read a nonnegative total from API/cache data.
 * Prefers totalStars and falls back to legacy totalCarrots; this is one reward total,
 * not two currencies to add together. Invalid or absent values display as zero.
 */
export const readTotalStars = payload =>
  Math.max(0, Number(payload?.totalStars ?? payload?.totalCarrots) || 0);

// ---------------------------------------------------------------------------
// Question selection for an attempt
// ---------------------------------------------------------------------------
// Prefer unseen questions if a pool grows beyond five; keep each grade's pool intact.
/*
 * FUNCTION: selectAttemptQuestions
 * Choose at most five questions while preferring ones not in the previous attempt.
 * WHEN: ImprovementPage bank setup/startQuiz calls this.
 * HOW / RESULT: Shuffles fresh and repeated groups, then avoids identical order when possible. Small
 * five-question pools still repeat the same question set.
 */
export function selectAttemptQuestions(pool, previousIds = []) {
  // VIVA: Prefer questions absent from the immediately previous attempt, then
  // fill from repeats up to five. Small pools cannot guarantee unseen questions.
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
/*
 * DATA: Connect stored screening category names to improvement game keys and UI labels.
 * The words key is Picture Memory. Category labels are translated later by the view.
 */
export const SCREENING_CATEGORIES = Object.freeze([
  { category: "Pattern", key: "pattern", label: "screen_pattern_memory" },
  { category: "Picture Memory", key: "words", label: "screen_picture_memory" },
  { category: "Instruction", key: "instructions", label: "screen_instructions" },
  { category: "Number Memory", key: "numbers", label: "screen_number_memory" },
]);

// Missing correctness data is unknown, not an invented mistake. Recorded skips
// and timeouts already have isCorrect:false under the assessment scoring rules.
/*
 * FUNCTION: getPracticeRecommendations
 * Rank screening categories with recorded mistakes for suggested practice.
 * WHEN: RecommendedPractice calls this on the screening results screen.
 * HOW / RESULT: Counts boolean correctness only; sorts by mistake count, then error rate, then
 * category order. It never changes locks or saved progress.
 */
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
