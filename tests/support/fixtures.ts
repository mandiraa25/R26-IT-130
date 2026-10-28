import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import { API_URL, APP_API_URL, VALID_PASSWORD, uniqueEmail, type Annotation } from "./env";

export type Student = { email: string; password: string; token: string; studentId: string; fullName: string; grade: string };

// Adds requirement / expected result / priority to the HTML and JSON reports.
export function describeCase(info: Annotation) {
  const { annotations } = base.info();
  annotations.push({ type: "requirement", description: info.requirement });
  annotations.push({ type: "expected", description: info.expected });
  annotations.push({ type: "priority", description: info.priority });
}

// Registers a fresh test student through the real API and signs in.
export async function createStudent(request: APIRequestContext, overrides: Partial<{ fullName: string; age: number; grade: string }> = {}): Promise<Student> {
  const email = uniqueEmail("student");
  const body = { fullName: "Test Explorer", age: 8, grade: "3", ...overrides, email, password: VALID_PASSWORD };
  const register = await request.post(`${API_URL}/auth/register/student`, { data: body });
  expect(register.status(), await register.text()).toBe(201);
  const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: VALID_PASSWORD } });
  expect(login.status()).toBe(200);
  const data = await login.json();
  return { email, password: VALID_PASSWORD, token: data.token, studentId: data.userId, fullName: body.fullName, grade: body.grade };
}

export const authHeader = (student: Student) => ({ Authorization: `Bearer ${student.token}` });

// Signs the student in inside the browser the way Login.jsx does.
export async function signInBrowser(page: Page, student: Student) {
  await page.addInitScript(({ token, studentId }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", "student");
    localStorage.setItem("studentId", studentId);
  }, { token: student.token, studentId: student.studentId });
}

// Browser speech and media never finish in a headless browser; end them quickly so
// timed game phases (which wait for audio) can continue. App logic is unchanged.
export async function fastAudio(page: Page) {
  await page.addInitScript(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.speak = (utterance: SpeechSynthesisUtterance) => {
        setTimeout(() => utterance.onstart?.(new Event("start") as SpeechSynthesisEvent), 10);
        setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 250);
      };
      synth.cancel = () => {};
    }
    HTMLMediaElement.prototype.play = function () { setTimeout(() => this.dispatchEvent(new Event("ended")), 250); return Promise.resolve(); };
  });
}

// The built frontend calls http://localhost:5000/api; send those calls to the test backend.
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    await page.route(`${APP_API_URL}/**`, async route => {
      const url = route.request().url().replace(APP_API_URL, API_URL);
      const response = await route.fetch({ url });
      await route.fulfill({ response });
    });
    await page.route(/youtube(-nocookie)?\.com|youtu\.be/, route => route.abort());
    await use(page);
    // A save still in flight when a test ends must not fail the next test.
    await page.unrouteAll({ behavior: "ignoreErrors" });
  },
});

export { expect };
