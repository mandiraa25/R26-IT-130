import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_FILE = path.join(process.cwd(), "tests/e2e/.auth/user.json");

const BASE_URL = "http://localhost:5173";

export default async function globalSetup() {
  const baseURL = BASE_URL;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const stamp = Date.now();
  const email = `playwright.smoke.${stamp}@test.com`;
  const password = "TestPass123!";
  const fullName = `Playwright Smoke ${stamp}`;

  await page.goto(`${baseURL}/register`);
  await page.locator('input[name="fullName"]').fill(fullName);
  await page.locator('input[name="age"]').fill("9");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('select[name="grade"]').selectOption("2");
  await page.locator('input[name="password"]').fill(password);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.waitForURL(`${baseURL}/`);

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(`${baseURL}/dashboard`);

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await context.storageState({ path: AUTH_FILE });

  await browser.close();
}

export { AUTH_FILE };
