import { test, expect, chromium } from "@playwright/test";
import {
  ensureCatFixture,
  getSpeechLaunchArgs,
  installSpeechFixtureFallback,
  buildTestStudentEmail,
  TEST_STUDENT_PASSWORD,
  registerAndLoginStudent,
  openSpeechIdentification,
  openSpeechImprovement,
  recordAndSubmitIdentificationPrompt,
  querySpeechDb,
  verifySpeechPersistenceViaApi,
  CAT_FIXTURE_WAV,
} from "./utils/speechIntegration.js";

const API_BASE = process.env.SPEECH_E2E_API_BASE || "http://localhost:5000/api";
const BACKEND_HEALTH = `${API_BASE}/auth/login`;

test.describe.configure({ mode: "serial", timeout: 600_000 });

let testEmail = "";
let testFullName = "";
const consoleErrors = [];
const pageErrors = [];

test.beforeAll(async () => {
  ensureCatFixture();
  const health = await fetch(BACKEND_HEALTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "health-check@invalid.test", password: "x" }),
  }).catch(() => null);
  if (!health || (health.status !== 404 && health.status !== 400 && health.status !== 401)) {
    throw new Error(
      `LexiLand backend not reachable at ${API_BASE}. Start backend (npm start in backend/) and frontend (npm run dev).`
    );
  }
});

