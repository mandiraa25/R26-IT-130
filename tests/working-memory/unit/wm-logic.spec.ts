import { test, expect } from "@playwright/test";
import { describeCase } from "../../support/fixtures";
import { NUMBER_BANKS } from "../../../frontend/src/features/workingMemory/improvement/data/numbers/bank.js";
import { getSubCategoryData } from "../../../frontend/src/features/workingMemory/improvement/data/index.js";
import { analyzeSequenceError, evaluateDragAnswer, evaluateIdentifyAnswer, evaluatePatternAnswer } from "../../../frontend/src/features/workingMemory/logic/answerChecking.js";
import { calculateWorkingMemoryMetrics } from "../../../frontend/src/features/workingMemory/logic/scoring.js";
import { getPracticeRecommendations, readTotalStars, selectAttemptQuestions } from "../../../frontend/src/features/workingMemory/logic/progression.js";
import { LEVEL_DISPLAY_TIMES_MS, SUBCATEGORY_ORDER, getLevelDisplaySeconds } from "../../../frontend/src/features/workingMemory/config/gameConfig.js";
import { QUIZ_DATA } from "../../../frontend/src/features/workingMemory/identification/data/index.js";

const spans = (grade: string, level: number) => [...new Set(NUMBER_BANKS[grade].en[`level${level}`].questions.map((q: any) => q.showItems.length))];

test.describe("Working Memory › Unit › Sequence generation and span", () => {
  test("UT-WM-01: Every Number Memory question has a digit sequence matching its answer", () => {
    describeCase({ requirement: "Sequences are well formed", expected: "showItems are digits; correct is the same sequence (or reversed for backward)", priority: "High" });
    for (const grade of ["2", "3", "4"]) for (const level of [1, 2, 3, 4]) for (const q of NUMBER_BANKS[grade].en[`level${level}`].questions) {
      expect(q.showItems.every((d: string) => /^\d$/.test(d)), q.id).toBe(true);
      expect(q.correct, q.id).toEqual(q.isBackward ? [...q.showItems].reverse() : q.showItems);
    }
  });

  test("UT-WM-02: Grade 2 span increases from 2 to 3 between Level 1 and Level 2", () => {
    describeCase({ requirement: "Span adapts upward with mastery (2 -> 3)", expected: "Level 1 span 2, Level 2 span 3", priority: "High" });
    expect(spans("2", 1)).toEqual([2]);
    expect(spans("2", 2)).toEqual([3]);
  });

  test("UT-WM-03: Span increases from 3 to 4 after mastery (Grade 3, Level 1 -> Level 2)", () => {
    describeCase({ requirement: "Span adapts upward with mastery (3 -> 4)", expected: "Level 1 span 3, Level 2 span 4", priority: "High" });
    expect(spans("3", 1)).toEqual([3]);
    expect(spans("3", 2)).toEqual([4]);
  });

  test("UT-WM-04: Span boundaries per grade stay within 2-5 and rise with grade", () => {
    describeCase({ requirement: "Boundary spans", expected: "Min span 2 (Grade 2), max span 5 (Grade 4); Level 1 span grows by grade", priority: "Medium" });
    const all = ["2", "3", "4"].flatMap(g => [1, 2, 3, 4].flatMap(l => spans(g, l)));
    expect(Math.min(...all)).toBe(2);
    expect(Math.max(...all)).toBe(5);
    expect([spans("2", 1)[0], spans("3", 1)[0], spans("4", 1)[0]]).toEqual([2, 3, 4]);
  });

  test("UT-WM-05: Levels 1-2 are forward only; Levels 3-4 add backward recall", () => {
    describeCase({ requirement: "Harder levels reverse the order", expected: "Level 1-2: 5 forward; Level 3-4: 2 forward then 3 backward", priority: "Medium" });
    for (const grade of ["2", "3", "4"]) for (const level of [1, 2, 3, 4]) {
      const order = NUMBER_BANKS[grade].en[`level${level}`].questions.map((q: any) => (q.isBackward ? "B" : "F")).join("");
      expect(order, `G${grade} L${level}`).toBe(level >= 3 ? "FFBBB" : "FFFFF");
    }
  });

  test("UT-WM-06: Each game has 5+ questions for every grade, level and language", () => {
    describeCase({ requirement: "Complete question banks", expected: ">= 5 questions in all 96 grade/level/game/language banks", priority: "High" });
    for (const grade of ["2", "3", "4"]) for (const level of [1, 2, 3, 4]) for (const game of SUBCATEGORY_ORDER) for (const lang of ["en", "si"]) {
      expect(getSubCategoryData(grade, level, game, lang)?.questions?.length ?? 0, `${grade}/${level}/${game}/${lang}`).toBeGreaterThanOrEqual(5);
    }
  });
});

