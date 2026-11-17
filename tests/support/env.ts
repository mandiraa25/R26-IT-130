// Shared settings for the LexiLand Playwright suite.
export const API_PORT = Number(process.env.LEXILAND_TEST_API_PORT || 5055);
export const APP_PORT = Number(process.env.LEXILAND_TEST_APP_PORT || 5186);
export const API_URL = `http://localhost:${API_PORT}/api`;
export const APP_URL = `http://localhost:${APP_PORT}`;
// The built frontend calls this fixed address; e2e tests redirect it to API_URL.
export const APP_API_URL = "http://localhost:5000/api";
export const TEST_DB = "lexiland_playwright_test";
// Every account the suite creates uses this domain, so teardown can find them.
export const TEST_EMAIL_DOMAIN = "lexiland-test.local";
export const VALID_PASSWORD = "Lexi2026test";

let counter = 0;
export const uniqueEmail = (tag = "user") =>
  `pw-${tag}-${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 6)}@${TEST_EMAIL_DOMAIN}`;

export type Annotation = { requirement: string; expected: string; priority: "High" | "Medium" | "Low" };
