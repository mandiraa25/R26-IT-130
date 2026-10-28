/*
 * FILE PURPOSE
 * Pure answer checkers shared by screening and improvement controllers.
 *
 * HOW IT CONNECTS
 * ScreeningPage uses evaluateIdentifyAnswer; ImprovementPage uses evaluateDragAnswer and
 * evaluatePatternAnswer. scoring.js later consumes screening errorType values.
 * Direct source importers: ../identification/ScreeningPage.jsx, ../improvement/ImprovementPage.jsx.
 *
 * THINGS TO REMEMBER
 * Pure means the same input produces the same result without changing React state or saving data.
 * Screening distinguishes question types/categories. Improvement compares picture IDs and ordered
 * string digits. analyzeSequenceError checks partial positional matches before its wrong-order branch.
 */

/**
 * Pure scoring logic for one Identify quiz question, extracted from
 * Identify.jsx's handleSubmit so it can be unit tested against every
 * question in QUIZ_DATA without rendering the UI.
 */
/*
 * FUNCTION: evaluateIdentifyAnswer
 * Check one screening response and classify its error.
 * WHEN: ScreeningPage handleSubmit calls this.
 * HOW / RESULT: Uses type/category and authored correct/words/sequence fields; returns isCorrect and
 * errorType without state or API work.
 */
export const evaluateIdentifyAnswer = (q, userAnswer) => {
  // VIVA: A pure function returns correctness/error type from bank data. It has
  // no React state or API calls, so screening can reuse and test it independently.
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
/*
 * FUNCTION: evaluateDragAnswer
 * Check a Picture/Number recall sequence or retained instruction slot answer.
 * WHEN: ImprovementPage handleDragSubmit calls this.
 * HOW / RESULT: Numbers normalizes digits to strings; Pictures compares stable IDs in order and
 * rejects duplicate/missing IDs.
 */
export const evaluateDragAnswer = (subCategoryKey, slots, question) => {
  // VIVA: Number values normalize to strings; picture sequences compare stable
  // IDs in order and reject duplicates. Localized labels do not decide matches.
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
/*
 * FUNCTION: evaluatePatternAnswer
 * Compare the selected Pattern token with missingAnswer.
 * WHEN: ImprovementPage handlePatternAnswer calls this.
 * HOW / RESULT: Returns a boolean; the common evaluateAnswer handles timing, reward and feedback.
 */
export const evaluatePatternAnswer = (question, tappedValue) => tappedValue === question.missingAnswer;

// ---------------------------------------------------------------------------
// Sequence error type (correct / partial_recall / wrong_order / skipped / incorrect)
// ---------------------------------------------------------------------------
/*
 * FUNCTION: analyzeSequenceError
 * Classify an entered number sequence.
 * WHEN: The non-option screening number-answer path calls this.
 * HOW / RESULT: Checks exact recall, partial same-position matches, reordered digits, short input and
 * other errors in that order. Current option questions often use their simpler choice comparison.
 */
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
