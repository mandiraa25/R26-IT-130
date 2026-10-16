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
  return JSON.stringify(slots) === JSON.stringify(question.correct);
};

// subCategoryKey: "pattern" (single-tap game)
export const evaluatePatternAnswer = (question, tappedValue) => tappedValue === question.missingAnswer;
