/**
 * Pure scoring logic for Improvement game questions, extracted from
 * ImprovementActivityWM.jsx's handleDragSubmit/handleTileClick so it can be
 * unit tested against every question in IMPROVEMENT_DATA without rendering
 * the UI or requiring level unlocks.
 */

const normalizeNumberSequence = (sequence) =>
  (Array.isArray(sequence) ? sequence : [sequence]).map((value) => String(value));

// subCategoryKey: "words" | "instructions" | "numbers" (drag-and-drop games)
export const evaluateDragAnswer = (subCategoryKey, slots, question) => {
  if (subCategoryKey === "instructions") {
    return slots[0] === question.correct;
  }
  if (subCategoryKey === "numbers") {
    return JSON.stringify(normalizeNumberSequence(slots)) === JSON.stringify(normalizeNumberSequence(question.correct));
  }
  const key = item => item && typeof item === "object" ? item.id : item;
  const actual = slots.map(key);
  const expected = (question.correct || []).map(key);
  return actual.length === expected.length && actual.every(Boolean)
    && new Set(actual).size === actual.length
    && actual.every((id, index) => id === expected[index]);
};

// subCategoryKey: "pattern" (single-tap game)
export const evaluatePatternAnswer = (question, tappedValue) => tappedValue === question.missingAnswer;
