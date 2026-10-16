import { shuffleArray } from "./helpers";

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
