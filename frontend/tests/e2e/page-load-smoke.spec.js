import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";

// Uses the logged-in session captured by global-setup.js so every route
// below can be hit directly without repeating registration/login.
test.use({ storageState: AUTH_FILE });

/**
 * Navigates to a route and confirms it actually rendered rather than
 * crashing: some expected content is visible and no uncaught JS exception
 * was thrown. This intentionally does NOT assert exact copy, since some of
 * these pages legitimately render different states (e.g. locked/denied)
 * depending on server-side progress.
 *
 * Note: most pages use <h1>/<h2>, but the Identify quiz screens (Quest
 * counter, question text) don't use any heading tag at all — only its
 * finished/results screen does — so callers there pass a more specific
 * `readyLocator`.
 */
async function expectPageLoads(page, path, readyLocator = page.locator("h1, h2").first()) {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto(path);
  await expect(readyLocator).toBeVisible({ timeout: 15_000 });

  expect(pageErrors, `Unexpected JS errors on ${path}: ${pageErrors.join(", ")}`).toHaveLength(0);
}

test.describe("Working Memory route smoke tests (page loads without crashing)", () => {
  test("dashboard loads", async ({ page }) => {
    await expectPageLoads(page, "/dashboard");
    await expect(page.getByTestId("dashboard-card-wm")).toBeVisible();
  });

  for (const grade of ["2", "3", "4"]) {
    test(`identification quiz loads for grade ${grade} (English)`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("i18nextLng", "en"));
      // The quiz screen has no heading tag, just a "Quest N / total" counter div.
      await expectPageLoads(page, `/working-memory/${grade}`, page.getByText(/Quest 1/i));
    });

    test(`identification quiz loads for grade ${grade} (Sinhala)`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("i18nextLng", "si"));
      // Sinhala uses the same "N / total" counter shape with a translated label.
      await expectPageLoads(page, `/working-memory/${grade}`, page.getByText(/1\s*\/\s*\d+/));
    });
  }

  for (const grade of ["2", "3", "4"]) {
    test(`improvement levels page loads for grade ${grade}`, async ({ page }) => {
      await expectPageLoads(page, `/improvement-wm/${grade}`);
    });
  }

  test("improvement activity route handles a locked/incomplete state without crashing", async ({ page }) => {
    // This account hasn't completed the identification quiz, so the activity
    // route should render its "denied" guard screen rather than error out.
    await expectPageLoads(page, "/improvement-activity-wm/2/1/pattern");
    await expect(page.getByRole("button", { name: /Identification/i })).toBeVisible();
  });

  test("profile page loads", async ({ page }) => {
    await expectPageLoads(page, "/profile");
  });

  test("reports dashboard loads", async ({ page }) => {
    await expectPageLoads(page, "/reports");
  });

  test("working memory identification report loads", async ({ page }) => {
    await expectPageLoads(page, "/reports/wm/identification");
  });

  test("working memory improvement report loads", async ({ page }) => {
    await expectPageLoads(page, "/reports/wm/improvement");
  });
});
