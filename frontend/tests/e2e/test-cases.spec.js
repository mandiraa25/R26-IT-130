import { test, expect } from "@playwright/test";
import { AUTH_FILE } from "./global-setup";
import { makeStepper } from "./utils/screenshot";

/**
 * Formal test-case suite for the sign-up -> sign-in -> Working Memory
 * Identification flow, split into Positive / Negative / Edge cases.
 * Every test captures numbered screenshots of each step into
 * test-results/screenshots/<category>/<test-name>/ — a visual record of the
 * run, not just failure artifacts.
 */

async function fillRegisterForm(page, { fullName, age = "9", email, password, grade = "2" }) {
  await page.goto("/register");
  await page.locator('input[name="fullName"]').fill(fullName);
  await page.locator('input[name="age"]').fill(age);
  await page.locator('input[name="email"]').fill(email);
  if (grade) await page.locator('select[name="grade"]').selectOption(grade);
  await page.locator('input[name="password"]').fill(password);
}

const uniqueEmail = (tag) => `playwright.${tag}.${Date.now()}.${Math.floor(Math.random() * 1e4)}@test.com`;

// ---------------------------------------------------------------------------
// POSITIVE
// ---------------------------------------------------------------------------
test.describe("Positive test cases", () => {
  test("TC-REG-P01 — register with valid data succeeds and redirects to sign in", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "positive");
    const email = uniqueEmail("reg-p01");

    await fillRegisterForm(page, { fullName: "Amara Perera", email, password: "TestPass123!", grade: "2" });
    await shot(page, "form-filled");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await shot(page, "redirected-to-sign-in");
  });

  test("TC-LOGIN-P01 — sign in with valid credentials reaches the dashboard", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "positive");
    const email = uniqueEmail("login-p01");
    const password = "TestPass123!";

    await fillRegisterForm(page, { fullName: "Nadeesha Silva", email, password, grade: "3" });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/");

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await shot(page, "login-form-filled");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Nadeesha Silva")).toBeVisible();
    await shot(page, "dashboard-loaded");
  });

  test.describe("authenticated", () => {
    test.use({ storageState: AUTH_FILE });

    test("TC-WM-P01 — correct answer is scored correct and reaches the results screen", async ({ page }, testInfo) => {
      const shot = makeStepper(testInfo, "positive");

      // Single deterministic Pattern question (correct option is the red circle).
      await page.goto("/working-memory/2?demo=true&ids=wm-g2-1");
      await shot(page, "question-shown");

      await page.waitForTimeout(3300);
      await shot(page, "answer-phase");
      await page.getByTestId("wm-pattern-option").filter({ hasText: "🔴" }).click();

      await expect(page.getByTestId("wm-finished")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("wm-final-score")).toHaveText("45");
      await shot(page, "results-correct-answer");
    });
  });
});

