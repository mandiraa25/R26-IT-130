import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
import { describeCase } from "../../support/fixtures";

// Auth middleware and profile helpers, exercised directly (no server).
const require = createRequire(import.meta.url);
const backendRequire = createRequire(path.resolve("backend/package.json"));
const jwt = backendRequire("jsonwebtoken");
const { verifyToken } = require("../../../backend/src/middleware/auth.middleware.js");

const SECRET = "unit-test-secret";
const run = (authorization?: string) => {
  process.env.JWT_SECRET = SECRET;
  const req: any = { headers: authorization ? { authorization } : {} };
  const res: any = { code: 200, body: null, status(c: number) { this.code = c; return this; }, json(b: unknown) { this.body = b; return this; } };
  let nextCalled = false;
  verifyToken(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
};

test.describe("Common › Unit › Token helpers and auth middleware", () => {
  test("UT-COM-10: A valid JWT is accepted and its claims are attached to the request", () => {
    describeCase({ requirement: "Protected routes identify the student from the token", expected: "next() called, req.user.id set", priority: "High" });
    const token = jwt.sign({ id: "abc123", role: "student" }, SECRET, { expiresIn: "1h" });
    const { req, nextCalled } = run(`Bearer ${token}`);
    expect(nextCalled).toBe(true);
    expect(req.user).toMatchObject({ id: "abc123", role: "student" });
  });

  test("UT-COM-11: Missing token is rejected with 401", () => {
    describeCase({ requirement: "No token, no access", expected: "401 No token provided", priority: "High" });
    const { res, nextCalled } = run();
    expect(nextCalled).toBe(false);
    expect(res.code).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  test("UT-COM-12: Tampered, wrongly signed and expired tokens are rejected", () => {
    describeCase({ requirement: "Invalid tokens are refused", expected: "401 Invalid token for each", priority: "High" });
    const good = jwt.sign({ id: "abc123" }, SECRET);
    const cases = [
      good.slice(0, -3) + "xyz",
      jwt.sign({ id: "abc123" }, "another-secret"),
      jwt.sign({ id: "abc123", exp: Math.floor(Date.now() / 1000) - 60 }, SECRET),
      "not-a-jwt",
    ];
    for (const token of cases) {
      const { res, nextCalled } = run(`Bearer ${token}`);
      expect(nextCalled, token).toBe(false);
      expect(res.code).toBe(401);
      expect(res.body).toEqual({ message: "Invalid token" });
    }
  });

  test("UT-COM-13: Profile form state keeps stars non-negative and per-module", async () => {
    describeCase({ requirement: "Dashboard/profile show safe star counts", expected: "Negative or missing stars become 0", priority: "Low" });
    const { toProfileFormState } = await import("../../../frontend/src/utils/studentProfileCache.js");
    const state = toProfileFormState({ fullName: "Kid", totalStars: -5, moduleStars: { workingMemory: 25, phonologicalAwareness: "x" } });
    expect(state.totalStars).toBe(0);
    expect(state.moduleStars).toEqual({ workingMemory: 25, phonologicalAwareness: 0, speech: 0 });
  });
});
