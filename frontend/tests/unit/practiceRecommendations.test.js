import { describe, expect, test } from "vitest";
import { getPracticeRecommendations, getPracticeLevel } from "../../src/utils/workingMemory/practiceRecommendations.util";

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
  test("only chooses accessible practice activities and prefers unfinished levels", () => {
    const progress = { isIdentificationCompleted: true, maxUnlockedLevel: 2, levelsProgress: [
      { levelNumber: 1, subCategories: [{ subCategoryKey: "words", isUnlocked: true, isCompleted: true }] },
      { levelNumber: 2, subCategories: [{ subCategoryKey: "words", isUnlocked: true, isCompleted: false }] },
      { levelNumber: 3, subCategories: [{ subCategoryKey: "words", isUnlocked: true }] },
    ] };
    expect(getPracticeLevel(progress, "words")).toBe(2);
    expect(getPracticeLevel(progress, "numbers")).toBeNull();
    expect(getPracticeLevel({ ...progress, isIdentificationCompleted: false }, "words")).toBeNull();
  });
});