// ---------------------------------------------------------------------------
// NEGATIVE
// ---------------------------------------------------------------------------
test.describe("Negative test cases", () => {
  test("TC-REG-N01 — registering with an already-used email is rejected", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "negative");
    const email = uniqueEmail("reg-n01");
    const password = "TestPass123!";

    await fillRegisterForm(page, { fullName: "First Account", email, password });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/");

    await fillRegisterForm(page, { fullName: "Duplicate Account", email, password });
    await shot(page, "duplicate-email-form-filled");

    const dialogMessage = new Promise((resolve) => page.once("dialog", (dialog) => {
      resolve(dialog.message());
      dialog.accept();
    }));
    await page.getByRole("button", { name: "Create Account" }).click();

    expect(await dialogMessage).toMatch(/already exists/i);
    await expect(page).toHaveURL("/register");
    await shot(page, "stays-on-register-with-error");
  });

  test("TC-REG-N02 — missing full name blocks submission client-side", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "negative");

    await fillRegisterForm(page, { fullName: "", email: uniqueEmail("reg-n02"), password: "TestPass123!" });
    await shot(page, "full-name-left-empty");

    await page.getByRole("button", { name: "Create Account" }).click();
    await shot(page, "blocked-still-on-register");

    await expect(page).toHaveURL("/register");
    const isValid = await page.locator('input[name="fullName"]').evaluate((el) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test("TC-REG-N03 — no grade selected blocks submission client-side", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "negative");

    await fillRegisterForm(page, { fullName: "No Grade Picked", email: uniqueEmail("reg-n03"), password: "TestPass123!", grade: null });
    await shot(page, "grade-left-unselected");

    await page.getByRole("button", { name: "Create Account" }).click();
    await shot(page, "blocked-still-on-register");

    await expect(page).toHaveURL("/register");
    const isValid = await page.locator('select[name="grade"]').evaluate((el) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test("TC-LOGIN-N01 — wrong password is rejected with an error", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "negative");
    const email = uniqueEmail("login-n01");

    await fillRegisterForm(page, { fullName: "Wrong Password Test", email, password: "CorrectPass123!" });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/");

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("WrongPassword999!");
    await shot(page, "wrong-password-entered");

    const dialogMessage = new Promise((resolve) => page.once("dialog", (dialog) => {
      resolve(dialog.message());
      dialog.accept();
    }));
    await page.getByRole("button", { name: "Sign In" }).click();

    expect(await dialogMessage).toMatch(/invalid credentials/i);
    await expect(page).toHaveURL("/");
    await shot(page, "stays-on-login-with-error");
  });

  test("TC-LOGIN-N02 — non-existent email is rejected with an error", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "negative");

    await page.goto("/");
    await page.locator('input[name="email"]').fill(uniqueEmail("never-registered"));
    await page.locator('input[name="password"]').fill("SomePassword123!");
    await shot(page, "unknown-email-entered");

    const dialogMessage = new Promise((resolve) => page.once("dialog", (dialog) => {
      resolve(dialog.message());
      dialog.accept();
    }));
    await page.getByRole("button", { name: "Sign In" }).click();

    expect(await dialogMessage).toMatch(/user not found/i);
    await expect(page).toHaveURL("/");
    await shot(page, "stays-on-login-with-error");
  });

  test("TC-AUTH-N01 — visiting a protected page while logged out redirects to sign in", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "negative");

    await page.goto("/dashboard");
    await shot(page, "attempted-dashboard-while-logged-out");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await shot(page, "redirected-to-sign-in");
  });

  test.describe("authenticated", () => {
    test.use({ storageState: AUTH_FILE });

    test("TC-AUTH-N02 — an already-signed-in user visiting /register is redirected to the dashboard", async ({ page }, testInfo) => {
      const shot = makeStepper(testInfo, "negative");

      await page.goto("/register");
      await shot(page, "attempted-register-while-logged-in");

      await expect(page).toHaveURL("/dashboard");
      await shot(page, "redirected-to-dashboard");
    });

    test("TC-WM-N01 — wrong answer is scored incorrect but still reaches the results screen", async ({ page }, testInfo) => {
      const shot = makeStepper(testInfo, "negative");

      await page.goto("/working-memory/2?demo=true&ids=wm-g2-1");
      await page.waitForTimeout(3300);
      await shot(page, "answer-phase");

      // Correct answer is the red circle; deliberately tap the wrong option.
      await page.getByTestId("wm-pattern-option").filter({ hasText: "🔵" }).click();

      await expect(page.getByTestId("wm-finished")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("wm-final-score")).toHaveText("10");
      await shot(page, "results-wrong-answer");
    });
  });
});

// ---------------------------------------------------------------------------
// EDGE CASES
// ---------------------------------------------------------------------------
test.describe("Edge cases", () => {
  test("TC-REG-E01 — an unusually long full name is accepted without validation or a crash", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "edge");
    const longName = "A".repeat(300);

    await fillRegisterForm(page, { fullName: longName, email: uniqueEmail("reg-e01"), password: "TestPass123!" });
    await shot(page, "300-char-name-filled");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL("/", { timeout: 10_000 });
    await shot(page, "registration-succeeded-no-length-limit");
  });

  test("TC-REG-E02 — a boundary age value (1) is accepted without range validation", async ({ page }, testInfo) => {
    const shot = makeStepper(testInfo, "edge");

    await fillRegisterForm(page, { fullName: "Boundary Age", age: "1", email: uniqueEmail("reg-e02"), password: "TestPass123!" });
    await shot(page, "age-1-filled");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL("/", { timeout: 10_000 });
    await shot(page, "registration-succeeded-no-age-range-check");
  });

  test.describe("authenticated", () => {
    test.use({ storageState: AUTH_FILE });

    test("TC-WM-E01 — an unsupported grade in the URL never crashes, but never resolves either", async ({ page }, testInfo) => {
      const shot = makeStepper(testInfo, "edge");

      await page.goto("/working-memory/9");
      await shot(page, "loaded-with-invalid-grade");

      // No quiz data exists for grade 9, so the app is expected to sit on its
      // loading state indefinitely rather than crash or silently redirect.
      await page.waitForTimeout(3000);
      await expect(page.getByText(/Powering up memory module/i)).toBeVisible();
      await shot(page, "stuck-on-loading-state");
    });
  });
});
