import { test, expect } from "@playwright/test";

const MODULES = [
  { id: "wm", title: "Working Memory", alias: "working-memory" },
  { id: "rp", title: "Reading Processing", alias: "reading-processing" },
  { id: "pa", title: "Phonological Awareness", alias: "phonological-awareness" },
  { id: "sp", title: "Speech Processing", alias: "speech-processing" },
];
const SIZES = [{ width: 1672, height: 941 }, { width: 1366, height: 768 }, { width: 390, height: 844 }];
const STUDENT = { _id: "report-journal-review", fullName: "Mandiraa", grade: "3" };

async function setup(page, { failProfile = false, language = "en" } = {}) {
  const errors = [];
  const writes = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(({ student, language }) => {
    localStorage.setItem("token", "report-journal-review");
    localStorage.setItem("studentId", student._id);
    localStorage.setItem("i18nextLng", language);
    localStorage.setItem("lexiland-wm-muted", "true");
    sessionStorage.setItem("lexiland-student-profile", JSON.stringify(student));
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  }, { student: STUDENT, language });
  await page.route("**/api/**", route => {
    const request = route.request();
    if (request.method() !== "GET") writes.push(request.url());
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/students/profile")) return route.fulfill({ status: failProfile ? 503 : 200, json: failProfile ? { message: "Offline" } : STUDENT });
    if (path.includes("/improvement/progress/")) return route.fulfill({ json: { success: true, data: { maxUnlockedLevel: 1, initialIdentifiedLevel: 1, levelsProgress: [] } } });
    if (path.includes("/speech-processing/")) return route.fulfill({ json: { success: true, data: { student: STUDENT, identificationStatus: "not_started", attempts: [], sessions: [], activities: [], completedActivityIds: [] } } });
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return { errors, writes };
}

async function openJournal(page, path) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".reports-journal")).toBeVisible();
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1500))]));
  await expect(page.locator(".reports-journal__frame")).toHaveJSProperty("naturalWidth", 1627);
}

async function expectClearLayout(page) {
  const geometry = await page.locator(".reports-journal").evaluate(board => {
    const rect = board.getBoundingClientRect();
    const targets = [...board.querySelectorAll("h1,h2,.reports-row-copy p,.reports-action-link,.reports-guidance")];
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      board: { left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width },
      targets: targets.map(element => { const r = element.getBoundingClientRect(); return { text: element.textContent, left: r.left, right: r.right, bottom: r.bottom, width: r.width, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }; }),
    };
  });
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  for (const target of geometry.targets) {
    expect(target.left, target.text).toBeGreaterThanOrEqual(geometry.board.left + 12);
    expect(target.right, target.text).toBeLessThanOrEqual(geometry.board.right - 12);
    expect(target.bottom, target.text).toBeLessThanOrEqual(geometry.board.bottom - 20);
    expect(target.scrollWidth - target.clientWidth, target.text).toBeLessThanOrEqual(1);
  }
}

for (const size of SIZES) {
  test("module list fits the journal at " + size.width, async ({ page }, testInfo) => {
    const state = await setup(page);
    await page.setViewportSize(size);
    await openJournal(page, "/reports");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learning Reports");
    await expect(page.locator(".reports-profile-link")).toHaveText("Mandiraa · Grade 3");
    await expect(page.locator(".reports-module-row")).toHaveCount(4);
    for (const module of MODULES) {
      await expect(page.getByRole("link", { name: "View " + module.title + " results", exact: true })).toHaveAttribute("href", "/reports/" + module.id);
    }
    await expect(page.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/dashboard");
    await expect(page.locator(".reports-profile-link")).toHaveAttribute("href", "/profile");
    await expectClearLayout(page);
    await page.screenshot({ path: testInfo.outputPath("learning-reports-" + size.width + ".png"), fullPage: true });
    expect(state.errors).toEqual([]);
    expect(state.writes).toEqual([]);
  });
}

for (const module of MODULES) {
  test(module.title + " selector, tabs and legacy alias", async ({ page }, testInfo) => {
    const state = await setup(page);
    for (const size of [SIZES[0], SIZES[2]]) {
      await page.setViewportSize(size);
      await openJournal(page, "/reports/" + module.id);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(module.title);
      await expect(page.locator(".reports-type-row")).toHaveCount(2);
      await expect(page.locator(".reports-bookmark[aria-current=page]")).toHaveAttribute("href", "/reports/" + module.id);
      for (const [index, type] of ["identification", "improvement"].entries()) {
        await expect(page.locator(".reports-type-row .reports-action-link").nth(index)).toHaveAttribute("href", "/reports/" + module.id + "/" + type);
      }
      await expectClearLayout(page);
      await page.screenshot({ path: testInfo.outputPath(module.id + "-report-types-" + size.width + ".png"), fullPage: true });
    }
    await openJournal(page, "/reports/" + module.alias);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(module.title);
    await page.getByRole("link", { name: "All reports", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learning Reports");
    await page.getByRole("link", { name: "View " + module.title + " results", exact: true }).click();
    if (module.id === "rp") await expect(page.getByRole("link", { name: /Open book/ })).toHaveAttribute("href", "/reading-processing");
    expect(state.errors).toEqual([]);
    expect(state.writes).toEqual([]);
  });
}

test("cached real student badge survives a failed refresh", async ({ page }) => {
  await setup(page, { failProfile: true });
  await openJournal(page, "/reports");
  await expect(page.locator(".reports-profile-link")).toHaveText("Mandiraa · Grade 3");
  await page.getByRole("link", { name: "View Working Memory results", exact: true }).click();
  await expect(page.locator(".reports-profile-link")).toHaveText("Mandiraa · Grade 3");
});

test("Sinhala journal keeps long labels inside the frame", async ({ page }, testInfo) => {
  const state = await setup(page, { language: "si" });
  for (const size of [SIZES[0], SIZES[2]]) {
    await page.setViewportSize(size);
    await openJournal(page, "/reports");
    await expectClearLayout(page);
    await openJournal(page, "/reports/pa");
    await expectClearLayout(page);
    await page.screenshot({ path: testInfo.outputPath("pa-sinhala-" + size.width + ".png"), fullPage: true });
  }
  expect(state.errors).toEqual([]);
});

for (const module of MODULES.filter(module => module.id !== "rp")) {
  test(module.title + " links keep the existing detailed dashboards", async ({ page }) => {
    const state = await setup(page);
    for (const index of [0, 1]) {
      await openJournal(page, "/reports/" + module.id);
      await page.locator(".reports-type-row .reports-action-link").nth(index).click();
      await expect(page).toHaveURL(new RegExp("/reports/" + module.id + "/" + (index === 0 ? "identification" : "improvement") + "$"));
      await expect(page.locator(".reports-journal")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    expect(state.errors).toEqual([]);
    expect(state.writes).toEqual([]);
  });
}
