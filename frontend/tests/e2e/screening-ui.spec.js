import { test, expect } from "@playwright/test";
import { QUIZ_DATA } from "../../src/features/workingMemory/identification/data";

async function setup(page, language = "en", memoryDelay = 250) {
  await page.addInitScript(({ lang, memoryDelay }) => {
    localStorage.setItem("token", "screening-ui-review");
    localStorage.setItem("studentId", "screening-ui-review");
    localStorage.setItem("i18nextLng", lang);
    window.speechSynthesis.speak = utterance => { window.__screeningSpeech = utterance; utterance.onstart?.(); };
    window.speechSynthesis.cancel = () => {};
    const original = window.setTimeout;
    // Accelerated only in this test browser; production timers/data unchanged.
    window.setTimeout = (fn, ms, ...args) => original(fn, [6000, 7000, 8000].includes(ms) ? memoryDelay : ms, ...args);
  }, { lang: language, memoryDelay });
  await page.route("**/api/**", route => route.fulfill({ json: { grade: "3" } }));
}

async function screeningGeometry(page) {
  // Only question/completion shells use this helper; intro panels have their
  // own layout and do not contain a screening board.
  await expect(page.locator(".wm-screen .lx-board")).toBeVisible();
  await expect(page.locator(".wm-screen .lx-bucket")).toHaveCount(0);
  const geometry = await page.locator(".wm-screen").evaluate(screen => {
    const board = screen.querySelector(".lx-board").getBoundingClientRect();
    const stage = screen.querySelector(".lx-stage");
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
    const rect = selector => screen.querySelector(selector)?.getBoundingClientRect();
    const dots = rect(".wm-screen__stars");
    const count = rect(".wm-screen__count");
    const nav = rect(".lx-nav");
    const tracker = dots && count ? {
      centerOffset: ((Math.min(dots.left, count.left) + Math.max(dots.right, count.right)) / 2 - (board.left + board.right) / 2) / scale,
      verticalOffset: ((dots.top + dots.bottom) / 2 - (count.top + count.bottom) / 2) / scale,
      boardGap: (board.top - Math.max(dots.bottom, count.bottom)) / scale,
      navGap: (Math.min(dots.top, count.top) - nav.bottom) / scale,
    } : null;
    const selectors = [
      ".wm-screen__category", ".wm-screen__title-row", ".wm-screen__pattern",
      ".wm-screen__memory-panel", ".wm-screen__options", ".wm-screen__instruction-steps",
      ".wm-screen__question-footer", ".wm-screen__complete > header", ".wm-screen__results",
      ".wm-screen__result-actions", ".wm-screen__save-notice", ".wm-screen__demo-complete > h1",
      ".wm-screen__demo-complete > p", ".lx-board button",
    ];
    const frameCollisions = [...screen.querySelectorAll(selectors.join(","))].flatMap(element => {
      const box = element.getBoundingClientRect();
      const distances = {
        left: (box.left - board.left) / scale,
        right: (board.right - box.right) / scale,
        top: (box.top - board.top) / scale,
        bottom: (board.bottom - box.bottom) / scale,
      };
      // The transparent art border and corner foliage occupy part of the
      // outer bounds; controls need a useful inset beyond simple containment.
      return Object.entries({ left:44, right:44, top:32, bottom:38 })
        .filter(([edge, minimum]) => distances[edge] < minimum - 1)
        .map(([edge]) => ({ element:element.className, edge, distance:Math.round(distances[edge]) }));
    });
    return { tracker, frameCollisions };
  });
  expect(geometry.frameCollisions, "screening content keeps clearance from the frame and leaf corners").toEqual([]);
  if (geometry.tracker) {
    expect(Math.abs(geometry.tracker.centerOffset), "dots and counter together are centered above the board").toBeLessThanOrEqual(2);
    expect(Math.abs(geometry.tracker.verticalOffset), "dots and counter share a vertical center").toBeLessThanOrEqual(2);
    expect(geometry.tracker.boardGap, "tracker has space above the board").toBeGreaterThanOrEqual(12);
    expect(geometry.tracker.navGap, "tracker clears the top navigation").toBeGreaterThanOrEqual(4);
  }
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
  await screeningGeometry(page);
}

