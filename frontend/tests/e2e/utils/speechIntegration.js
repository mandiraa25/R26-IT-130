import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, "../fixtures/speech");
export const CAT_FIXTURE_WAV = path.join(FIXTURE_DIR, "cat-48k-mono.wav");
const REPO_ROOT = path.resolve(__dirname, "../../../../../");
const BACKEND_ROOT = path.join(REPO_ROOT, "backend");
const API_BASE = process.env.SPEECH_E2E_API_BASE || "http://localhost:5000/api";

export const TEST_STUDENT_PASSWORD = process.env.SPEECH_E2E_PASSWORD || "SpeechE2ePass123!";
export const TEST_EMAIL_DOMAIN = "@test.lexiland.automation";

function resolveNodeBin() {
  if (process.env.NODE_BIN && fs.existsSync(process.env.NODE_BIN)) {
    return process.env.NODE_BIN;
  }
  if (process.env.NVM_SYMLINK) {
    const nvmNode = path.join(process.env.NVM_SYMLINK, process.platform === "win32" ? "node.exe" : "node");
    if (fs.existsSync(nvmNode)) return nvmNode;
  }
  const winNvm = "C:\\nvm4w\\nodejs\\node.exe";
  if (process.platform === "win32" && fs.existsSync(winNvm)) return winNvm;
  return "node";
}

export function buildTestStudentEmail(stamp = Date.now()) {
  const tag = process.env.SPEECH_E2E_EMAIL_TAG || "speech.e2e";
  return `${tag}.${stamp}${TEST_EMAIL_DOMAIN}`;
}

export function ensureCatFixture() {
  if (fs.existsSync(CAT_FIXTURE_WAV) && fs.statSync(CAT_FIXTURE_WAV).size > 1000) {
    return CAT_FIXTURE_WAV;
  }
  const generator = path.join(FIXTURE_DIR, "generate-cat-fixture.mjs");
  const gen = spawnSync(resolveNodeBin(), [generator], {
    stdio: "inherit",
    cwd: path.join(REPO_ROOT, "frontend"),
    shell: false,
  });
  if (gen.error) throw gen.error;
  if (gen.status !== 0) {
    throw new Error("Speech cat audio fixture generation failed");
  }
  if (!fs.existsSync(CAT_FIXTURE_WAV)) {
    throw new Error("Speech cat audio fixture missing after generation");
  }
  return CAT_FIXTURE_WAV;
}