test.describe("Working Memory › Unit › Answer checking", () => {
  test("UT-WM-07: Number recall is correct only in the exact order", () => {
    describeCase({ requirement: "Order matters", expected: "Exact order correct; swapped or partial incorrect", priority: "High" });
    const q = { correct: ["4", "8", "2"] };
    expect(evaluateDragAnswer("numbers", ["4", "8", "2"], q)).toBe(true);
    expect(evaluateDragAnswer("numbers", ["8", "4", "2"], q)).toBe(false);
    expect(evaluateDragAnswer("numbers", ["4", "8", ""], q)).toBe(false);
  });

  test("UT-WM-08: Sequence errors are classified (correct, wrong order, partial, skipped)", () => {
    describeCase({ requirement: "Error analysis for screening metrics", expected: "482=correct, 824=wrong_order, 48=partial_recall, empty=skipped", priority: "Medium" });
    expect(analyzeSequenceError(["4", "8", "2"], "482")).toBe("correct");
    expect(analyzeSequenceError(["4", "8", "2"], "824")).toBe("wrong_order");
    expect(analyzeSequenceError(["4", "8", "2"], "48")).toBe("partial_recall");
    expect(analyzeSequenceError(["4", "8", "2"], "")).toBe("skipped");
  });

  test("UT-WM-08b: Same digits with two swapped are classified as wrong order", () => {
    describeCase({ requirement: "Sequencing difficulty is measured correctly", expected: "842 for 482 (all digits present, order swapped) = wrong_order", priority: "Medium" });
    // Recorded defect: the position-match check runs first, so a swap that keeps
    // one digit in place is reported as partial_recall (weight 0.5) instead of
    // wrong_order (weight 0.4), changing the screening sequence score.
    expect(analyzeSequenceError(["4", "8", "2"], "842")).toBe("wrong_order");
  });

  test("UT-WM-09: Pattern answers compare with the missing symbol", () => {
    describeCase({ requirement: "Pattern scoring", expected: "Only the missing symbol is correct", priority: "High" });
    const q = { missingAnswer: "🔴" };
    expect(evaluatePatternAnswer(q, "🔴")).toBe(true);
    expect(evaluatePatternAnswer(q, "🔵")).toBe(false);
  });

  test("UT-WM-10: Every screening question in English and Sinhala has exactly one correct option", () => {
    describeCase({ requirement: "Screening answers validated correctly", expected: "90 questions, one correct option each", priority: "High" });
    let count = 0;
    for (const grade of ["2", "3", "4"]) for (const lang of ["en", "si"]) for (const q of QUIZ_DATA[grade][lang]) {
      count++;
      expect(q.options.filter((o: string) => evaluateIdentifyAnswer(q, o).isCorrect).length, `${q.id}`).toBe(1);
    }
    expect(count).toBe(90);
  });
});