test("screening frame, centered tracker, and study/recall bounds at laptop and reference sizes", async ({ page }, testInfo) => {
  // Keep study states inspectable while accelerating only this isolated
  // browser's timers. No production duration or quiz data is changed.
  await setup(page, "en", 1500);
  const representatives = ["wm-g3-1", "wm-g3-5", "wm-g3-9", "wm-g3-12"];
  for (const [width, height] of [[1366,768], [2878,1540]]) {
    await page.setViewportSize({ width, height });
    // A real assessment keeps all fifteen dots and advances completed/current
    // states. Leaving after question two avoids a result write altogether.
    await page.goto("/working-memory/3?ids=wm-g3-1");
    await expect(page.locator(".wm-screen__stars li")).toHaveCount(15);
    await expect(page.locator(".wm-screen__count")).toHaveText("Question 1 / 15");
    await contained(page);
    await page.getByTestId("wm-pattern-option").first().click();
    await expect(page.locator(".wm-screen__count")).toHaveText("Question 2 / 15");
    await expect(page.locator(".wm-screen__stars .is-done")).toHaveCount(1);
    await expect(page.locator(".wm-screen__stars li").nth(1)).toHaveAttribute("aria-current", "step");
    await contained(page);

    for (const id of representatives) {
      const question = QUIZ_DATA["3"].en.find(item => item.id === id);
      await page.goto(`/working-memory/3?demo=true&ids=${id}`);
      await expect(page.locator(".wm-screen__category")).toBeVisible();
      const study = question.category === "Instruction"
        ? page.locator(".wm-screen__instruction-steps")
        : page.locator(".wm-screen__memory-panel");
      if (question.category !== "Pattern") await expect(study).toBeVisible();
      const studyBounds = await page.locator(".wm-screen .lx-board").boundingBox();
      await contained(page);
      await page.screenshot({ path:testInfo.outputPath(`${id}-${width}-study.png`) });
      if (question.category === "Instruction") await page.evaluate(() => window.__screeningSpeech.onend());
      const options = page.getByTestId(question.category === "Pattern" ? "wm-pattern-option" : "wm-choice-option");
      await expect(options.first()).toBeVisible();
      if (question.category !== "Pattern") await expect(study).toHaveCount(0);
      await contained(page);
      const recallBounds = await page.locator(".wm-screen .lx-board").boundingBox();
      for (const dimension of ["x", "y", "width", "height"]) {
        expect(Math.abs(recallBounds[dimension] - studyBounds[dimension]), `${question.category} board ${dimension} remains stable between states`).toBeLessThanOrEqual(1);
      }
      await page.screenshot({ path:testInfo.outputPath(`${id}-${width}-recall.png`) });
      const incorrect = question.options.findIndex(option => option !== question.correct);
      await options.nth(incorrect).click();
      await expect(page.getByTestId("wm-finished")).toBeVisible();
      await contained(page);
      await page.screenshot({ path:testInfo.outputPath(`${id}-${width}-results.png`) });
    }
  }
});

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

for (const lang of ["en", "si"]) test(`four-step audio failure keeps separated controls and visible keyboard focus: ${lang}`, async ({ page }) => {
  await setup(page, lang);
  const id = lang === "si" ? "wm-g4-si-10" : "wm-g4-10";
  await page.goto(`/working-memory/4?demo=true&ids=${id}`);
  const steps = page.locator(".wm-screen__instruction-steps");
  const listen = page.locator(".wm-screen__listen");
  const continuation = page.locator(".wm-screen__instruction-area .wm-screen__primary");
  await expect(steps.locator("li")).toHaveCount(4);
  await page.evaluate(() => window.__screeningSpeech.onerror());
  await expect(continuation).toBeVisible();
  await expect(page.getByTestId("wm-choice-option")).toHaveCount(0);
  await contained(page);
  const gaps = await page.locator(".wm-screen").evaluate(screen => {
    const stage = screen.querySelector(".lx-stage");
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
    const rows = screen.querySelector(".wm-screen__instruction-steps").getBoundingClientRect();
    const button = screen.querySelector(".wm-screen__instruction-area .wm-screen__primary").getBoundingClientRect();
    const footer = screen.querySelector(".wm-screen__question-footer").getBoundingClientRect();
    return { afterSteps:(button.top - rows.bottom) / scale, beforeHelper:(footer.top - button.bottom) / scale };
  });
  expect(gaps.afterSteps, "Continue has space below the four instruction rows").toBeGreaterThanOrEqual(6);
  expect(gaps.beforeHelper, "Continue stays above the helper text with clear separation").toBeGreaterThanOrEqual(6);

  // The question heading receives initial focus. Real Tab navigation must
  // expose the same visible focus treatment on Listen and the fallback action.
  await page.keyboard.press("Tab");
  await expect(listen).toBeFocused();
  const listenFocus = await listen.evaluate(button => ({
    visible:button.matches(":focus-visible"),
    width:parseFloat(getComputedStyle(button).outlineWidth),
    style:getComputedStyle(button).outlineStyle,
  }));
  expect(listenFocus.visible).toBe(true);
  expect(listenFocus.width).toBeGreaterThanOrEqual(3);
  expect(listenFocus.style).toBe("solid");
  await page.keyboard.press("Tab");
  await expect(continuation).toBeFocused();
  const continueFocus = await continuation.evaluate(button => ({
    visible:button.matches(":focus-visible"),
    width:parseFloat(getComputedStyle(button).outlineWidth),
    style:getComputedStyle(button).outlineStyle,
  }));
  expect(continueFocus).toEqual(listenFocus);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("wm-choice-option").first()).toBeVisible();
  await expect(steps).toHaveCount(0);
  await expect(continuation).toHaveCount(0);
  await contained(page);
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
