import { test, expect } from "@playwright/test";
import { makeStepper } from "./utils/screenshot";
import { answerIdentifyQuestion, exactText, escapeRegExp } from "./utils/identifyAnswer";
import { QUIZ_DATA } from "../../src/pages/workingMemory/quizData";
import { getSubCategoryData } from "../../src/pages/workingMemory/data/improvement";
import { getLevelDisplaySeconds, SUBCATEGORY_ORDER, VALID_LEVELS } from "../../src/pages/workingMemory/data/improvement/config";

/**
 * Full-coverage browser suite for the Improvement games — one grade,
 * English only (see the QA report for why: progress unlocks are tracked
 * per student account, one grade per account, with no per-question
 * shortcut like Identify's ?demo=true, so this is the practical ceiling for
 * real-browser coverage without hours of sequential level-unlocking).
 *
 * Runs as a single long test because every subcategory's session depends on
 * unlock state left behind by the previous one. Scoped to a subset via
 * WM_ONLY=1:pattern,2:words for local iteration; unset runs all 16
 * level/subcategory combinations x 2 modes (correct, wrong) = 32 sessions.
 */

const GRADE = "2";
const LANG = "en";
const ONLY = process.env.WM_ONLY
  ? new Set(process.env.WM_ONLY.split(",").map((s) => s.trim()))
  : null;

test.setTimeout(45 * 60 * 1000);

async function registerAndLogin(page, { fullName, email, password, grade }) {
  await page.goto("/register");
  await page.locator('input[name="fullName"]').fill(fullName);
  await page.locator('input[name="age"]').fill("9");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('select[name="grade"]').selectOption(grade);
  await page.locator('input[name="password"]').fill(password);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL("/");

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");
}

// Answering every Identify question correctly pushes the account's initial
// risk assessment to "Low", which unlocks all 4 Improvement levels
// immediately instead of just level 1 — letting each level's 4
// subcategories be exercised independently.
async function completeIdentifyQuizAllCorrect(page, grade, lang) {
  await page.goto(`/working-memory/${grade}`);
  for (const q of QUIZ_DATA[grade][lang]) {
    await page.waitForTimeout(3300);
    await answerIdentifyQuestion(page, q, "correct");
  }
  await expect(page.getByTestId("wm-finished")).toBeVisible({ timeout: 15_000 });
}

const ACTION_TIMEOUT = 15_000;

const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// Pattern, Numbers, and Instructions all get their question order shuffled
// client-side on every startQuiz() (see ImprovementActivityWM.jsx) — only
// Words keeps its fetched order. So instead of trusting questions[i], each
// question is identified by what's actually rendered during its "show"
// phase, then matched back to its data entry to know the real answer.
async function identifyByShowItems(page, tileSelector, questions) {
  const shown = await page.locator(tileSelector).allTextContents();
  const match = questions.find((q) => sameList(q.showItems, shown));
  if (!match) throw new Error(`Could not match displayed question tiles [${shown.join(", ")}] to any known question`);
  return match;
}

async function identifyByInstructionText(page, questions) {
  const shown = (await page.locator(".speech").first().textContent())?.trim();
  const match = questions.find((q) => q.instruction.trim() === shown);
  if (!match) throw new Error(`Could not match displayed instruction "${shown}" to any known question`);
  return match;
}

