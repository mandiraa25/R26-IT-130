import { describe, test, expect } from "vitest";
import { getSubCategoryData } from "../../src/pages/workingMemory/data/improvement";
import { VALID_GRADES, VALID_LEVELS, SUBCATEGORY_ORDER } from "../../src/pages/workingMemory/data/improvement/config";
import { evaluateDragAnswer, evaluatePatternAnswer } from "../../src/utils/workingMemory/evaluateImprovementAnswer.util";

const SENTINEL = "__DEFINITELY_WRONG__";
const LANGUAGES = ["en", "si"];

/**
 * Builds the exact answer shape the ImprovementActivityWM.jsx UI would
 * submit for a question, both a correct one and a deliberately wrong one,
 * plus the evaluator function that should be used to score it — mirroring
 * handleTileClick (pattern) / handleDragSubmit (words, instructions, numbers).
 */
function buildAnswers(subCategoryKey, q) {
  if (subCategoryKey === "pattern") {
    const pool = q.options || q.dragPool || [];
    const wrong = pool.find((o) => o !== q.missingAnswer) ?? SENTINEL;
    return {
      correctAnswer: q.missingAnswer,
      wrongAnswer: wrong,
      evaluate: (ans) => evaluatePatternAnswer(q, ans),
    };
  }

  if (subCategoryKey === "instructions") {
    const wrong = (q.options || []).find((o) => o !== q.correct) ?? SENTINEL;
    return {
      correctAnswer: [q.correct],
      wrongAnswer: [wrong],
      evaluate: (ans) => evaluateDragAnswer(subCategoryKey, ans, q),
    };
  }

  // words / numbers: ordered drag-and-drop arrays
  const correct = q.correct;
  let wrong = correct.length > 1 ? [...correct].reverse() : [SENTINEL];
  if (JSON.stringify(wrong) === JSON.stringify(correct)) {
    wrong = [SENTINEL, ...correct.slice(1)];
  }
  return {
    correctAnswer: correct,
    wrongAnswer: wrong,
    evaluate: (ans) => evaluateDragAnswer(subCategoryKey, ans, q),
  };
}

describe("Improvement games scoring — every question, grade, level, subcategory, language", () => {
  for (const grade of VALID_GRADES) {
    for (const lang of LANGUAGES) {
      for (const level of VALID_LEVELS) {
        for (const subCategoryKey of SUBCATEGORY_ORDER) {
          const data = getSubCategoryData(grade, level, subCategoryKey, lang);

          test(`grade ${grade} / ${lang} / level ${level} / ${subCategoryKey} has questions loaded`, () => {
            expect(data?.questions?.length).toBeGreaterThan(0);
          });

          for (const q of data?.questions || []) {
            const { correctAnswer, wrongAnswer, evaluate } = buildAnswers(subCategoryKey, q);

            test(`grade ${grade} / ${lang} / L${level} / ${subCategoryKey} / ${q.id}: correct answer scores correct`, () => {
              expect(evaluate(correctAnswer)).toBe(true);
            });

            test(`grade ${grade} / ${lang} / L${level} / ${subCategoryKey} / ${q.id}: wrong answer scores incorrect`, () => {
              expect(evaluate(wrongAnswer)).toBe(false);
            });
          }
        }
      }
    }
  }
});
