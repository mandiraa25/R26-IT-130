import { test, expect } from "@playwright/test";
import { API_URL, VALID_PASSWORD, uniqueEmail } from "../../support/env";
import { authHeader, createStudent, describeCase } from "../../support/fixtures";

const student = (overrides: Record<string, unknown> = {}) => ({ fullName: "Api Tester", age: 8, grade: "3", email: uniqueEmail("api"), password: VALID_PASSWORD, ...overrides });

test.describe("Common › API › Sign up", () => {
  test("API-COM-01: Sign up with valid details returns 201 and a token", async ({ request }) => {
    describeCase({ requirement: "Students can create an account", expected: "201 with a JWT", priority: "High" });
    const res = await request.post(`${API_URL}/auth/register/student`, { data: student() });
    expect(res.status()).toBe(201);
    expect((await res.json()).token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  test("API-COM-02: Duplicate email is rejected", async ({ request }) => {
    describeCase({ requirement: "One account per email", expected: "Second sign-up with the same email returns 400", priority: "High" });
    const body = student();
    expect((await request.post(`${API_URL}/auth/register/student`, { data: body })).status()).toBe(201);
    const again = await request.post(`${API_URL}/auth/register/student`, { data: { ...body, email: body.email.toUpperCase() } });
    expect(again.status()).toBe(400);
    expect((await again.json()).errors).toHaveProperty("email");
  });

  test("API-COM-03: Empty fields are rejected with a message for each field", async ({ request }) => {
    describeCase({ requirement: "Required fields", expected: "400 listing fullName, age, grade, email, password", priority: "High" });
    const res = await request.post(`${API_URL}/auth/register/student`, { data: {} });
    expect(res.status()).toBe(400);
    expect(Object.keys((await res.json()).errors).sort()).toEqual(["age", "email", "fullName", "grade", "password"]);
  });

  for (const [id, label, change, field] of [
    ["API-COM-04", "negative age", { age: -2 }, "age"],
    ["API-COM-05", "age above 9", { age: 10 }, "age"],
    ["API-COM-06", "grade outside 2-4", { grade: "5" }, "grade"],
    ["API-COM-07", "invalid email", { email: "not-an-email" }, "email"],
    ["API-COM-08", "weak password", { password: "short1" }, "password"],
  ] as const) {
    test(`${id}: Sign up with ${label} is rejected`, async ({ request }) => {
      describeCase({ requirement: "Server-side sign-up validation", expected: `400 with an error on ${field}`, priority: "High" });
      const res = await request.post(`${API_URL}/auth/register/student`, { data: student(change) });
      expect(res.status()).toBe(400);
      expect((await res.json()).errors).toHaveProperty(field);
    });
  }

  test("API-COM-09: Sinhala full name is accepted", async ({ request }) => {
    describeCase({ requirement: "Bilingual Sinhala-English users", expected: "201 for a Sinhala name; profile returns the same name", priority: "Medium" });
    const body = student({ fullName: "නිමල් පෙරේරා" });
    expect((await request.post(`${API_URL}/auth/register/student`, { data: body })).status()).toBe(201);
    const login = await (await request.post(`${API_URL}/auth/login`, { data: { email: body.email, password: body.password } })).json();
    const profile = await (await request.get(`${API_URL}/students/profile`, { headers: { Authorization: `Bearer ${login.token}` } })).json();
    expect(profile.fullName).toBe("නිමල් පෙරේරා");
  });
});

test.describe("Common › API › Sign in", () => {
  test("API-COM-10: Sign in with correct details returns a token, role and id", async ({ request }) => {
    describeCase({ requirement: "Students can sign in", expected: "200 with token, role=student, userId", priority: "High" });
    const s = await createStudent(request);
    const res = await request.post(`${API_URL}/auth/login`, { data: { email: s.email.toUpperCase(), password: s.password } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ role: "student", userId: s.studentId });
  });

  test("API-COM-11: Wrong password is rejected", async ({ request }) => {
    describeCase({ requirement: "Credentials are checked", expected: "400 Invalid credentials, no token", priority: "High" });
    const s = await createStudent(request);
    const res = await request.post(`${API_URL}/auth/login`, { data: { email: s.email, password: "Wrong2026pass" } });
    expect(res.status()).toBe(400);
    expect(await res.json()).not.toHaveProperty("token");
  });

  test("API-COM-12: Unknown email and empty fields are rejected", async ({ request }) => {
    describeCase({ requirement: "Sign-in validation", expected: "404 for an unknown account, 400 for empty fields", priority: "Medium" });
    expect((await request.post(`${API_URL}/auth/login`, { data: { email: uniqueEmail("nobody"), password: VALID_PASSWORD } })).status()).toBe(404);
    expect((await request.post(`${API_URL}/auth/login`, { data: { email: "", password: "" } })).status()).toBe(400);
  });
});

test.describe("Common › API › Protected routes and JWT", () => {
  test("API-COM-13: Profile requires a token", async ({ request }) => {
    describeCase({ requirement: "Protected routes", expected: "401 without a token", priority: "High" });
    const res = await request.get(`${API_URL}/students/profile`);
    expect(res.status()).toBe(401);
  });

  test("API-COM-14: Invalid or tampered tokens are rejected", async ({ request }) => {
    describeCase({ requirement: "JWT verification", expected: "401 for a garbage and a tampered token", priority: "High" });
    const s = await createStudent(request);
    for (const token of ["garbage", s.token.slice(0, -4) + "abcd"]) {
      expect((await request.get(`${API_URL}/students/profile`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(401);
    }
  });

  test("API-COM-15: Profile with a valid token returns the student without the password", async ({ request }) => {
    describeCase({ requirement: "Profile data", expected: "200 with name, grade, star totals; no password field", priority: "High" });
    const s = await createStudent(request);
    const res = await request.get(`${API_URL}/students/profile`, { headers: authHeader(s) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ fullName: s.fullName, grade: "3", totalStars: 0, moduleStars: { workingMemory: 0, phonologicalAwareness: 0, speech: 0 } });
    expect(body).not.toHaveProperty("password");
  });

  test("API-COM-16: Profile update rejects a Sinhala school name and accepts an English one", async ({ request }) => {
    describeCase({ requirement: "School names use English characters", expected: "400 for Sinhala, 200 for English", priority: "Medium" });
    const s = await createStudent(request);
    expect((await request.put(`${API_URL}/students/profile`, { headers: authHeader(s), data: { school: "ශාන්ත තෝමස්" } })).status()).toBe(400);
    const ok = await request.put(`${API_URL}/students/profile`, { headers: authHeader(s), data: { school: "St. Thomas College" } });
    expect(ok.status()).toBe(200);
    expect((await ok.json()).student.school).toBe("St. Thomas College");
  });

  test("API-COM-17: Learning summary for the dashboard requires a token and starts empty", async ({ request }) => {
    describeCase({ requirement: "Dashboard progress", expected: "401 without token; new student has no started modules", priority: "Medium" });
    expect((await request.get(`${API_URL}/students/learning-summary`)).status()).toBe(401);
    const s = await createStudent(request);
    const body = await (await request.get(`${API_URL}/students/learning-summary`, { headers: authHeader(s) })).json();
    expect(body.modules.workingMemory.started).toBe(false);
    expect(body.workingMemoryAttention.screened).toBe(false);
  });
});

test.describe("Common › API › Forgot password", () => {
  test("API-COM-18: Forgot password accepts a registered email and rejects unknown or invalid ones", async ({ request }) => {
    describeCase({ requirement: "Password reset link is sent to the registered email", expected: "200 for a registered email, 404 unknown, 400 invalid", priority: "High" });
    const s = await createStudent(request);
    expect((await request.post(`${API_URL}/auth/forgot-password`, { data: { email: s.email } })).status()).toBe(200);
    expect((await request.post(`${API_URL}/auth/forgot-password`, { data: { email: uniqueEmail("nobody") } })).status()).toBe(404);
    expect((await request.post(`${API_URL}/auth/forgot-password`, { data: { email: "bad" } })).status()).toBe(400);
  });

  test("API-COM-19: Reset password rejects an invalid link and a weak password", async ({ request }) => {
    describeCase({ requirement: "Reset link security", expected: "400 for a wrong token and for a weak password", priority: "High" });
    const s = await createStudent(request);
    expect((await request.post(`${API_URL}/auth/reset-password`, { data: { email: s.email, token: "0".repeat(64), password: "NewPass2026" } })).status()).toBe(400);
    expect((await request.post(`${API_URL}/auth/reset-password`, { data: { email: s.email, token: "0".repeat(64), password: "weak" } })).status()).toBe(400);
  });
});

test.describe("Common › API › Response time", () => {
  test("PERF-COM-API-01: Sign-up and sign-in API response times", async ({ request }) => {
    describeCase({ requirement: "Responsive authentication", expected: "Each call answers in under 3 s (remote database)", priority: "Medium" });
    const timings: { call: string; run: number; ms: number }[] = [];
    for (let run = 1; run <= 3; run++) {
      const body = student();
      let start = performance.now();
      const register = await request.post(`${API_URL}/auth/register/student`, { data: body });
      timings.push({ call: "POST /auth/register/student", run, ms: Math.round(performance.now() - start) });
      expect(register.status()).toBe(201);
      start = performance.now();
      const login = await request.post(`${API_URL}/auth/login`, { data: { email: body.email, password: body.password } });
      timings.push({ call: "POST /auth/login", run, ms: Math.round(performance.now() - start) });
      expect(login.status()).toBe(200);
    }
    await test.info().attach("api-response-times", { body: JSON.stringify(timings, null, 2), contentType: "application/json" });
    for (const t of timings) expect(t.ms, `${t.call} run ${t.run}`).toBeLessThan(3000);
  });
});