test.describe("Working Memory › Unit › Scoring, mastery and selection", () => {
  test("UT-WM-11: Screening metrics give 100% accuracy and no weak areas for a perfect quick run", () => {
    describeCase({ requirement: "Scoring", expected: "recallAccuracy 100, risk Low, no weak areas", priority: "High" });
    const results = [
      { category: "Pattern", isCorrect: true, timeTaken: 2000 },
      { category: "Number Memory", isCorrect: true, timeTaken: 3000, correctAnswer: ["1", "2", "3"], errorType: "correct" },
      { category: "Instruction", isCorrect: true, timeTaken: 2500 },
      { category: "Picture Memory", isCorrect: true, timeTaken: 2500 },
    ];
    const m = calculateWorkingMemoryMetrics(results);
    expect(m.recallAccuracy).toBe(100);
    expect(m.riskLevel).toBe("Low");
    expect(m.weakAreas).toEqual([]);
  });

  test("UT-WM-12: Slow and incorrect answers raise the risk and name the weak areas", () => {
    describeCase({ requirement: "Identify difficulties (slow processing, sequencing ...)", expected: "High risk; weak areas include slow processing and sequencing", priority: "High" });
    const results = [
      { category: "Pattern", isCorrect: false, timeTaken: 40000 },
      { category: "Number Memory", isCorrect: false, timeTaken: 40000, correctAnswer: ["1", "2", "3"], errorType: "wrong_order" },
      { category: "Instruction", isCorrect: false, timeTaken: 40000 },
    ];
    const m = calculateWorkingMemoryMetrics(results);
    expect(m.riskLevel).toBe("High");
    expect(m.weakAreas).toEqual(expect.arrayContaining(["Slow cognitive processing", "Sequence processing difficulty", "Instruction following difficulty", "Pattern recognition difficulty"]));
  });

  test("UT-WM-13: An attempt has 5 questions and prefers ones not just seen", () => {
    describeCase({ requirement: "Question selection", expected: "5 questions; unseen ones first when the pool has more than 5", priority: "Medium" });
    const pool = Array.from({ length: 6 }, (_, i) => ({ id: `q${i}` }));
    const first = selectAttemptQuestions(pool, []);
    expect(first).toHaveLength(5);
    const unseen = pool.find(q => !first.some(f => f.id === q.id))!;
    const second = selectAttemptQuestions(pool, first.map(q => q.id));
    expect(second.map(q => q.id)).toContain(unseen.id);
  });

  test("UT-WM-14: Practice recommendations rank categories by mistakes", () => {
    describeCase({ requirement: "Recommend what to practise after screening", expected: "Most-missed category first; no data -> hasData false", priority: "Medium" });
    const rec = getPracticeRecommendations([
      { category: "Number Memory", isCorrect: false }, { category: "Number Memory", isCorrect: false },
      { category: "Pattern", isCorrect: false }, { category: "Instruction", isCorrect: true },
    ]);
    expect(rec.categories.map(c => c.key)).toEqual(["numbers", "pattern"]);
    expect(getPracticeRecommendations([]).hasData).toBe(false);
  });

  test("UT-WM-15: Games unlock in the fixed order and display times shrink by level", () => {
    describeCase({ requirement: "Mastery path and timings", expected: "pattern -> words -> instructions -> numbers; 12/10/8/6 s", priority: "Medium" });
    expect(SUBCATEGORY_ORDER).toEqual(["pattern", "words", "instructions", "numbers"]);
    expect([1, 2, 3, 4].map(getLevelDisplaySeconds)).toEqual([12, 10, 8, 6]);
    expect(Object.values(LEVEL_DISPLAY_TIMES_MS)).toEqual([12000, 10000, 8000, 6000]);
  });

  test("UT-WM-16: Star totals are read safely from progress", () => {
    describeCase({ requirement: "Star display", expected: "Uses totalStars, falls back to totalCarrots, never negative", priority: "Low" });
    expect(readTotalStars({ totalStars: 25 })).toBe(25);
    expect(readTotalStars({ totalCarrots: 10 })).toBe(10);
    expect(readTotalStars({ totalStars: -4 })).toBe(0);
    expect(readTotalStars(null)).toBe(0);
  });
});