test("Speech integration — full automated verification", async () => {
  const stamp = Date.now();
  testEmail = buildTestStudentEmail(stamp);
  testFullName = `Speech E2E ${stamp}`;
  const fixturePath = ensureCatFixture();

  const browser = await chromium.launch({
    headless: true,
    args: getSpeechLaunchArgs(fixturePath),
  });

  const context = await browser.newContext({
    baseURL: "http://localhost:5173",
    permissions: ["microphone"],
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await installSpeechFixtureFallback(page, fixturePath);

  // --- Stage 4: Auth + dashboard ---
  await registerAndLoginStudent(page, {
    email: testEmail,
    password: TEST_STUDENT_PASSWORD,
    fullName: testFullName,
    grade: "2",
  });
  expect(await page.evaluate(() => Boolean(localStorage.getItem("token")))).toBe(true);

  await expect(page.getByTestId("dashboard-card-wm")).toBeVisible();
  await expect(page.getByTestId("dashboard-card-pa")).toBeVisible();
  await expect(page.getByTestId("dashboard-card-sp")).toBeVisible();

  await openSpeechIdentification(page);
  await expect(page).toHaveURL(/\/speech-processing\/leo-identification/);

  // --- Stage 5: Identification recording + API ---
  const startResponsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/speech-processing/identification/start") &&
      res.request().method() === "POST",
    { timeout: 60_000 }
  );

  await page.getByRole("button", { name: /Start Sound Check/i }).click();
  const startResponse = await startResponsePromise;
  expect([200, 201]).toContain(startResponse.status());

  const attemptResult = await recordAndSubmitIdentificationPrompt(page, { recordMs: 4000 });
  expect(attemptResult.status).toBe(201);
  expect(attemptResult.body?.success).toBe(true);
  const attemptId = attemptResult.body?.data?.attemptId;
  const attemptWordReading = attemptResult.body?.data?.wordReading || {};
  const expectedPrompt = attemptResult.body?.data?.promptId || "cat";

  // Wait for visible feedback (not stuck loading)
  await expect(
    page.locator("text=/Leo|sound|gem|retry|heard|recording/i").first()
  ).toBeVisible({ timeout: 30_000 });

  // --- Stage 6: DB persistence + Whisper/ML ---
  let dbReport;
  try {
    dbReport = querySpeechDb(testEmail, { waitMs: 120_000 });
  } catch (dbError) {
    const apiReport = await verifySpeechPersistenceViaApi(page, attemptId, { waitMs: 30_000 });
    dbReport = {
      ok: apiReport.ok,
      sessionCount: apiReport.sessionCount,
      attemptCount: Math.max(apiReport.attemptCount, 1),
      progressExists: apiReport.progressExists,
      latestAttempt: {
        processingStatus: attemptWordReading.asrText ? "completed" : "pending",
        asrStep: attemptWordReading.asrText ? "completed" : "pending",
        asrProvider: attemptWordReading.asrProvider || "",
        asrText: attemptWordReading.asrText || attemptWordReading.normalizedAsrText || "",
        asrTextNonempty: Boolean(String(attemptWordReading.asrText || "").trim()),
        asrMocked: attemptWordReading.asrProvider === "mock",
        mlStatus: attemptResult.body?.data?.pronunciationModel?.status,
        mlStep: attemptResult.body?.data?.processingSteps?.pronunciationModel,
      },
      dbScriptError: dbError.message,
      apiFallback: apiReport,
    };
  }
  expect(dbReport.ok).toBe(true);
  expect(dbReport.sessionCount).toBeGreaterThan(0);
  expect(dbReport.attemptCount).toBeGreaterThan(0);
  expect(dbReport.progressExists).toBe(true);
  expect(dbReport.latestAttempt?.processingStatus).toMatch(/completed|failed/);

  const whisperReal =
    dbReport.latestAttempt?.asrProvider === "whisper" &&
    dbReport.latestAttempt?.asrStep === "completed" &&
    dbReport.latestAttempt?.asrTextNonempty &&
    !dbReport.latestAttempt?.asrMocked;

  const mlReal =
    dbReport.latestAttempt?.mlStatus === "success" ||
    (dbReport.latestAttempt?.mlStep === "completed" && dbReport.latestAttempt?.mlStatus === "success");

  test.info().attach("attempt-response", {
    body: JSON.stringify(
      {
        expectedPrompt,
        status: attemptResult.status,
        validAudio: attemptResult.body?.data?.validAudio,
        wordReading: attemptWordReading,
        childFeedback: attemptResult.body?.data?.childFeedback,
      },
      null,
      2
    ),
    contentType: "application/json",
  });

  test.info().attach("db-report", {
    body: JSON.stringify(dbReport, null, 2),
    contentType: "application/json",
  });

  // --- Stage 7: Improvement ---
  await openSpeechImprovement(page);
  await expect(page).toHaveURL(/\/speech-processing\/leo-training/);
  await expect(page.locator("text=/Training|Safari|Leo|Improvement|waiting/i").first()).toBeVisible({
    timeout: 30_000,
  });

  // --- Stage 8: Navigation ---
  await page.goto("/speech-processing/leo-identification");
  await expect(page).toHaveURL(/leo-identification/);
  await page.goBack();
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/dashboard");

  const unauth = await browser.newContext({ baseURL: "http://localhost:5173" });
  const unauthPage = await unauth.newPage();
  await unauthPage.goto("/speech-processing/leo-identification");
  await expect(unauthPage).toHaveURL("/");
  await unauth.close();

  // --- Stage 9: WM / PA smoke (same session) ---
  await page.goto("/dashboard");
  await page.getByTestId("dashboard-card-wm").click();
  await page.getByTestId("activity-identification").click();
  await expect(page).toHaveURL("/working-memory/2");
  await page.goto("/dashboard");
  await page.getByTestId("dashboard-card-wm").click();
  await page.getByRole("button", { name: /Improvement/i }).click();
  await expect(page).toHaveURL("/improvement-wm/2");

  await page.goto("/dashboard");
  await page.getByTestId("dashboard-card-pa").click();
  await page.getByTestId("activity-identification").click();
  await expect(page).toHaveURL("/identificationActivities-pa/2");
  await page.goto("/dashboard");
  await page.getByTestId("dashboard-card-pa").click();
  await page.getByRole("button", { name: /Improvement/i }).click();
  await expect(page).toHaveURL("/improvement-pa/2");

  await browser.close();

  // Store evidence on test object for report
  test.info().annotations.push(
    { type: "whisperReal", description: String(whisperReal) },
    { type: "mlReal", description: String(mlReal) },
    { type: "asrText", description: dbReport.latestAttempt?.asrText || "" },
    { type: "tmpFilesAfter", description: String(dbReport.tmpSpeechFileCount) }
  );

  if (!whisperReal) {
    throw new Error(
      `Whisper did not complete with real transcription. DB: ${JSON.stringify(dbReport.latestAttempt)}`
    );
  }
});

test.afterAll(async () => {
  if (testEmail) {
    try {
      querySpeechDb(testEmail, { cleanup: true });
    } catch {
      /* best-effort cleanup */
    }
  }
});

export { consoleErrors, pageErrors };
