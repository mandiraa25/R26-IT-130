/**
 * Phonological Awareness Scoring Utility
 */

export const calculatePhonologicalMetrics = (results, grade, lang) => {
  const total = results.length;
  let correctCount = 0;
  let totalTime = 0;


  const consolidated = {
    "Phonological Awareness": { correct: 0, total: 0, time: 0 },
    "Visual Processing": { correct: 0, total: 0, time: 0 },
    "Literacy Skills": { correct: 0, total: 0, time: 0 },
  };

  results.forEach((r) => {
    totalTime += r.timeTaken;
    if (r.isCorrect) correctCount++;

    // Extract the numeric part of the ID (e.g., "g2-si-1" -> 1)
    const qNumber = parseInt(r.questionId.split('-').pop());
    let mainCat = "Literacy Skills"; // Default

    if (lang === 'en') {
      // English Mapping (Consistent across grades: PA: 5, VP: 6, LS: 4)
      if ([1, 2, 3, 4, 14].includes(qNumber)) mainCat = "Phonological Awareness";
      else if ([5, 6, 7, 8, 9, 15].includes(qNumber)) mainCat = "Visual Processing";
      else mainCat = "Literacy Skills";
    } else {
      // Sinhala Mapping
      if (grade === "2") {
        if ([2, 3, 5, 7, 8].includes(qNumber)) mainCat = "Phonological Awareness";
        else if ([10, 11, 12, 13, 14, 15].includes(qNumber)) mainCat = "Visual Processing";
        else mainCat = "Literacy Skills";
      } else {
        // Grade 3 & 4
        if ([1, 2, 5, 7, 8].includes(qNumber)) mainCat = "Phonological Awareness";
        else if ([10, 11, 12, 13, 14, 15].includes(qNumber)) mainCat = "Visual Processing";
        else mainCat = "Literacy Skills";
      }
    }

    if (consolidated[mainCat]) {
      consolidated[mainCat].total++;
      consolidated[mainCat].time += r.timeTaken;
      if (r.isCorrect) consolidated[mainCat].correct++;
    }
  });

  // Calculate scores per consolidated category
  const categoryScores = {};
  const categoryTimes = {};

  Object.keys(consolidated).forEach(cat => {
    const data = consolidated[cat];
    categoryScores[cat] = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    categoryTimes[cat] = data.total > 0 ? (data.time / data.total) : 0;
  });

  const overallAccuracy = total > 0 ? (correctCount / total) * 100 : 0;
  const avgResponseTime = total > 0 ? totalTime / total : 0;
  const timeScore = calculateTimeScore(avgResponseTime);

  // Final weighted score calculation for 3 categories
  const finalScore =
    0.3 * (categoryScores["Phonological Awareness"] || 0) +
    0.3 * (categoryScores["Visual Processing"] || 0) +
    0.3 * (categoryScores["Literacy Skills"] || 0) +
    0.1 * timeScore;

  const riskLevel = getRiskLevel(finalScore);
  const weakAreas = getWeakAreas(categoryScores, timeScore, grade);

  return {
    totalQuestions: total,
    totalCorrect: correctCount,
    overallAccuracy,
    avgResponseTime,
    totalTimeTaken: totalTime,
    categoryScores,
    categoryTimes,
    timeScore,
    finalScore,
    riskLevel,
    weakAreas,
  };
};

const calculateTimeScore = (avgTime) => {
  if (avgTime < 2000) return 100;
  const overtime = avgTime - 2000;
  const steps = Math.ceil(overtime / 1000);
  const score = 100 - (steps * 5);
  return Math.max(5, score);
}; 


const getRiskLevel = (score) => {
  if (score >= 75) return "Low";
  if (score >= 45) return "Moderate";
  return "High";
};

const getWeakAreas = (categoryScores, timeScore) => {
  const weak = [];
  if ((categoryScores["Phonological Awareness"] || 0) < 75) {
    weak.push("Sound awareness and rhyming");
  }
  if ((categoryScores["Visual Processing"] || 0) < 75) {
    weak.push("Visual letter discrimination and mirror awareness");
  }
  if ((categoryScores["Literacy Skills"] || 0) < 75) {
    weak.push("Spelling patterns and word structure");
  }
  if ((timeScore || 0) < 65) {
    weak.push("Processing speed and fluency");
  }
  return weak;
};