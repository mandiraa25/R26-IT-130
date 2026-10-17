import { describe, test, expect } from "vitest";
import { QUIZ_DATA } from "../../src/features/workingMemory/identification/data";
import { evaluateIdentifyAnswer } from "../../src/features/workingMemory/logic/answerChecking.js";

const SENTINEL = "__DEFINITELY_WRONG__";

/**
 * Builds the exact answer shape the Identify.jsx UI would submit for a
 * question, both a correct one and a deliberately wrong one, based on the
 * question's category/type/options — mirroring how DragDrop / option
 * buttons / pattern buttons call handleSubmit.
 */
function buildAnswers(q) {
  if (q.category === "Pattern") {
    const wrong = q.options.find((o) => o !== q.correct) ?? SENTINEL;
    return { correctAnswer: q.correct, wrongAnswer: wrong };
  }

  if (q.category === "Instruction") {
    const wrong = q.options.find((o) => o !== q.correct) ?? SENTINEL;
    return { correctAnswer: [q.correct], wrongAnswer: [wrong] };
  }

  if (q.options) {
    // Option-list variant (grade 3/4 style) for SEQUENCE_MEMORY / WORD_MEMORY
    const wrong = q.options.find((o) => o !== q.correct) ?? SENTINEL;
    return { correctAnswer: q.correct, wrongAnswer: wrong };
  }

  // DragDrop variant (grade 2 style)
  const correctList = q.type === "SEQUENCE_MEMORY" ? q.sequence.map(String) : q.words;
  let wrongList = correctList.length > 1 ? [...correctList].reverse() : [SENTINEL];
  if (JSON.stringify(wrongList) === JSON.stringify(correctList)) {
    wrongList = [SENTINEL, ...correctList.slice(1)];
  }
  return { correctAnswer: correctList, wrongAnswer: wrongList };
}

describe("Identify quiz scoring — every question, every grade, every language", () => {
  for (const grade of Object.keys(QUIZ_DATA)) {
    for (const lang of Object.keys(QUIZ_DATA[grade])) {
      const questions = QUIZ_DATA[grade][lang];

      test(`grade ${grade} / ${lang} has questions loaded`, () => {
        expect(questions.length).toBeGreaterThan(0);
      });

      for (const q of questions) {
        const { correctAnswer, wrongAnswer } = buildAnswers(q);

        test(`grade ${grade} / ${lang} / ${q.id} (${q.category}): correct answer scores correct`, () => {
          expect(evaluateIdentifyAnswer(q, correctAnswer).isCorrect).toBe(true);
        });

        test(`grade ${grade} / ${lang} / ${q.id} (${q.category}): wrong answer scores incorrect`, () => {
          expect(evaluateIdentifyAnswer(q, wrongAnswer).isCorrect).toBe(false);
        });
      }
    }
  }
});
