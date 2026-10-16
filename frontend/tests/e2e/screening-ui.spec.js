import { test, expect } from "@playwright/test";
import { QUIZ_DATA } from "../../src/pages/workingMemory/quizData";

async function setup(page, language = "en") {
  await page.addInitScript(lang => {
    localStorage.setItem("token", "screening-ui-review");
    localStorage.setItem("studentId", "screening-ui-review");
    localStorage.setItem("i18nextLng", lang);
    window.speechSynthesis.speak = utterance => { window.__screeningSpeech = utterance; utterance.onstart?.(); };
    window.speechSynthesis.cancel = () => {};
    const original = window.setTimeout;
    // Accelerated only in this test browser; production timers/data unchanged.
    window.setTimeout = (fn, ms, ...args) => original(fn, [6000, 7000, 8000].includes(ms) ? 250 : ms, ...args);
  }, language);
  await page.route("**/api/**", route => route.fulfill({ json: { grade: "3" } }));
}

async function contained(page) {
  await page.locator(".wm-screen img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(await page.locator(".wm-screen__board-content").evaluate(element => {
    const box = element.getBoundingClientRect();
    return [...element.querySelectorAll("button,h1,h2,footer")].filter(item => {
      const r = item.getBoundingClientRect();
      return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1;
    }).map(item => item.textContent);
  })).toEqual([]);
  expect(await page.locator(".wm-screen__results > section").evaluateAll(panels => panels.flatMap(panel => {
    const box = panel.getBoundingClientRect();
    return [...panel.querySelectorAll("button,strong,small,h2")].filter(item => {
      const r = item.getBoundingClientRect();
      return r.top < box.top - 1 || r.bottom > box.bottom + 1;
    }).map(item => item.textContent);
  }))).toEqual([]);
}

