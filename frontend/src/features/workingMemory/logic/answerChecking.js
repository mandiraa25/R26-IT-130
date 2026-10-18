/**
 * Pure scoring logic for one Identify quiz question, extracted from
 * Identify.jsx's handleSubmit so it can be unit tested against every
 * question in QUIZ_DATA without rendering the UI.
 */
export const evaluateIdentifyAnswer = (q, userAnswer) => {
  let isCorrect = false;
  let errorType = "incorrect";

  if (q.type === "SEQUENCE_MEMORY") {
    if (q.options) {
      isCorrect = String(userAnswer).trim() === String(q.correct).trim();
      errorType = isCorrect ? "correct" : "incorrect";
    } else {
      const correct = q.sequence.map(String);
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correct);
      errorType = analyzeSequenceError(correct, userAnswer.join(""));
    }
  }

  if (q.type === "PICTURE_MEMORY") {
    if (q.options) {
      isCorrect = String(userAnswer).trim() === String(q.correct).trim();
      errorType = isCorrect ? "correct" : "wrong_order";
    } else {
      const correct = q.words;
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correct);
      errorType = isCorrect ? "correct" : "wrong_order";
    }
  }

  if (q.category === "Instruction") {
    const answer = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
    isCorrect = String(answer).trim() === String(q.correct).trim();
    errorType = isCorrect ? "correct" : "wrong_order";
  }

  if (q.category === "Pattern") {
    isCorrect = String(userAnswer).trim() === String(q.correct).trim();
    errorType = isCorrect ? "correct" : "guess";
  }

  return { isCorrect, errorType };
};


// Improvement answer checking stays separate from screening evaluation.

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

// ---------------------------------------------------------------------------
// Sequence error type (correct / partial_recall / wrong_order / skipped / incorrect)
// ---------------------------------------------------------------------------
export const analyzeSequenceError = (correctSeq, userInput) => {
  const correct = correctSeq.join("");
  
  if (userInput === correct) return "correct";

  // Partial match
  let correctCount = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === correct[i]) correctCount++;
  }

  if (correctCount > 0 && correctCount < correct.length) {
    return "partial_recall";
  }

  // Same numbers but wrong order
  const sortedCorrect = [...correct].sort().join("");
  const sortedUser = [...userInput].sort().join("");

  if (sortedCorrect === sortedUser) {
    return "wrong_order";
  }

  if (userInput.length < correct.length) {
    return "skipped";
  }

  return "incorrect";
};
