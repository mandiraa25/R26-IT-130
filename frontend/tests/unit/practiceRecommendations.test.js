import { describe, expect, test } from "vitest";
import { getPracticeRecommendations } from "../../src/features/workingMemory/logic/progression.js";

describe("screening practice recommendations", () => {
  test("ranks recorded mistakes by count, rate, then stable category order", () => {
    const responses = [
      ...Array.from({ length: 4 }, (_, i) => ({ category: "Pattern", isCorrect: i >= 2 })),
      ...Array.from({ length: 3 }, (_, i) => ({ category: "Picture Memory", isCorrect: i >= 2 })),
      ...Array.from({ length: 4 }, (_, i) => ({ category: "Instruction", isCorrect: i >= 2 })),
      { category: "Number Memory", isCorrect: false },
    ];
    expect(getPracticeRecommendations(responses).categories.map(item => item.key)).toEqual(["words", "pattern", "instructions", "numbers"]);
  });
  test("does not invent errors from missing records or older summary-only results", () => {
    expect(getPracticeRecommendations(null)).toEqual({ hasData: false, categories: [] });
    expect(getPracticeRecommendations([{ category: "Pattern" }]).hasData).toBe(false);
    expect(getPracticeRecommendations([{ category: "Pattern", isCorrect: true }])).toEqual({ hasData: true, categories: [] });
  });
  test("recorded skips and timeouts follow existing incorrect-answer scoring", () => {
    const result = getPracticeRecommendations([{ category: "Number Memory", isCorrect: false, errorType: "skipped" }]);
    expect(result.categories[0].incorrect).toBe(1);
  });
});