for (const grade of ["2", "3", "4"]) for (const lang of ["en", "si"]) {
  test(`all 15 questions: grade ${grade}, ${lang}`, async ({ page }) => {
    await setup(page, lang);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const question of QUIZ_DATA[grade][lang]) {
      await page.goto(`/working-memory/${grade}?demo=true&ids=${question.id}`);
      await expect(page.locator(".wm-screen__category")).toBeVisible();
      await expect(page.locator(".wm-screen__stars")).toHaveCount(1);
      await expect(page.locator(".wm-screen__stars .is-done")).toHaveCount(0);
      await expect(page.getByTestId("wm-ready-to-answer")).toHaveCount(0);
      await contained(page);
      if (question.category === "Instruction") {
        await expect(page.locator(".wm-screen__instruction-steps")).toBeVisible();
        await expect(page.getByTestId("wm-choice-option")).toHaveCount(0);
        await page.evaluate(() => window.__screeningSpeech.onend());
      }
      const options = page.getByTestId(question.category === "Pattern" ? "wm-pattern-option" : "wm-choice-option");
      await expect(options.first()).toBeVisible();
      await contained(page);
      expect(await page.locator(".wm-screen__picture-item").allTextContents()).toEqual(
        Array(await page.locator(".wm-screen__picture-item").count()).fill(""));
      await options.first().evaluate(button => { button.click(); button.click(); });
      await expect(page.getByTestId("wm-finished")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("completion has matching artwork, accessible navigation, and responsive cards", async ({ page }) => {
  await setup(page);
  for (const [id, filename] of [["wm-g3-1", "pattern.png"], ["wm-g3-5", "pictures.png"], ["wm-g3-9", "instructions.png"], ["wm-g3-12", "numbers.png"]]) {
    await page.goto(`/working-memory/3?demo=true&ids=${id}`);
    if (id.endsWith("-9")) { await page.locator(".wm-screen__instruction-steps").waitFor(); await page.evaluate(() => window.__screeningSpeech.onend()); }
    const question = QUIZ_DATA["3"].en.find(item => item.id === id);
    const incorrect = question.options.findIndex(option => option !== question.correct);
    const options = page.getByTestId(question.category === "Pattern" ? "wm-pattern-option" : "wm-choice-option");
    await options.nth(incorrect).click();
    await expect(page.getByTestId("wm-finished")).toBeVisible();
    await expect(page.locator(".wm-recommendations--illustrated img")).toHaveAttribute("src", new RegExp(`/practice/${filename}$`));
    for (const [width, height] of [[1366,768], [1920,1080], [768,1024], [390,844]]) {
      await page.setViewportSize({ width, height });
      await contained(page);
    }
    await page.setViewportSize({ width:1366, height:768 });
  }
  await page.getByTestId("wm-go-improvement").click();
  await expect(page).toHaveURL(/improvement-wm\/3$/);
});

test("audio failure keeps readable steps until the child continues", async ({ page }) => {
  await setup(page);
  await page.goto("/working-memory/3?demo=true&ids=wm-g3-9");
  await page.locator(".wm-screen__instruction-steps").waitFor();
  await page.evaluate(() => window.__screeningSpeech.onerror());
  await expect(page.getByTestId("wm-choice-option")).toHaveCount(0);
  await page.getByRole("button", { name:"Continue", exact:true }).click();
  await expect(page.getByTestId("wm-choice-option").first()).toBeVisible();
  await expect(page.locator(".wm-screen__instruction-steps")).toHaveCount(0);
});

for (const lang of ["en", "si"]) test(`saving, failure and retry stay within the completion board: ${lang}`, async ({ page }, testInfo) => {
  await setup(page, lang);
  let release;
  let attempts = 0;
  await page.route("**/api/working-memory/identification/save-result", async route => {
    attempts++;
    if (attempts === 1) {
      await new Promise(resolve => { release = resolve; });
      await route.fulfill({ status:500, json:{ message:"Test save failure" } });
    } else await route.fulfill({ json:{ success:true } });
  });
  await page.goto("/working-memory/3");
  await page.getByTestId("wm-identify-start-test").click();
  await page.getByTestId("wm-identify-ready").click();
  for (const question of QUIZ_DATA["3"][lang]) {
    if (question.category === "Instruction") {
      await page.locator(".wm-screen__instruction-steps").waitFor();
      await page.evaluate(() => window.__screeningSpeech.onend());
    }
    await page.getByTestId(question.category === "Pattern" ? "wm-pattern-option" : "wm-choice-option").first().click();
  }
  await expect(page.getByTestId("wm-finished")).toBeVisible();
  await expect(page.getByTestId("wm-go-improvement")).toBeDisabled();
  await contained(page);
  await page.screenshot({ path:testInfo.outputPath(`saving-${lang}.png`) });
  release();
  await expect(page.getByRole("alert")).toBeVisible();
  await contained(page);
  await page.screenshot({ path:testInfo.outputPath(`save-error-${lang}.png`) });
  await page.getByRole("alert").getByRole("button").click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByTestId("wm-go-improvement")).toBeEnabled();
  expect(attempts).toBe(2);
});

for (const lang of ["en", "si"]) test(`readable intro and themed demo completion: ${lang}`, async ({ page }, testInfo) => {
  await setup(page, lang);
  await page.goto("/working-memory/3");
  for (const screen of ["choice", "rules"]) {
    if (screen === "rules") await page.getByTestId("wm-identify-start-test").click();
    for (const [width,height] of [[1366,768],[390,844]]) {
      await page.setViewportSize({ width,height });
      await expect(page.locator(".wm-intro-panel")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      if (width === 390) {
        // The approved redesign scales a 1600x900 stage on every viewport.
        expect(await page.locator(".wm-intro-action").evaluateAll(buttons => buttons.every(button =>
          button.getBoundingClientRect().height / Math.min(innerWidth / 1600, innerHeight / 900) >= 48 && parseFloat(getComputedStyle(button).fontSize) >= 16))).toBe(true);
      }
      await page.screenshot({ path:testInfo.outputPath(`${screen}-${lang}-${width}.png`), fullPage:true });
    }
    await page.setViewportSize({width:1366,height:768});
  }
  await page.locator(".wm-rules-actions .wm-intro-action--back").click();
  await page.getByTestId("wm-identify-try-demo").click();
  await page.getByTestId("wm-pattern-option").first().click();
  await page.getByTestId("wm-choice-option").first().click();
  await expect(page.getByTestId("wm-demo-finished")).toBeVisible();
  await expect(page.locator(".lx-bunny")).toBeVisible();
  await contained(page);
  await page.getByTestId("wm-identify-start-real-after-demo").click();
  await expect(page.getByTestId("wm-identify-briefing")).toBeVisible();
});
