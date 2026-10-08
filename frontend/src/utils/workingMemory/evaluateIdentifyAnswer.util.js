import { analyzeSequenceError } from "./errorAnalysis";

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

  if (q.type === "WORD_MEMORY") {
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
    isCorrect = String(userAnswer[0]).trim() === String(q.correct).trim();
    errorType = isCorrect ? "correct" : "wrong_order";
  }

  if (q.category === "Pattern") {
    isCorrect = String(userAnswer).trim() === String(q.correct).trim();
    errorType = isCorrect ? "correct" : "guess";
  }

  return { isCorrect, errorType };
};
