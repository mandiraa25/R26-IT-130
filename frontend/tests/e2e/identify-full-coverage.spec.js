import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";
import { makeStepper } from "./utils/screenshot";
import { answerIdentifyQuestion } from "./utils/identifyAnswer";
import { QUIZ_DATA } from "../../src/features/workingMemory/identification/data";

/**
 * Full-coverage browser suite: every Identification quiz question, in every
 * grade and both languages, driven twice through the real UI — once
 * submitting the correct answer, once submitting a wrong one — using
 * `?demo=true&ids=<id>` to jump straight to that one question instead of
 * playing the whole 15-question quiz just to reach it.
 */

test.describe("Identify quiz — full question coverage", () => {
  test.use({ storageState: AUTH_FILE });

  for (const grade of Object.keys(QUIZ_DATA)) {
    for (const lang of Object.keys(QUIZ_DATA[grade])) {
      for (const q of QUIZ_DATA[grade][lang]) {
        for (const mode of ["correct", "wrong"]) {
          test(`TC-ID-G${grade}-${lang}-${q.id}-${mode} (${q.category})`, async ({ page }, testInfo) => {
            const shot = makeStepper(testInfo, ["identify", `grade${grade}`, lang]);

            await page.addInitScript((l) => localStorage.setItem("i18nextLng", l), lang);
            await page.goto(`/working-memory/${grade}?demo=true&ids=${q.id}`);
            await shot(page, "question-shown");

            await page.waitForTimeout(3300);
            await shot(page, "answer-phase");

            await answerIdentifyQuestion(page, q, mode);

            await expect(page.getByTestId("wm-finished")).toBeVisible({ timeout: 10_000 });
            await shot(page, `results-${mode}`);
          });
        }
      }
    }
  }
});
