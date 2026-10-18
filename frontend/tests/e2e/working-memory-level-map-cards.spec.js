import { test, expect } from "@playwright/test";

const KEYS = ["pattern", "words", "instructions", "numbers"];
const SIZES = [{ width: 1366, height: 768 }, { width: 1740, height: 980 }];

async function setup(page, { grade = "3", language = "en", max = 4, complete = [4, 4, 4, 3], screening = true, failFirst = false } = {}) {
  const state = { errors: [], writes: [], profileRequests: 0 };
  page.on("pageerror", error => state.errors.push(error.message));
  const progress = {
    isIdentificationCompleted: screening, initialIdentifiedLevel: 1, maxUnlockedLevel: max, totalStars: 705,
    levelsProgress: [1, 2, 3, 4].map(level => ({
      levelNumber: level, isCompleted: complete[level - 1] === 4,
      subCategories: KEYS.map((key, index) => ({ subCategoryKey: key, isCompleted: index < complete[level - 1], isUnlocked: level <= max && index <= complete[level - 1] })),
    })),
  };
  await page.addInitScript(({ grade, language }) => {
    localStorage.setItem("token", "level-map-card-review");
    localStorage.setItem("studentId", "level-map-card-review");
    localStorage.setItem("i18nextLng", language);
    localStorage.setItem("lexiland-wm-muted", "true");
    sessionStorage.setItem("lexiland-student-profile", JSON.stringify({ _id: "level-map-card-review", fullName: "Mandiraa", grade }));
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  }, { grade, language });
  await page.route("**/api/**", route => {
    const request = route.request();
    if (request.method() !== "GET") state.writes.push(request.url());
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/students/profile")) {
      state.profileRequests++;
      if (failFirst && state.profileRequests === 1) return route.fulfill({ status: 503, json: { message: "Offline" } });
      return route.fulfill({ json: { _id: "level-map-card-review", fullName: "Mandiraa", grade } });
    }
    if (path.includes("/improvement/progress/")) return route.fulfill({ json: { success: true, data: progress } });
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return state;
}

async function openMap(page, grade = "3") {
  await page.goto("/improvement-wm/" + grade, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".wm-level-card")).toHaveCount(4);
  await expect(page.locator(".wm-level-card").first()).toHaveJSProperty("disabled", false);
  await page.evaluate(() => document.fonts.ready);
  for (let index = 0; index < 4; index++) {
    const art = page.locator(".wm-level-card__artwork").nth(index);
    await expect(art).toHaveAttribute("src", "/images/workingMemory/level-map/cards/level-" + (index + 1) + ".png");
    await expect(art).toHaveJSProperty("naturalWidth", 640);
    await expect(art).toHaveJSProperty("naturalHeight", 960);
  }
  await expect(page.locator(".lx-adventure-scene,.lx-adventure-frame")).toHaveCount(0);
}

async function expectCardLayout(page) {
  const cards = await page.locator(".wm-level-card").evaluateAll(elements => elements.map(card => {
    const box = card.getBoundingClientRect();
    const band = selector => {
      const element = card.querySelector(selector), rect = element.getBoundingClientRect();
      return { top: (rect.top - box.top) / box.height, bottom: (rect.bottom - box.top) / box.height, left: (rect.left - box.left) / box.width, right: (rect.right - box.left) / box.width, overflow: element.scrollWidth - element.clientWidth };
    };
    return { left: box.left, right: box.right, bottom: box.bottom, width: box.width, height: box.height, title: band("h2"), progress: band(".wm-level-card__progress"), cta: band(".wm-level-card__cta") };
  }));
  for (const [index, card] of cards.entries()) {
    expect(card.width / card.height).toBeCloseTo(2 / 3, 2);
    expect(card.left).toBeGreaterThanOrEqual(0);
    expect(card.right).toBeLessThanOrEqual(page.viewportSize().width);
    expect(card.bottom).toBeLessThanOrEqual(page.viewportSize().height);
    if (index) expect(card.left).toBeGreaterThan(cards[index - 1].right);
    expect(card.title.top).toBeGreaterThanOrEqual(.08);
    expect(card.title.bottom).toBeLessThanOrEqual(.20);
    expect(card.progress.top).toBeGreaterThanOrEqual(.73);
    expect(card.progress.bottom).toBeLessThanOrEqual(.82);
    expect(card.cta.top).toBeGreaterThanOrEqual(.82);
    expect(card.cta.bottom).toBeLessThanOrEqual(.95);
    for (const band of [card.title, card.progress, card.cta]) {
      expect(band.left).toBeGreaterThanOrEqual(.08);
      expect(band.right).toBeLessThanOrEqual(.93);
      expect(band.overflow).toBeLessThanOrEqual(1);
    }
    // All live controls stay above the ears or below the paws, clearing the eyes.
    expect(card.title.bottom).toBeLessThan(.3);
    expect(card.progress.top).toBeGreaterThan(.7);
  }
}