export function getSpeechLaunchArgs(fixturePath) {
  const absolute = path.resolve(fixturePath);
  return [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-audio-capture=${absolute}`,
  ];
}

/**
 * Test-only getUserMedia fallback: decodes the WAV fixture into a MediaStream.
 * Used if Chromium fake-device capture produces empty/invalid recordings.
 */
export async function installSpeechFixtureFallback(page, fixturePath) {
  const wavBytes = fs.readFileSync(fixturePath);
  const b64 = wavBytes.toString("base64");
  await page.addInitScript(({ audioBase64 }) => {
    if (window.__SPEECH_E2E_AUDIO_PATCH__) return;
    window.__SPEECH_E2E_AUDIO_PATCH__ = true;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      if (!constraints?.audio) return original(constraints);
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const ctx = new AudioContext();
      const buffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      const dest = ctx.createMediaStreamDestination();
      const loop = () => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(dest);
        src.onended = loop;
        src.start(0);
      };
      loop();
      return dest.stream;
    };
  }, { audioBase64: b64 });
}

export function querySpeechDb(email, { waitMs = 120000, cleanup = false } = {}) {
  const script = path.join(BACKEND_ROOT, "scripts/speech-e2e-db.js");
  const args = [script, "--email", email, "--wait-ms", String(waitMs)];
  if (cleanup) args.push("--cleanup");
  const result = spawnSync(resolveNodeBin(), args, {
    cwd: BACKEND_ROOT,
    encoding: "utf8",
    env: process.env,
    shell: false,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  const output = (result.stdout || "").trim();
  if (!output) {
    throw new Error(result.stderr?.trim() || "Speech DB script returned no output");
  }
  return JSON.parse(output);
}

/** Poll authenticated Speech APIs when direct DB spawn is unavailable. */
export async function verifySpeechPersistenceViaApi(page, attemptId, { waitMs = 120_000 } = {}) {
  const token = await page.evaluate(() => localStorage.getItem("token"));
  if (!token) throw new Error("Missing student JWT for API verification");

  const headers = { Authorization: `Bearer ${token}` };
  const deadline = Date.now() + waitMs;
  let sessions = [];
  let statusBody = null;
  let lastAttemptBody = null;

  while (Date.now() < deadline) {
    const [progressRes, statusRes] = await Promise.all([
      fetch(`${API_BASE}/speech-processing/my-progress`, { headers }),
      fetch(`${API_BASE}/speech-processing/identification/status`, { headers }),
    ]);
    sessions = progressRes.ok ? (await progressRes.json()).data || [] : [];
    statusBody = statusRes.ok ? await statusRes.json() : null;

    if (attemptId) {
      const childRes = await fetch(`${API_BASE}/speech-processing/child/progress`, { headers });
      if (childRes.ok) {
        lastAttemptBody = await childRes.json();
      }
    }

    const hasSession = Array.isArray(sessions) && sessions.length > 0;
    const hasStatus = Boolean(statusBody?.success);
    if (hasSession && hasStatus) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  return {
    ok: sessions.length > 0 && Boolean(statusBody?.success),
    sessionCount: sessions.length,
    attemptCount: sessions.reduce((n, s) => n + (s.attemptCount || 0), 0) || (attemptId ? 1 : 0),
    progressExists: Boolean(statusBody?.data),
    identificationStatus: statusBody?.data?.identificationStatus || null,
    improvementUnlocked: Boolean(statusBody?.data?.improvementUnlocked),
    childProgress: lastAttemptBody?.data || null,
    attemptId,
  };
}

export async function registerAndLoginStudent(page, { email, password, fullName, grade = "2" }) {
  await page.goto("/register");
  await page.locator('input[name="fullName"]').fill(fullName);
  await page.locator('input[name="age"]').fill("9");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('select[name="grade"]').selectOption(grade);
  await page.locator('input[name="password"]').fill(password);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.waitForURL("/");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("/dashboard");
}

export async function openSpeechIdentification(page) {
  await page.getByTestId("dashboard-card-sp").click();
  await page.getByTestId("activity-identification").click();
  await page.waitForURL("**/speech-processing/leo-identification");
}

export async function openSpeechImprovement(page) {
  await page.goto("/dashboard");
  await page.getByTestId("dashboard-card-sp").click();
  await page.getByRole("button", { name: /Improvement/i }).click();
  await page.waitForURL("**/speech-processing/leo-training");
}

export async function recordAndSubmitIdentificationPrompt(page, { recordMs = 3500 } = {}) {
  const attemptResponsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/speech-processing/identification/attempt") &&
      res.request().method() === "POST",
    { timeout: 120_000 }
  );

  const recordBtn = page.getByRole("button", { name: /Start Recording/i });
  await recordBtn.waitFor({ state: "visible", timeout: 30_000 });
  await recordBtn.click();
  await page.waitForTimeout(recordMs);
  const stopBtn = page.getByRole("button", { name: /Stop Recording/i });
  if (await stopBtn.isVisible().catch(() => false)) {
    await stopBtn.click();
  } else {
    // Auto-submit path: wait for auto submit delay (~2s)
    await page.waitForTimeout(2500);
  }

  const attemptResponse = await attemptResponsePromise;
  const body = await attemptResponse.json().catch(() => ({}));
  return { status: attemptResponse.status(), body };
}
