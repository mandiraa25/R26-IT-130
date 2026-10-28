/*
 * FILE PURPOSE
 * Pure calculation of screening assessment metrics, final score, risk and weak areas.
 *
 * HOW IT CONNECTS
 * ScreeningPage calls calculateWorkingMemoryMetrics both for saving and display; ScreeningResults
 * presents its output. The backend may separately attach an ML prediction.
 * Direct source importers: ../identification/ScreeningPage.jsx.
 *
 * THINGS TO REMEMBER
 * Inputs are recorded responses with millisecond timings. Weighted final score: accuracy 25%,
 * normalized digit span 25%, sequence 15%, instructions 15%, pattern 10%, time 10%. Risk cutoffs are
 * 75/45. Improvement stars and its 3-correct pass rule are a different system. Normal callers supply
 * completed, nonempty result arrays.
 */

// -----------------------------
// MAIN FUNCTION
// -----------------------------
/*
 * FUNCTION: calculateWorkingMemoryMetrics
 * Calculate screening features and the weighted assessment score.
 * WHEN: ScreeningPage calls this for real-save payload and final display.
 * HOW / RESULT: Aggregates correctness, timing, number span/error weights and category scores, then
 * returns risk and weak areas. It does not award improvement stars.
 */
export const calculateWorkingMemoryMetrics = (results) => {
  // VIVA: Build screening features from recorded answers, not improvement stars.
  // Digit span is the longest correctly recalled number sequence in this test.
  const total = results.length;

  let correctCount = 0;
  let totalTime = 0;

  let maxSpan = 0;

  let sequenceScoreSum = 0;
  let sequenceCount = 0;

  let instructionCorrect = 0;
  let instructionTotal = 0;

  let patternCorrect = 0;
  let patternTotal = 0;

  results.forEach((r) => {
    totalTime += r.timeTaken;

    if (r.isCorrect) correctCount++;

    // 🔢 DIGIT SPAN
    if ((r.category === "Number Memory" || r.category === "Memory Recall") && r.isCorrect) {
      const length = Array.isArray(r.correctAnswer)
        ? r.correctAnswer.length
        : 0;

      if (length > maxSpan) maxSpan = length;
    }

    // 🔁 SEQUENCE ERROR SCORE
    if (r.category === "Number Memory" || r.category === "Memory Recall") {
      sequenceCount++;

      const weightMap = {
        correct: 1,
        partial_recall: 0.5,
        wrong_order: 0.4,
        skipped: 0.2,
        incorrect: 0,
      };

      sequenceScoreSum += weightMap[r.errorType] || 0;
    }

    // 📋 INSTRUCTION
    if (r.category === "Instruction") {
      instructionTotal++;
      if (r.isCorrect) instructionCorrect++;
    }

    // 🔺 PATTERN
    if (r.category === "Pattern") {
      patternTotal++;
      if (r.isCorrect) patternCorrect++;
    }
  });

  // -----------------------------
  // CALCULATED METRICS
  // -----------------------------

  const recallAccuracy = (correctCount / total) * 100;

  const avgResponseTime = totalTime / total;

  /*
 * SCORING STEP: Average the recorded number-sequence error weights and convert to percent.
 * This feature is separate from overall recall accuracy. The current option-based
 * number questions often yield only correct/incorrect weights; free-recall branches
 * can produce the partial/order/skip classifications retained in answerChecking.js.
 */
const sequenceScore =
    sequenceCount > 0 ? (sequenceScoreSum / sequenceCount) * 100 : 0;

  const instructionScore =
    instructionTotal > 0
      ? (instructionCorrect / instructionTotal) * 100
      : 0;

  const patternScore =
    patternTotal > 0
      ? (patternCorrect / patternTotal) * 100
      : 0;

  // Find the highest possible span in the set
  let maxPossibleSpan = 0;
  results.forEach((r) => {
    if (r.category === "Number Memory" || r.category === "Memory Recall") {
      const length = Array.isArray(r.correctAnswer) ? r.correctAnswer.length : 0;
      if (length > maxPossibleSpan) maxPossibleSpan = length;
    }
  });

  // Normalize digit span based on the max provided in the test
  /*
 * SCORING STEP: Normalize achieved number span against this test's largest number span.
 * For example, a longest correct span of 3 with a maximum available span of 4 gives 75.
 * Picture Memory accuracy contributes to overall accuracy, not to this digit-span feature.
 */
const digitSpanScore = maxPossibleSpan > 0 ? (maxSpan / maxPossibleSpan) * 100 : 0;

  const timeScore = calculateTimeScore(avgResponseTime);

  // -----------------------------
  // FINAL SCORE
  // -----------------------------

  const finalScore =
    // VIVA: Weights sum to 1: accuracy/span 25% each, sequence/instructions 15%
    // each, and pattern/time 10% each. The displayed final score is out of 100.
    0.25 * recallAccuracy +
    0.25 * digitSpanScore +
    0.15 * sequenceScore +
    0.15 * instructionScore +
    0.1 * patternScore +
    0.1 * timeScore;

  const riskLevel = getRiskLevel(finalScore);

  const weakAreas = getWeakAreas({
    digitSpanScore,
    sequenceScore,
    instructionScore,
    patternScore,
    timeScore,
  });

  return {
    recallAccuracy,
    avgResponseTime,
    digitSpan: maxSpan,
    digitSpanScore,
    sequenceScore,
    instructionScore,
    patternScore,
    timeScore,
    finalScore,
    riskLevel,
    weakAreas,
  };
};