for (const size of SIZES) test("reference card artwork and saved counts at " + size.width, async ({ page }, testInfo) => {
  const state = await setup(page);
  await page.setViewportSize(size);
  await openMap(page);
  await expect(page.locator(".wm-level-card__progress")).toHaveText(["4 / 4 Games", "4 / 4 Games", "4 / 4 Games", "3 / 4 Games"]);
  await expect(page.locator(".wm-level-card__cta")).toHaveText(["PLAY", "PLAY", "PLAY", "PLAY"]);
  await expectCardLayout(page);
  await page.screenshot({ path: testInfo.outputPath("level-map-" + size.width + ".png") });
  expect(state.errors).toEqual([]); expect(state.writes).toEqual([]);
});

for (const grade of ["2", "3", "4"]) test("Grade " + grade + " level cards open the original game menu", async ({ page }) => {
  const state = await setup(page, { grade });
  await openMap(page, grade);
  for (const level of [1, 2, 3, 4]) {
    const card = page.getByRole("button", { name: "Level " + level, exact: true });
    await card.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".lx-popup-title")).toHaveText("Level " + level);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(card).toBeFocused();
  }
  await page.getByRole("button", { name: "Level 1", exact: true }).click();
  await page.getByRole("button", { name: "Pattern", exact: true }).click();
  await expect(page).toHaveURL(new RegExp("/improvement-activity-wm/" + grade + "/1/pattern$"));
  await expect(page.locator(".lx-video-howto")).toBeVisible();
  expect(state.errors).toEqual([]); expect(state.writes).toEqual([]);
});

test("locked levels retain their notice and cannot open a menu", async ({ page }, testInfo) => {
  await setup(page, { max: 2, complete: [4, 2, 0, 0] });
  await openMap(page);
  await expect(page.locator(".wm-level-card__progress")).toHaveText(["4 / 4 Games", "2 / 4 Games", "0 / 4 Games", "0 / 4 Games"]);
  const locked = page.getByRole("button", { name: "Level 3, locked", exact: true });
  await expect(locked).toHaveAttribute("aria-disabled", "true");
  await locked.click({ force: true });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".lx-map-notice")).toContainText("Finish Level 2 to unlock Level 3!");
  await expect(page.locator(".wm-level-card__cta").nth(2)).toContainText("LOCKED");
  await page.screenshot({ path: testInfo.outputPath("level-map-locked.png") });
});

test("screening remains required before any level opens", async ({ page }) => {
  await setup(page, { max: 0, complete: [0, 0, 0, 0], screening: false });
  await openMap(page);
  await expect(page.locator(".wm-level-card[aria-disabled=true]")).toHaveCount(4);
  await page.locator(".wm-level-card").first().click({ force: true });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator(".lx-map-notice button").click();
  await expect(page).toHaveURL(/\/working-memory\/3$/);
});

test("failed map loading still supports Retry", async ({ page }) => {
  const state = await setup(page, { failFirst: true });
  await page.goto("/improvement-wm/3");
  await expect(page.locator(".lx-map-notice")).toContainText("Unable to load progress");
  await expect(page.locator(".wm-level-card:disabled")).toHaveCount(4);
  await page.getByRole("button", { name: "Try Again", exact: true }).click();
  await expect(page.locator(".wm-level-card").first()).toBeEnabled();
  expect(state.profileRequests).toBe(2);
});

test("Sinhala labels fit the same blank card controls", async ({ page }, testInfo) => {
  const state = await setup(page, { language: "si", max: 3, complete: [4, 3, 2, 0] });
  await openMap(page);
  await expect(page.locator(".wm-level-card__title").first()).toHaveText("මට්ටම 1");
  await expect(page.locator(".wm-level-card__progress").first()).toHaveText("4 / 4 ක්‍රීඩා");
  await expectCardLayout(page);
  await page.screenshot({ path: testInfo.outputPath("level-map-sinhala.png") });
  expect(state.errors).toEqual([]);
});
