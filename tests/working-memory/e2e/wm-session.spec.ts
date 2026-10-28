import { API_URL } from "../../support/env";
import { authHeader, createStudent, describeCase, expect, fastAudio, signInBrowser, test, type Student } from "../../support/fixtures";
import { QUIZ_DATA } from "../../../frontend/src/features/workingMemory/identification/data/index.js";
import { PATTERN_QUESTIONS } from "../../../frontend/src/features/workingMemory/improvement/data/pattern/questions.js";
import type { APIRequestContext } from "@playwright/test";

const WM = `${API_URL}/working-memory`;

async function placeAtLevelOne(request: APIRequestContext, s: Student) {
  const questionResults = Array.from({ length: 15 }, (_, i) => ({ questionId: `wm-g3-${i + 1}`, category: "Pattern", isCorrect: i < 4, timeTaken: 3000 }));
  expect((await request.post(`${WM}/identification/save-result`, { data: { studentId: s.studentId, grade: "3", questionResults } })).status()).toBe(201);
}
async function pass(request: APIRequestContext, s: Student, key: string) {
  const data = { studentId: s.studentId, grade: "3", language: "en", levelNumber: 1, subCategoryKey: key, score: 5, totalQuestions: 5, totalTimeTaken: 1, questionResults: Array.from({ length: 5 }, (_, i) => ({ questionId: `seed${i}`, isCorrect: true, timeTaken: 1 })) };
  expect((await request.post(`${WM}/improvement/submit-attempt`, { data })).status()).toBe(201);
}

test.describe("Working Memory › E2E › Screening session", () => {
  test("E2E-WM-01: Student completes the full 15-question Grade 3 screening and is placed by the result", async ({ page, request }) => {
    test.setTimeout(240_000);
    describeCase({ requirement: "Play a full Working Memory screening through the UI", expected: "15 answers saved (15/15 correct), results screen shown, improvement unlocked at Level 4", priority: "High" });
    const s = await createStudent(request);
    await fastAudio(page);
    await signInBrowser(page, s);
    await page.goto("/working-memory/3");
    await page.getByRole("button", { name: /Start Memory Check/i }).click();
    await page.getByRole("button", { name: /I'm ready/i }).click();
    const questions = QUIZ_DATA["3"].en;
    expect(questions).toHaveLength(15);
    for (const [index, q] of questions.entries()) {
      await expect(page.locator(".wm-screen__count")).toHaveText(`Question ${index + 1} / 15`);
      const options = page.locator('[data-testid="wm-pattern-option"], [data-testid="wm-choice-option"]');
      // Timed memory questions show their items first; options appear when recall starts.
      await expect(options).toHaveCount(q.options.length, { timeout: 20_000 });
      await expect(options.first()).toBeEnabled();
      await options.nth(q.options.indexOf(q.correct)).click();
    }
    await expect(page.getByTestId("wm-finished")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("wm-go-improvement")).toBeEnabled({ timeout: 20_000 });
    const saved = (await (await request.get(`${WM}/identification/student-results/${s.studentId}`)).json()).data;
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ totalScore: 15, totalQuestions: 15, grade: "3" });
    const progress = (await (await request.get(`${WM}/improvement/progress/${s.studentId}`)).json()).data;
    expect(progress.isIdentificationCompleted).toBe(true);
    // Marks rule: 15/15 (100%) is Level 4. The screening also sends its own risk
    // label ("Low" for the best band), which the backend maps to Level 3 first.
    expect(progress.maxUnlockedLevel, `15/15 placed at Level ${progress.maxUnlockedLevel} (risk label "${saved[0].metrics?.riskLevel}")`).toBe(4);
  });
});

