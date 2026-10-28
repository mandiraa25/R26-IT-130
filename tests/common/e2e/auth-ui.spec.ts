import { API_URL, VALID_PASSWORD, uniqueEmail } from "../../support/env";
import { authHeader, createStudent, describeCase, expect, signInBrowser, test } from "../../support/fixtures";

test.describe("Common › E2E › Sign up page", () => {
  test("FT-COM-01: User can sign up with valid details", async ({ page, request }) => {
    describeCase({ requirement: "Students can create an account in the browser", expected: "Success message, redirect to Sign In, account can sign in", priority: "High" });
    const email = uniqueEmail("ui-signup");
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Kavindi Silva");
    await page.getByLabel("Age").fill("8");
    await page.getByLabel("Grade").selectOption("3");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(VALID_PASSWORD);
    await page.getByLabel("Confirm Password").fill(VALID_PASSWORD);
    const dialog = page.waitForEvent("dialog");
    await page.getByRole("button", { name: "Create Account" }).click();
    const message = await dialog;
    expect(message.message()).toBe("Registered successfully");
    await message.accept();
    await expect(page).toHaveURL(/\/$/);
    expect((await request.post(`${API_URL}/auth/login`, { data: { email, password: VALID_PASSWORD } })).status()).toBe(200);
  });

  test("FT-COM-02: Sign up shows field errors for invalid and empty input", async ({ page }) => {
    describeCase({ requirement: "Sign-up form validation", expected: "Errors under each field; nothing is sent", priority: "High" });
    let sent = false;
    page.on("request", r => { if (r.url().includes("/api/auth/register")) sent = true; });
    await page.goto("/register");
    await page.getByRole("button", { name: "Create Account" }).click();
    for (const message of ["Full name is required.", "Age is required.", "Please choose Grade 2, 3 or 4.", "Email address is required.", "Password is required."]) {
      await expect(page.getByText(message)).toBeVisible();
    }
    await page.getByLabel("Age").fill("-3");
    await page.getByLabel("Email Address").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByLabel("Confirm Password").fill("different");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText("Age must be between 6 and 9.")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Password must be 8 to 64 characters.")).toBeVisible();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
    expect(sent).toBe(false);
  });

  test("FT-COM-03: Sign up with an email that is already registered shows the server error", async ({ page, request }) => {
    describeCase({ requirement: "One account per email", expected: "Visible 'already exists' message, stays on Sign Up", priority: "High" });
    const existing = await createStudent(request);
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Copy Cat");
    await page.getByLabel("Age").fill("7");
    await page.getByLabel("Grade").selectOption("2");
    await page.getByLabel("Email Address").fill(existing.email);
    await page.getByLabel("Password", { exact: true }).fill(VALID_PASSWORD);
    await page.getByLabel("Confirm Password").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByRole("alert")).toContainText("already exists");
    await expect(page).toHaveURL(/\/register$/);
  });
});

test.describe("Common › E2E › Sign in page", () => {
  test("FT-COM-04: User can sign in and reaches the dashboard", async ({ page, request }) => {
    describeCase({ requirement: "Students can sign in", expected: "Dashboard with 'Hi <first name>!' and a token in storage", priority: "High" });
    const s = await createStudent(request, { fullName: "Ruwan Fernando" });
    await page.goto("/");
    await page.getByPlaceholder("name@example.com").fill(s.email);
    await page.locator('input[name="password"]').fill(s.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Hi Ruwan!")).toBeVisible();
    expect(await page.evaluate(() => Boolean(localStorage.getItem("token")))).toBe(true);
  });

  test("FT-COM-05: Wrong password shows an error and stays on Sign In", async ({ page, request }) => {
    describeCase({ requirement: "Credentials are checked", expected: "'Invalid credentials' shown; no token stored", priority: "High" });
    const s = await createStudent(request);
    await page.goto("/");
    await page.getByPlaceholder("name@example.com").fill(s.email);
    await page.locator('input[name="password"]').fill("WrongPass2026");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("alert")).toContainText("Invalid credentials");
    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
  });

  test("FT-COM-06: Empty sign-in fields show validation messages", async ({ page }) => {
    describeCase({ requirement: "Sign-in validation", expected: "Email and password required messages", priority: "Medium" });
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Email address is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });

  test("FT-COM-07: Forgot password page sends a reset link for a registered email", async ({ page, request }) => {
    describeCase({ requirement: "Forgot Password", expected: "Link from Sign In opens the page; confirmation for a registered email", priority: "High" });
    const s = await createStudent(request);
    await page.goto("/");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await page.getByLabel("Email Address").fill(s.email);
    await page.getByRole("button", { name: "Send Reset Link" }).click();
    await expect(page.getByRole("status")).toContainText("reset link has been sent");
  });
});

test.describe("Common › E2E › Protected routes, dashboard and logout", () => {
  test("FT-COM-08: Protected pages redirect to Sign In without a token", async ({ page }) => {
    describeCase({ requirement: "Protected routes", expected: "/dashboard, /profile and /improvement-wm/3 redirect to /", priority: "High" });
    for (const path of ["/dashboard", "/profile", "/improvement-wm/3"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/$/);
    }
  });

  test("FT-COM-09: Signed-in users are sent from Sign In to the dashboard", async ({ page, request }) => {
    describeCase({ requirement: "Public routes for guests only", expected: "/ and /register redirect to /dashboard", priority: "Medium" });
    await signInBrowser(page, await createStudent(request));
    await page.goto("/register");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("FT-COM-10: Dashboard shows total stars, the four learning components and switches to Sinhala", async ({ page, request }) => {
    describeCase({ requirement: "Dashboard", expected: "Star counter, 4 cards, Sinhala greeting after EN/සිං switch", priority: "High" });
    const s = await createStudent(request, { fullName: "Dilini Perera" });
    await signInBrowser(page, s);
    await page.goto("/dashboard");
    await expect(page.getByLabel("Total Stars: 0")).toBeVisible();
    for (const id of ["wm", "rp", "pa", "sp"]) await expect(page.getByTestId(`dashboard-card-${id}`)).toBeVisible();
    await page.getByRole("button", { name: "සිං" }).click();
    await expect(page.getByText("ආයුබෝවන් Dilini!")).toBeVisible();
  });

  test("FT-COM-11: An invalid stored token sends the user back to Sign In", async ({ page }) => {
    describeCase({ requirement: "Expired/invalid tokens", expected: "Token cleared after the API answers 401", priority: "Medium" });
    await page.addInitScript(() => localStorage.setItem("token", "invalid.token.value"));
    await page.goto("/dashboard");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("token"))).toBeNull();
  });

  test("FT-COM-12: User can log out from the profile", async ({ page, request }) => {
    describeCase({ requirement: "Logout", expected: "Back on Sign In, token removed, dashboard protected again", priority: "High" });
    const s = await createStudent(request);
    await page.goto("/");
    await page.getByPlaceholder("name@example.com").fill(s.email);
    await page.locator('input[name="password"]').fill(s.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("button", { name: "Profile" }).first().click();
    await expect(page).toHaveURL(/\/profile$/);
    await page.getByRole("button", { name: /Logout/i }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/$/);
    expect((await request.get(`${API_URL}/students/profile`, { headers: authHeader(s) })).status()).toBe(200);
  });
});