// -----------------------------
// TIME SCORE (IMPORTANT)
// -----------------------------
/*
 * FUNCTION: calculateTimeScore
 * Convert average answer milliseconds into a 0-100-style time contribution with a floor of five.
 * WHEN: calculateWorkingMemoryMetrics calls this.
 * HOW / RESULT: Below 15 seconds gets 100; each started extra second subtracts five, with minimum
 * five. Exactly 15 seconds also computes 100.
 */
const calculateTimeScore = (avgTime) => {
  // VIVA: Input is milliseconds. Average time beyond 15 seconds loses five
  // points per started extra second, with a minimum time score of five.
  if (avgTime < 15000) return 100;
  const overtime = avgTime - 15000;
  const steps = Math.ceil(overtime / 1000);
  const score = 100 - (steps * 5);
  return Math.max(5, score);
};

// -----------------------------
// RISK LEVEL
// -----------------------------
/*
 * FUNCTION: getRiskLevel
 * Map the weighted screening score to the implemented risk label.
 * WHEN: calculateWorkingMemoryMetrics calls this.
 * HOW / RESULT: 75 or more is Low; 45 or more is Moderate; lower is High. The separate ML service can
 * later attach a different prediction.
 */
const getRiskLevel = (score) => {
  if (score >= 75) return "Low";
  if (score >= 45) return "Moderate";
  return "High";
};

// -----------------------------
// WEAK AREA DETECTION
// -----------------------------
/*
 * FUNCTION: getWeakAreas
 * List assessment components whose normalized score is below 50.
 * WHEN: calculateWorkingMemoryMetrics calls this.
 * HOW / RESULT: Returns stored English area identifiers; Dashboard maps them to translated UI labels.
 */
const getWeakAreas = (metrics) => {
  const weak = [];

  if (metrics.digitSpanScore < 50)
    weak.push("Low working memory capacity");

  if (metrics.sequenceScore < 50)
    weak.push("Sequence processing difficulty");

  if (metrics.instructionScore < 50)
    weak.push("Instruction following difficulty");

  if (metrics.patternScore < 50)
    weak.push("Pattern recognition difficulty");

  if (metrics.timeScore < 50)
    weak.push("Slow cognitive processing");

  return weak;
};
