// Screening score helpers: metrics, weighted final score, risk, and weak areas.

// Build metrics from screening answers (used for save + results UI)
export const calculateWorkingMemoryMetrics = (results) => {
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

    // Longest correct number sequence
    if ((r.category === "Number Memory" || r.category === "Memory Recall") && r.isCorrect) {
      const length = Array.isArray(r.correctAnswer)
        ? r.correctAnswer.length
        : 0;
      if (length > maxSpan) maxSpan = length;
    }

    // Sequence quality (partial / wrong order / etc.)
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

    if (r.category === "Instruction") {
      instructionTotal++;
      if (r.isCorrect) instructionCorrect++;
    }

    if (r.category === "Pattern") {
      patternTotal++;
      if (r.isCorrect) patternCorrect++;
    }
  });

  const recallAccuracy = (correctCount / total) * 100;
  const avgResponseTime = totalTime / total;
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

  // Normalize digit span vs longest number question in this test
  let maxPossibleSpan = 0;
  results.forEach((r) => {
    if (r.category === "Number Memory" || r.category === "Memory Recall") {
      const length = Array.isArray(r.correctAnswer) ? r.correctAnswer.length : 0;
      if (length > maxPossibleSpan) maxPossibleSpan = length;
    }
  });
  const digitSpanScore = maxPossibleSpan > 0 ? (maxSpan / maxPossibleSpan) * 100 : 0;
  const timeScore = calculateTimeScore(avgResponseTime);

  // Weighted final score (out of 100)
  const finalScore =
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

// Faster answers score higher; min score is 5
const calculateTimeScore = (avgTime) => {
  if (avgTime < 15000) return 100;
  const overtime = avgTime - 15000;
  const steps = Math.ceil(overtime / 1000);
  const score = 100 - (steps * 5);
  return Math.max(5, score);
};

// Local risk from final score (≥75 Low, ≥45 Moderate, else High)
const getRiskLevel = (score) => {
  if (score >= 75) return "Low";
  if (score >= 45) return "Moderate";
  return "High";
};

// Areas scoring below 50
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
