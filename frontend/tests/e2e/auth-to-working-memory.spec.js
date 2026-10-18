import { test, expect } from "@playwright/test";

/**
 * Answers whatever question is currently on screen in the Working Memory
 * "Identify" quiz. Each question runs a fixed show(2s) -> blur(1s) -> answer
 * timer before any answer UI is interactable, then renders one of three
 * answer layouts depending on question type:
 *   - Pattern multiple-choice buttons
 *   - Sequence/Word multiple-choice buttons
 *   - Drag-and-drop word/number/instruction picker with a submit button
 * We don't care about getting answers "correct" here, just exercising the
 * full interaction so the quiz can be driven end to end.
 */
async function answerCurrentQuestion(page) {
  await page.waitForTimeout(3300);

  const submitBtn = page.getByTestId("wm-submit-answer");
  if (await submitBtn.count()) {
    const poolItems = page.getByTestId("wm-pool-item");
    const count = await poolItems.count();
    for (let i = 0; i < count; i++) {
      await poolItems.nth(i).click();
    }
    await submitBtn.click();
    return;
  }

  const patternOptions = page.getByTestId("wm-pattern-option");
  if (await patternOptions.count()) {
    await patternOptions.first().click();
    return;
  }

  await page.getByTestId("wm-choice-option").first().click();
}

test("sign up, sign in, and complete a Working Memory identification quiz", async ({ page }) => {
  const stamp = Date.now();
  const email = `playwright.${stamp}@test.com`;
  const password = "TestPass123!";
  const fullName = `Playwright Tester ${stamp}`;

  // ---- Sign up ----
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

  await page.locator('input[name="fullName"]').fill(fullName);
  await page.locator('input[name="age"]').fill("9");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('select[name="grade"]').selectOption("2");
  await page.locator('input[name="password"]').fill(password);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();

  // ---- Sign in ----
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText(fullName)).toBeVisible({ timeout: 10_000 });

  // ---- Dashboard -> Working Memory -> Identification ----
  await page.getByTestId("dashboard-card-wm").click();
  await expect(page.getByTestId("activity-identification")).toBeVisible();
  await page.getByTestId("activity-identification").click();

  await expect(page).toHaveURL("/working-memory/2");

  await expect(page.getByTestId("wm-identify-welcome")).toBeVisible();
  await page.getByTestId("wm-identify-start-test").click();
  await expect(page.getByTestId("wm-identify-briefing")).toBeVisible();
  await page.getByTestId("wm-identify-ready").click();

  // ---- Play through the identification quiz ----
  let guard = 0;
  while (guard < 25) {
    guard++;
    if (await page.getByTestId("wm-finished").isVisible().catch(() => false)) break;
    await answerCurrentQuestion(page);
  }

  await expect(page.getByTestId("wm-finished")).toBeVisible({ timeout: 15_000 });
  const scoreText = await page.getByTestId("wm-final-score").textContent();
  expect(Number(scoreText)).toBeGreaterThanOrEqual(0);

  // ---- Back to dashboard ----
  await page.getByTestId("wm-back-home").click();
  await expect(page).toHaveURL("/dashboard");
});