async function playSubcategorySession(page, { subCategoryKey, level, mode, questions, shot }) {
  await page.locator(".how-video-skip").click({ timeout: ACTION_TIMEOUT });
  await shot(page, "video-skipped");
  await page.getByRole("button", { name: /Start|Ready to Play/i }).click({ timeout: ACTION_TIMEOUT });
  await shot(page, "intro-ready");

  const waitMs = subCategoryKey === "words" ? 10_800 : getLevelDisplaySeconds(level) * 1000 + 800;

  for (let i = 0; i < questions.length; i++) {
    const label = `q${i + 1}`;

    if (subCategoryKey === "pattern") {
      await page.locator(".pattern-sequence-panel").waitFor({ state: "visible", timeout: ACTION_TIMEOUT });
      const q = await identifyByShowItems(page, ".pattern-sequence-tile", questions);
      await page.waitForTimeout(waitMs);
      await shot(page, `${label}-answer-phase`);
      const pool = q.options || q.dragPool || [];
      const target = mode === "correct" ? q.missingAnswer : pool.find((o) => o !== q.missingAnswer);
      await page.locator(".pattern-choice-tile").filter({ hasText: exactText(target) }).first().click({ timeout: ACTION_TIMEOUT });
      await page.getByTestId("wm-pattern-confirm").click({ timeout: ACTION_TIMEOUT });
      await page.waitForTimeout(300);
      await shot(page, `${label}-feedback`);
      await page.locator(".pattern-next-button").click({ timeout: ACTION_TIMEOUT });
    }

    if (subCategoryKey === "numbers") {
      await page.locator(".number-sequence-panel").waitFor({ state: "visible", timeout: ACTION_TIMEOUT });
      const q = await identifyByShowItems(page, ".number-sequence-panel .level-number-circle--large", questions);
      await page.waitForTimeout(waitMs);
      await shot(page, `${label}-answer-phase`);
      const seq = mode === "correct" ? q.correct : [...q.correct].reverse();
      for (const value of seq) {
        await page.locator(".number-choice-panel button").filter({ hasText: exactText(value) }).first().click({ timeout: ACTION_TIMEOUT });
      }
      await page.locator(".number-submit-button").click({ timeout: ACTION_TIMEOUT });
      await page.waitForTimeout(300);
      await shot(page, `${label}-feedback`);
      await page.locator(".number-next-button").click({ timeout: ACTION_TIMEOUT });
    }

    if (subCategoryKey === "instructions") {
      await page.locator(".speech").first().waitFor({ state: "visible", timeout: ACTION_TIMEOUT });
      const q = await identifyByInstructionText(page, questions);
      await page.getByRole("button", { name: /I'm Ready/i }).click({ timeout: ACTION_TIMEOUT });
      await shot(page, `${label}-answer-phase`);
      const target = mode === "correct" ? q.correct : q.options.find((o) => o !== q.correct);
      await page.getByRole("button", { name: new RegExp(escapeRegExp(target)) }).click({ timeout: ACTION_TIMEOUT });
      await page.getByRole("button", { name: "Submit Answers!" }).click({ timeout: ACTION_TIMEOUT });
      await page.waitForTimeout(300);
      await shot(page, `${label}-feedback`);
      await page.getByRole("button", { name: /Next Question|Finish/ }).click({ timeout: ACTION_TIMEOUT });
    }

    if (subCategoryKey === "words") {
      // Words is the one subcategory the app does NOT shuffle, so questions[i] is reliable here.
      const q = questions[i];
      await page.getByRole("button", { name: /Play/i }).click({ timeout: ACTION_TIMEOUT });
      await page.waitForTimeout(waitMs);
      await shot(page, `${label}-answer-phase`);
      const seq = mode === "correct" ? q.correct : [...q.correct].reverse();
      for (let slotIdx = 0; slotIdx < seq.length; slotIdx++) {
        const source = page.locator(`.words-drag-pool [data-item-id="${seq[slotIdx].id}"]`).first();
        const dropTarget = page.locator(".words-answer-slots > div").nth(slotIdx);
        // force: true — the card's CSS 3D flip leaves its (visually hidden)
        // back face intercepting pointer-event hit-testing at the same spot.
        await source.dragTo(dropTarget, { timeout: ACTION_TIMEOUT, force: true });
      }
      await page.locator(".words-submit-button").click({ timeout: ACTION_TIMEOUT });
      await page.waitForTimeout(300);
      await shot(page, `${label}-feedback`);
      await page.locator(".words-next-button").click({ timeout: ACTION_TIMEOUT });
    }
  }

  await page.waitForTimeout(500);
  await shot(page, "result");
}

test("Improvement games — grade 2, English, all levels and subcategories", async ({ page }) => {
  const stamp = Date.now();
  const email = `playwright.improve.${stamp}@test.com`;

  await registerAndLogin(page, {
    fullName: `Improvement Coverage ${stamp}`,
    email,
    password: "TestPass123!",
    grade: GRADE,
  });

  await completeIdentifyQuizAllCorrect(page, GRADE, LANG);

  for (const level of VALID_LEVELS) {
    for (const subCategoryKey of SUBCATEGORY_ORDER) {
      const key = `${level}:${subCategoryKey}`;
      if (ONLY && !ONLY.has(key)) continue;

      const data = getSubCategoryData(GRADE, level, subCategoryKey, LANG);
      const questions = data?.questions || [];
      if (!questions.length) continue;

      for (const mode of ["correct", "wrong"]) {
        await page.goto(`/improvement-activity-wm/${GRADE}/${level}/${subCategoryKey}`);
        const shot = makeStepper(
          { title: `level${level}-${subCategoryKey}-${mode}` },
          ["improvement", `grade${GRADE}`, LANG]
        );
        await shot(page, "loaded");
        await playSubcategorySession(page, { subCategoryKey, level, mode, questions, shot });
      }
    }
  }
});