test.describe("Working Memory › E2E › Improvement games", () => {
  test("E2E-WM-02: Student plays Level 1 Pattern Recognition from the level map, scores 5/5 and unlocks Picture Memory", async ({ page, request }) => {
    test.setTimeout(120_000);
    describeCase({ requirement: "Play a Working Memory game; stars and unlocking", expected: "5/5, 25 stars, Pattern completed, Picture Memory unlocked, profile total 25", priority: "High" });
    const s = await createStudent(request);
    await placeAtLevelOne(request, s);
    await fastAudio(page);
    await signInBrowser(page, s);
    await page.goto("/improvement-wm/3");
    await page.getByRole("button", { name: "Level 1", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Pattern", exact: true }).click();
    await page.getByRole("button", { name: /Skip & Play/ }).click();
    const bank = Object.fromEntries(PATTERN_QUESTIONS["3"].level1.map((q: any) => [q.id, q]));
    for (let i = 0; i < 5; i++) {
      const board = page.locator(".lx-pattern-question");
      const id = await board.getAttribute("data-question-id");
      const q = bank[id!];
      expect(q, `question ${id} is in the Level 1 bank`).toBeTruthy();
      await page.getByRole("button", { name: `Answer: ${q.missingAnswer}`, exact: true }).click();
      await page.locator(".lx-pattern-check").click();
      await expect(page.getByTestId("level-one-feedback")).toContainText("Well done");
      await page.locator(".lx-pattern-next").click();
    }
    await expect(page.locator(".lx-pattern-score strong, [data-testid$='score']").first()).toContainText("5 / 5");
    await expect.poll(async () => (await (await request.get(`${WM}/improvement/progress/${s.studentId}`)).json()).data.levelsProgress[0].subCategories[1].isUnlocked, { timeout: 15_000 }).toBe(true);
    const profile = await (await request.get(`${API_URL}/students/profile`, { headers: authHeader(s) })).json();
    expect(profile.totalStars).toBe(25);
  });

  test("E2E-WM-03: Student plays Level 1 Number Memory with the real 12-second display and keypad", async ({ page, request }) => {
    test.setTimeout(180_000);
    describeCase({ requirement: "Number Memory: Ready message, timed display, keypad recall, feedback, tracker", expected: "Reminder states 12 seconds; keypad appears after the display; 5 correct answers give 5/5", priority: "High" });
    const s = await createStudent(request);
    await placeAtLevelOne(request, s);
    for (const key of ["pattern", "words", "instructions"]) await pass(request, s, key);
    await fastAudio(page);
    await signInBrowser(page, s);
    await page.goto("/improvement-activity-wm/3/1/numbers");
    await page.getByRole("button", { name: /Skip & Play/ }).click();
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(".lx-reminder")).toContainText("You have 12 seconds to remember these numbers");
      await page.locator(".lx-reminder").getByRole("button", { name: "Ready" }).click();
      const digits = await page.locator(".lx-numbers-show .lx-number").allTextContents();
      expect(digits).toHaveLength(3);
      await expect(page.locator(".lx-keypad")).toHaveCount(0);
      await expect(page.locator(".lx-keypad")).toBeVisible({ timeout: 16_000 });
      for (const d of digits) await page.getByRole("button", { name: `Digit ${d}`, exact: true }).click();
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      await expect(page.getByTestId("level-one-feedback")).toContainText("Well done");
      await expect(page.locator(".lx-tracker .is-correct")).toHaveCount(i + 1);
      await page.getByRole("button", { name: i === 4 ? "See results" : "Next", exact: true }).click();
    }
    await expect(page.getByText("5 / 5").first()).toBeVisible();
  });

  test("E2E-WM-04: Level map shows only the placed levels unlocked, in English and Sinhala", async ({ page, request }) => {
    describeCase({ requirement: "Placement shown in the level map; bilingual UI", expected: "Level 1 open, Levels 2-4 locked; Sinhala heading after switching", priority: "Medium" });
    const s = await createStudent(request);
    await placeAtLevelOne(request, s);
    await signInBrowser(page, s);
    await page.goto("/improvement-wm/3");
    await expect(page.getByRole("button", { name: "Level 1", exact: true })).toBeVisible();
    for (const n of [2, 3, 4]) await expect(page.getByRole("button", { name: `Level ${n}, locked` })).toBeVisible();
    await page.getByRole("button", { name: "සිං" }).click();
    await expect(page.getByRole("heading", { name: "ක්‍රියාකාරී මතකය වැඩිදියුණු කිරීම" })).toBeVisible();
  });
});
