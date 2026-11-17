import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { describeCase } from "../../support/fixtures";
import * as form from "../../../frontend/src/utils/authValidation.js";

// The server-side rules (enforced) and the form rules (shown before sending) must agree.
const require = createRequire(import.meta.url);
const server = require("../../../backend/src/modules/common/validation/studentValidation.js");

const valid = { fullName: "Nimal Perera", age: "8", grade: "3", email: "nimal@example.com", password: "Lexi2026test", confirmPassword: "Lexi2026test" };

test.describe("Common › Unit › Sign-up and sign-in validation", () => {
  test("UT-COM-01: Valid sign-up details pass both form and server rules", () => {
    describeCase({ requirement: "Sign-up accepts correct student details", expected: "No validation errors", priority: "High" });
    expect(form.validateRegistrationForm(valid)).toEqual({});
    expect(server.validateRegistration(valid).message).toBe("");
  });

  test("UT-COM-02: Age must be a whole number between 6 and 9 (boundaries)", () => {
    describeCase({ requirement: "Students are 6-9 years old; no negative ages", expected: "5, 10, -3, 7.5, empty rejected; 6 and 9 accepted", priority: "High" });
    for (const age of ["6", "9", 6, 9]) { expect(form.validateAge(age)).toBe(""); expect(server.validateAge(age)).toBe(""); }
    for (const age of ["5", "10", "-3", "7.5", "", "abc"]) { expect(form.validateAge(age), String(age)).not.toBe(""); expect(server.validateAge(age), String(age)).not.toBe(""); }
  });

  test("UT-COM-03: Grade must be 2, 3 or 4", () => {
    describeCase({ requirement: "Only Grades 2-4 are supported", expected: "1, 5 and empty rejected", priority: "High" });
    for (const grade of ["2", "3", "4", 2, 4]) expect(server.validateGrade(grade)).toBe("");
    for (const grade of ["1", "5", "", "grade3"]) { expect(server.validateGrade(grade)).not.toBe(""); expect(form.validateGrade(grade)).not.toBe(""); }
  });

  test("UT-COM-04: Email addresses are checked for a valid format", () => {
    describeCase({ requirement: "Reject invalid email addresses", expected: "Malformed addresses rejected", priority: "High" });
    for (const email of ["kid@school.lk", "a.b+c@mail.co.uk"]) expect(server.validateEmail(email)).toBe("");
    for (const email of ["", "plain", "a@b", "a b@c.com", "@x.com", "x@.com"]) { expect(server.validateEmail(email), email).not.toBe(""); expect(form.validateEmail(email), email).not.toBe(""); }
  });

  test("UT-COM-05: Password needs 8-64 characters with a letter and a number", () => {
    describeCase({ requirement: "Password rules", expected: "Short, letters-only and digits-only passwords rejected", priority: "High" });
    for (const password of ["abc12345", "Lexi2026test"]) expect(server.validatePassword(password)).toBe("");
    for (const password of ["", "abc1", "abcdefgh", "12345678", "a1".repeat(33)]) { expect(server.validatePassword(password), password).not.toBe(""); expect(form.validatePassword(password), password).not.toBe(""); }
  });

  test("UT-COM-06: Full name accepts English and Sinhala letters but not digits", () => {
    describeCase({ requirement: "Bilingual names", expected: "English and Sinhala names accepted; digits or symbols rejected", priority: "Medium" });
    for (const name of ["Nimal Perera", "නිමල් පෙරේරා", "O'Neil Silva"]) { expect(server.validateFullName(name), name).toBe(""); expect(form.validateFullName(name), name).toBe(""); }
    for (const name of ["", "N", "N1mal", "Nimal@"]) expect(server.validateFullName(name), name).not.toBe("");
  });

  test("UT-COM-07: School name must use English characters", () => {
    describeCase({ requirement: "School names use English characters", expected: "Sinhala school name rejected, English accepted, empty allowed", priority: "Medium" });
    expect(server.validateSchool("St. Thomas' College")).toBe("");
    expect(server.validateSchool("")).toBe("");
    expect(server.validateSchool("ශාන්ත තෝමස්")).not.toBe("");
    expect(form.validateSchool("ශාන්ත තෝමස්")).not.toBe("");
  });

  test("UT-COM-08: Sign-up form requires matching passwords", () => {
    describeCase({ requirement: "Confirm password", expected: "Mismatch reported on confirmPassword", priority: "Medium" });
    expect(form.validateRegistrationForm({ ...valid, confirmPassword: "Different1" })).toHaveProperty("confirmPassword");
  });

  test("UT-COM-09: Sign-in form requires email and password", () => {
    describeCase({ requirement: "Sign-in validation", expected: "Both fields reported when empty", priority: "Medium" });
    expect(Object.keys(form.validateLoginForm({ email: "", password: "" })).sort()).toEqual(["email", "password"]);
    expect(form.validateLoginForm({ email: "kid@school.lk", password: "x" })).toEqual({});
  });
});
