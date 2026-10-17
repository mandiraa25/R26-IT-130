import { test, expect } from "@playwright/test";
import { getSubCategoryData } from "../../src/features/workingMemory/improvement/data";
import { getLevelDisplaySeconds, SUBCATEGORY_ORDER } from "../../src/features/workingMemory/config/gameConfig";
import { parseInstructionSteps } from "../../src/features/workingMemory/logic/presentation";

const GRADE = "2";
const BASE_STARS = 98_765; // Deliberately large enough to catch badge clipping.
const VIEWPORTS = [{ width: 1366, height: 768 }, { width: 2878, height: 1540 }];
const NAMES = { pattern: "Pattern Recognition", words: "Picture Memory", instructions: "Following Instructions", numbers: "Number Memory" };
const FIXED_TIME = new Date("2026-10-17T06:00:00.000Z");
const board = page => page.locator(".lx-level-two .lx-board");
const feedback = page => page.getByTestId("level-one-feedback");

function initialProgress({ completed = [], nextUnlocked = false } = {}) {
  return {
    studentId: "level-one-ui-review",
    isIdentificationCompleted: true,
    initialIdentifiedLevel: 1,
    maxUnlockedLevel: nextUnlocked ? 3 : 2,
    totalStars: BASE_STARS,
    totalCarrots: BASE_STARS,
    levelsProgress: [1, 2, 3, 4].map(levelNumber => ({
      levelNumber,
      isCompleted: levelNumber === 2 && completed.length === 4,
      subCategories: SUBCATEGORY_ORDER.map(subCategoryKey => ({
        subCategoryKey,
        isUnlocked: levelNumber <= 2,
        isCompleted: levelNumber === 2 && completed.includes(subCategoryKey),
        bestScore: levelNumber === 2 && completed.includes(subCategoryKey) ? 5 : 0,
        totalAttempts: 0,
      })),
    })),
  };
}

// Multiple older attempts intentionally make earned stars different from
// bestScore * 5 and from just the current attempt's reward.
const savedHistory = () => [
  ["pattern", 3], ["pattern", 4], ["words", 2], ["words", 4],
  ["instructions", 3], ["instructions", 5], ["numbers", 2], ["numbers", 3],
].map(([subCategoryKey, score], i) => ({
  _id: `saved-${i}`, studentId: "level-one-ui-review", levelNumber: 2,
  subCategoryKey, score, totalQuestions: 5, starsEarned: score * 5,
  carrotsEarned: score * 5, completedAt: `2026-10-${String(i + 1).padStart(2, "0")}T06:00:00.000Z`,
}));

async function setup(page, options = {}) {
  const state = { progress: initialProgress(options), history: savedHistory(), submissions: [], unexpectedWrites: [], errors: [] };
  page.on("pageerror", error => state.errors.push(error.message));
  // Pause browser time before loading. Tests advance the *existing* configured
  // durations; no production timing, data, reward, or progression is replaced.
  await page.clock.install({ time: FIXED_TIME });
  await page.clock.pauseAt(new Date(FIXED_TIME.getTime() + 100));
  await page.addInitScript(({ muted }) => {
    localStorage.setItem("token", "level-one-ui-review");
    localStorage.setItem("studentId", "level-one-ui-review");
    localStorage.setItem("i18nextLng", "en");
    localStorage.setItem("lexiland-wm-muted", String(muted));
    Math.random = () => 0.73;
    window.__uiSpeech = [];
    window.speechSynthesis.speak = utterance => {
      window.__uiSpeech.push(utterance.text);
      queueMicrotask(() => { utterance.onstart?.(); utterance.onend?.(); });
    };
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.getVoices = () => [];
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
    window.__uiSounds = [];
    window.AudioContext = class {
      constructor() { this.currentTime = 0; this.state = "running"; this.destination = {}; this.notes = []; window.__uiSounds.push(this.notes); }
      createOscillator() {
        return { frequency: { setValueAtTime: frequency => this.notes.push(frequency) }, connect() {}, start() {}, stop() {} };
      }
      createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
      resume() { return Promise.resolve(); }
      close() { return Promise.resolve(); }
    };
    window.webkitAudioContext = window.AudioContext;
  }, { muted: options.muted ?? false });
  await page.route(/https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//, route => route.abort());
  await page.route("**/api/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/students/profile")) {
      return route.fulfill({ json: { _id: "level-one-ui-review", fullName: "UI Review", grade: GRADE, totalStars: state.progress.totalStars } });
    }
    if (url.pathname.includes("/working-memory/improvement/progress/")) {
      return route.fulfill({ json: { success: true, data: state.progress } });
    }
    if (url.pathname.includes("/working-memory/improvement/history/")) {
      const level = Number(url.searchParams.get("levelNumber"));
      const game = url.searchParams.get("subCategoryKey");
      return route.fulfill({ json: { success: true, data: state.history.filter(item => (!level || item.levelNumber === level) && (!game || item.subCategoryKey === game)) } });
    }
    if (url.pathname.endsWith("/working-memory/improvement/submit-attempt")) {
      const attempt = request.postDataJSON();
      state.submissions.push(attempt);
      const level = state.progress.levelsProgress.find(item => item.levelNumber === attempt.levelNumber);
      const category = level.subCategories.find(item => item.subCategoryKey === attempt.subCategoryKey);
      const isPassed = attempt.score / attempt.totalQuestions >= 0.6;
      category.bestScore = Math.max(category.bestScore, attempt.score);
      category.totalAttempts += 1;
      category.isCompleted ||= isPassed;
      const next = level.subCategories[SUBCATEGORY_ORDER.indexOf(attempt.subCategoryKey) + 1];
      if (isPassed && next) next.isUnlocked = true;
      if (isPassed && level.subCategories.every(item => item.isCompleted)) {
        level.isCompleted = true;
        const nextLevel = state.progress.levelsProgress.find(item => item.levelNumber === attempt.levelNumber + 1);
        if (nextLevel) nextLevel.subCategories[0].isUnlocked = true;
        state.progress.maxUnlockedLevel = Math.max(state.progress.maxUnlockedLevel, attempt.levelNumber + 1);
      }
      const starsEarned = attempt.score * 5;
      state.progress.totalStars += starsEarned;
      state.progress.totalCarrots = state.progress.totalStars;
      const saved = { ...attempt, _id: `mock-attempt-${state.submissions.length}`, starsEarned, carrotsEarned: starsEarned, completedAt: "2026-10-17T06:10:00.000Z" };
      state.history.unshift(saved);
      return route.fulfill({ status: 201, json: { success: true, data: { isPassed, attempt: saved, progress: state.progress, starsEarned, totalStars: state.progress.totalStars } } });
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) state.unexpectedWrites.push(`${request.method()} ${url.pathname}`);
    return route.fulfill({ json: { success: true, data: [] } });
  });
  return state;
}

async function advance(page, milliseconds) {
  await page.clock.runFor(milliseconds);
  // Give React's state effects a turn after the final clock event.
  await page.evaluate(() => new Promise(resolve => queueMicrotask(resolve)));
}

async function doubleActivate(locator) {
  await expect(locator).toBeEnabled();
  await locator.evaluate(button => { button.click(); button.click(); });
}

async function startGame(page, game, { level = 2, inspect } = {}) {
  await page.goto(`/improvement-activity-wm/${GRADE}/${level}/${game}`);
  await expect(page.locator(".lx-video-howto")).toBeVisible();
  if (inspect) await inspect("how-to");
  await page.getByRole("button", { name: "Skip & Play", exact: true }).click();
  await expect(page.locator(".lx-board[data-question-id]")).toBeVisible();
}

async function currentQuestion(page, game, level = 2) {
  const id = await page.locator(".lx-board[data-question-id]").getAttribute("data-question-id");
  const question = getSubCategoryData(GRADE, level, game, "en").questions.find(item => item.id === id);
  expect(question, `rendered ${game} question exists in the unchanged question bank`).toBeTruthy();
  return question;
}

async function tracker(page, index) {
  const list = page.locator(".lx-level-two .lx-tracker");
  const items = list.locator(".lx-step");
  const answered = await page.locator(".lx-phase--feedback").count() > 0;
  const completed = index + Number(answered);
  await expect(items).toHaveCount(5);
  await expect(items.nth(index)).toHaveAttribute("aria-current", "step");
  await expect(items.nth(index)).toHaveClass(answered ? /is-done/ : /is-current/);
  await expect(list.locator("[aria-current=step]")).toHaveCount(1);
  await expect(list.locator(".is-done > b")).toHaveCount(completed);
  await expect(list.locator(".is-upcoming")).toHaveCount(4 - index);
  // The current wooden tracker uses five grid cells and marks answered questions.
  const alignment = await list.evaluate(element => {
    const box = element.getBoundingClientRect();
    const stage = element.closest(".lx-stage");
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
    const active = element.querySelector("[aria-current=step]");
    const circles = [...element.children].map((child, i) => {
      const r = child.getBoundingClientRect();
      return { x: ((r.left + r.right) / 2 - box.left - (i + .5) * box.width / 5) / scale,
        y: (r.top + r.bottom - box.top - box.bottom) / 2 / scale,
        width: r.width / scale };
    });
    return { background: getComputedStyle(element).backgroundImage,
      shadow: getComputedStyle(active).boxShadow, circles,
      coveredNumbers: [...element.querySelectorAll(".lx-step > b")].filter(badge => {
        const circle = badge.parentElement.getBoundingClientRect();
        const badgeBox = badge.getBoundingClientRect();
        const centerX = (circle.left + circle.right) / 2;
        const centerY = (circle.top + circle.bottom) / 2;
        return centerX > badgeBox.left && centerX < badgeBox.right && centerY > badgeBox.top && centerY < badgeBox.bottom;
      }).length };
  });
  expect(alignment.background).toContain("nav-tracker.png");
  if (!answered) expect(alignment.shadow).not.toBe("none");
  for (const circle of alignment.circles) {
    expect(Math.abs(circle.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(circle.y)).toBeLessThanOrEqual(1);
    expect(circle.width).toBeCloseTo(45, 0);
  }
  expect(alignment.coveredNumbers).toBe(0);
}

async function questionToAnswer(page, game, q, { inspect, checkReadyTiming = false } = {}) {
  if (game === "pattern") {
    await expect(page.locator(".lx-pattern-options")).toBeVisible();
    if (inspect) await inspect("answer");
    return;
  }
  if (game === "instructions") {
    await expect(page.locator(".lx-listening-bunny")).toHaveCount(1);
    await expect(page.locator(".lx-bunny")).toHaveCount(0);
    await expect(page.locator(".lx-instruction-options")).toHaveCount(0);
    if (inspect) await inspect("listen-ready");
    await page.getByRole("button", { name: "Listen", exact: true }).click();
    await advance(page, (parseInstructionSteps(q.instruction).length + 1) * 1000);
    await expect(page.getByRole("button", { name: "Show the Question", exact: true })).toBeVisible();
    if (inspect) await inspect("listened");
    await page.getByRole("button", { name: "Show the Question", exact: true }).click();
    await expect(page.locator(".lx-instruction-options")).toBeVisible();
    if (inspect) await inspect("answer");
    return;
  }
  const ready = page.getByRole("button", { name: "Ready", exact: true });
  await expect(ready).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.locator(".lx-keypad,.lx-picture-pool")).toHaveCount(0);
  if (game === "numbers") await expect(page.locator(".lx-numbers-show")).toHaveCount(0);
  else await expect(page.locator(".lx-picture-sequence [data-item-id]")).toHaveCount(0);
  if (inspect) await inspect("ready");
  if (checkReadyTiming) {
    await advance(page, 20_000);
    await expect(ready).toBeVisible();
    await expect(page.getByRole("timer")).toHaveCount(0);
    await expect(page.locator(".lx-keypad")).toHaveCount(0);
  }
  if (game === "numbers") await doubleActivate(ready);
  else await ready.click();
  const duration = game === "words" ? 10 : getLevelDisplaySeconds(2);
  await expect(page.getByRole("timer")).toHaveAttribute("aria-label", `${duration} seconds remaining`);
  if (game === "numbers") await expect(page.locator(".lx-numbers-show .lx-number")).toHaveText(q.showItems);
  else await expect(page.locator(".lx-picture-sequence [data-item-id]")).toHaveCount(q.showItems.length);
  if (inspect) await inspect("memorize");
  if (checkReadyTiming) {
    await advance(page, (duration - 1) * 1000);
    await expect(page.getByRole("timer")).toHaveAttribute("aria-label", "1 seconds remaining");
    await expect(page.locator(".lx-keypad,.lx-picture-pool")).toHaveCount(0);
    await advance(page, 1000);
  } else await advance(page, duration * 1000);
  await expect(page.locator(game === "numbers" ? ".lx-keypad" : ".lx-picture-pool")).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  if (game === "numbers") {
    await expect(page.locator(".lx-numbers-show")).toHaveCount(0);
    const rows = await page.locator(".lx-keypad .lx-number").evaluateAll(buttons => new Set(buttons.map(button => Math.round(button.getBoundingClientRect().top))).size);
    expect(rows, "number keypad retains exactly two rows").toBe(2);
  }
  if (inspect) await inspect("answer");
}

async function answer(page, game, q, correct, { exerciseUndo = false, drag = false } = {}) {
  if (game === "pattern") {
    const choice = correct ? q.missingAnswer : (q.options || q.dragPool).find(value => value !== q.missingAnswer);
    const target = page.getByRole("button", { name: `Answer: ${choice}`, exact: true });
    const before = await target.boundingBox();
    await target.click();
    await expect(target).toHaveAttribute("aria-pressed", "true");
    expect(await target.boundingBox(), "selection does not resize or move a pattern card").toEqual(before);
    await doubleActivate(page.locator(".lx-pattern-check"));
    return;
  }
  if (game === "instructions") {
    const choice = correct ? q.correct : q.options.find(value => value !== q.correct);
    await doubleActivate(page.locator(".lx-instruction-option").filter({ hasText: choice }).first());
    return;
  }
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await expect(page.getByRole("button", { name: /Start\s*over/i })).toHaveCount(0);
  const values = correct ? q.correct : [...q.correct].reverse();
  if (game === "numbers") {
    if (exerciseUndo) {
      await page.getByRole("button", { name: `Digit ${values[0]}`, exact: true }).click();
      await undo.click();
      await expect(page.locator(".lx-number-slot.is-empty")).toHaveCount(q.correct.length);
    }
    for (const value of values) await page.getByRole("button", { name: `Digit ${value}`, exact: true }).click();
    await expect(page.locator(".lx-number-slot")).toHaveText(values);
  } else {
    if (exerciseUndo) {
      const first = page.locator(`.lx-picture-pool [data-item-id="${values[0].id}"]`);
      await first.click();
      await expect(page.locator(".lx-picture-slots [data-item-id]")).toHaveCount(1);
      await undo.click();
      await expect(page.locator(".lx-picture-slots [data-item-id]")).toHaveCount(0);
      await expect(page.locator(".lx-picture-pool [data-item-id]")).toHaveCount(q.correct.length);
    }
    for (const [i, value] of values.entries()) {
      const source = page.locator(`.lx-picture-pool [data-item-id="${value.id}"]`);
      if (drag) await source.dragTo(page.locator(".lx-picture-slot").nth(i));
      else await source.click();
    }
    expect(await page.locator(".lx-picture-slots [data-item-id]").evaluateAll(cards => cards.map(card => card.dataset.itemId))).toEqual(values.map(value => value.id));
  }
  await doubleActivate(page.getByRole("button", { name: "Submit", exact: true }));
}

async function checkGeometry(page, { question = true } = {}) {
  const root = page.locator(".lx-level-two");
  await expect(root.locator(".lx-background")).toHaveAttribute("src", /\/backgrounds\/bg-level2\.webp$/);
  await expect(root.locator(".lx-bucket")).toHaveCount(0);
  await root.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
  const result = await root.evaluate(screen => {
    const stage = screen.querySelector(".lx-stage");
    const stageBox = stage.getBoundingClientRect();
    const scale = stageBox.width / stage.offsetWidth;
    const rect = element => element?.getBoundingClientRect();
    const board = rect(screen.querySelector(".lx-board"));
    const nav = rect(screen.querySelector(".lx-nav"));
    const tracker = rect(screen.querySelector(".lx-tracker"));
    const feedback = rect(screen.querySelector(".lx-level-one-feedback"));
    const bunny = rect(screen.querySelector(".lx-bunny,.lx-pattern-result-bunny"));
    const controls = [...screen.querySelectorAll(".lx-nav-left,.lx-nav-right")].map(rect);
    const content = [...screen.querySelectorAll([
      ".lx-question-heading", ".lx-pattern-sequence", ".lx-pattern-options", ".lx-pattern-response",
      ".lx-picture-sequence", ".lx-card-rows", ".lx-numbers-show", ".lx-number-slots", ".lx-keypad",
      ".lx-instruction-options", ".lx-listening-scene", ".lx-actions", ".lx-reminder", ".lx-timer",
      ".lx-pattern-result-heading", ".lx-pattern-score", ".lx-pattern-statistics", ".lx-pattern-result-actions",
    ].join(","))].filter(element => element.closest(".lx-board") && rect(element).width > 0 && rect(element).height > 0).map(element => {
      const box = rect(element);
      return { name: element.className, left: (box.left - board.left) / scale, right: (board.right - box.right) / scale, top: (box.top - board.top) / scale, bottom: (board.bottom - box.bottom) / scale };
    });
    const intersection = (a, b) => a && b ? Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1 : false;
    const steps = [...screen.querySelectorAll(".lx-tracker .lx-step")].map(rect);
    const currentCircle = screen.querySelector(".lx-step[aria-current=step]");
    const activeBox = rect(currentCircle);
    const activeIndex = currentCircle ? [...currentCircle.parentElement.children].indexOf(currentCircle) : 0;
    const ringOffset = currentCircle && tracker ? {
      x: ((activeBox.left + activeBox.right) / 2 - tracker.left - (activeIndex + .5) * tracker.width / 5) / scale,
      y: (activeBox.top + activeBox.bottom - tracker.top - tracker.bottom) / 2 / scale,
    } : null;
    const primaryStyles = [...screen.querySelectorAll(".lx-button:not(.lx-button--secondary),.lx-pattern-check,.lx-pattern-next,.lx-howto-skip,.lx-howto-watch")]
      .filter(element => !element.disabled && rect(element).width > 0).map(element => {
        const style = getComputedStyle(element);
        const background = `${style.backgroundImage} ${style.backgroundColor}`;
        const colors = [...background.matchAll(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/g)].map(match => match.slice(1).map(Number));
        return { name: element.className, orange: /orange/.test(background) || colors.some(([r,g,b]) => g > r && g > b) };
      });
    return {
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      navOverlap: intersection(controls[0], controls[1]),
      navBounds: controls.map(box => ({ left: (box.left - stageBox.left) / scale, right: (stageBox.right - box.right) / scale })),
      tracker: tracker && board ? { center: ((tracker.left + tracker.right - board.left - board.right) / 2) / scale, boardGap: (board.top - tracker.bottom) / scale, headerGap: (tracker.top - nav.bottom) / scale } : null,
      stepWidths: steps.map(box => box.width / scale),
      stepCenters: steps.map(box => (box.left + box.right) / 2 / scale),
      stepTops: steps.map(box => box.top / scale),
      ringOffset,
      nonOrangePrimary: primaryStyles.filter(item => !item.orange),
      frameCollisions: content.filter(item => [item.left, item.right, item.top, item.bottom].some(distance => distance < 27)),
      feedbackBoardOverlap: intersection(feedback, board),
      feedbackBunnyOverlap: intersection(feedback, bunny),
      feedbackBottom: feedback ? (stageBox.bottom - feedback.bottom) / scale : null,
      starClipping: (() => { const badge = screen.querySelector(".lx-nav-stars"); const value = badge?.querySelector("strong"); if (!badge || !value) return false; const a = rect(badge), b = rect(value); return b.left < a.left || b.right > a.right || b.top < a.top || b.bottom > a.bottom; })(),
    };
  });
  expect(result.horizontalOverflow).toBe(false);
  expect(result.navOverlap, "long game plaque does not collide with stars/music").toBe(false);
  expect(result.navBounds.every(item => item.left >= 19 && item.right >= 19)).toBe(true);
  expect(result.starClipping, "large real star totals remain inside the padded badge").toBe(false);
  expect(result.nonOrangePrimary, "enabled primary actions retain the shared green theme").toEqual([]);
  expect(result.frameCollisions, "question/dashboard content clears the wooden frame").toEqual([]);
  expect(result.feedbackBoardOverlap, "feedback sits below the board").toBe(false);
  expect(result.feedbackBunnyOverlap, "feedback does not cover the bunny").toBe(false);
  if (result.feedbackBottom !== null) expect(result.feedbackBottom).toBeGreaterThanOrEqual(10);
  if (question && result.tracker) {
    expect(Math.abs(result.tracker.center)).toBeLessThanOrEqual(2);
    expect(result.tracker.boardGap, "the existing tracker keeps its baseline position above the board").toBeCloseTo(-4, 0);
    expect(result.tracker.headerGap).toBeGreaterThanOrEqual(4);
    expect(Math.max(...result.stepWidths) - Math.min(...result.stepWidths)).toBeLessThanOrEqual(1);
    expect(Math.max(...result.stepTops) - Math.min(...result.stepTops)).toBeLessThanOrEqual(1);
    const gaps = result.stepCenters.slice(1).map((center, i) => center - result.stepCenters[i]);
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1);
    expect(result.ringOffset, "the current question belongs to a visible wooden tracker cell").not.toBeNull();
    expect(Math.abs(result.ringOffset.x), "highlight is centered horizontally around the wooden circle").toBeLessThanOrEqual(1);
    expect(Math.abs(result.ringOffset.y), "highlight is centered vertically around the wooden circle").toBeLessThanOrEqual(1);
  }
}

async function waitForViewport(page) {
  await expect.poll(() => page.evaluate(() => {
    const stage = document.querySelector(".lx-stage");
    return Math.abs(stage.getBoundingClientRect().width / stage.offsetWidth - Math.min(innerWidth / 1600, innerHeight / 900)) < .001;
  })).toBe(true);
}

async function atBothSizes(page, testInfo, name, question = true) {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await waitForViewport(page);
    await checkGeometry(page, { question });
    if (name) await page.screenshot({ path: testInfo.outputPath(`${name}-${viewport.width}.png`) });
  }
  await page.setViewportSize(VIEWPORTS[0]);
  await waitForViewport(page);
}

async function playAttempt(page, state, game, score, { testInfo, geometry = false } = {}) {
  let rewards = 0;
  const inspect = geometry ? name => atBothSizes(page, testInfo, `${game}-${name}`) : undefined;
  await startGame(page, game, { inspect });
  for (let index = 0; index < 5; index++) {
    const q = await currentQuestion(page, game);
    await tracker(page, index);
    const boardBefore = await board(page).boundingBox();
    const trackerBefore = await page.locator(".lx-tracker").boundingBox();
    await questionToAnswer(page, game, q, { inspect: index === 0 ? inspect : undefined, checkReadyTiming: index === 0 && game === "numbers" });
    const correct = index < score;
    await answer(page, game, q, correct, { exerciseUndo: index === 0, drag: game === "words" && index === 0 });
    rewards += correct ? 5 : 0;
    await expect(feedback(page)).toBeVisible();
    await expect(feedback(page)).toHaveAttribute("role", "status");
    await expect(feedback(page).locator(".lx-feedback-stars img")).toHaveCount(3);
    for (const image of await feedback(page).locator("img").all()) await expect(image).toHaveAttribute("alt", "");
    await expect(feedback(page)).toContainText(correct ? /correct|great|well done/i : /not quite|keep trying|good try/i);
    await expect(feedback(page)).not.toContainText(/correct answer|correct sequence|the answer (is|was)/i);
    await expect(page.locator(".lx-feedback-summary")).toHaveCount(0);
    await expect(feedback(page).locator(".lx-picture,.lx-pattern-option,.lx-number")).toHaveCount(0);
    await expect(page.locator(".lx-nav-stars")).toHaveAttribute("aria-label", `${BASE_STARS + rewards} stars`);
    await tracker(page, index); // Submitting must keep aria-current on the answered question.
    expect(await board(page).boundingBox(), "board position remains fixed across memory, answer, feedback").toEqual(boardBefore);
    expect(await page.locator(".lx-tracker").boundingBox(), "completion/highlight does not move the tracker").toEqual(trackerBefore);
    if ((index === 0 || index === 4) && inspect) await inspect(correct ? "correct-feedback" : "incorrect-feedback");
    expect(state.submissions, "save only after the final Next, once per activity").toHaveLength(0);
    const next = board(page).getByRole("button", { name: /^(Next|See results)$/i });
    await doubleActivate(next);
    if (index < 4) await expect(page.locator(".lx-tracker [aria-current=step]")).toHaveAttribute("aria-label", new RegExp(`Question ${index + 2}`));
  }
  const dashboard = page.locator(".lx-level-one-dashboard.lx-pattern-result");
  await expect(dashboard).toBeVisible();
  await expect(dashboard.locator(".lx-pattern-score")).toContainText(`${score} / 5`);
  await expect(dashboard).toContainText(NAMES[game]);
  await expect(dashboard).toContainText(/Level 2/);
  await expect(dashboard.locator(".lx-pattern-statistics .is-correct strong")).toHaveText(String(score));
  await expect(dashboard.locator(".lx-pattern-statistics .is-incorrect strong")).toHaveText(String(5 - score));
  await expect(dashboard.locator(".lx-pattern-statistics .is-stars strong")).toHaveText(String(score * 5));
  await expect(page.locator(".lx-pattern-result-bunny")).toHaveAttribute("src", new RegExp(`bunny-${score >= 3 ? "happy" : "sad"}\\.webp$`));
  await expect(dashboard.locator(".lx-pattern-save-status")).not.toContainText(/Saving/);
  expect(state.submissions).toHaveLength(1);
  expect(state.submissions[0]).toMatchObject({ grade: GRADE, levelNumber: 2, subCategoryKey: game, score, totalQuestions: 5 });
  expect(state.submissions[0].questionResults).toHaveLength(5);
  expect(new Set(state.submissions[0].questionResults.map(result => result.questionId)).size).toBe(5);
  expect(state.submissions[0].questionResults.filter(result => result.isCorrect)).toHaveLength(score);
  expect(state.unexpectedWrites).toEqual([]);
  expect(state.errors).toEqual([]);
  if (geometry) await atBothSizes(page, testInfo, `${game}-score-${score}`, false);
  return dashboard;
}

for (const game of SUBCATEGORY_ORDER) for (const score of [1, 3, 4]) {
  test(`${NAMES[game]}: five questions, ${score}/5 dashboard, feedback, rewards and progression`, async ({ page }, testInfo) => {
    const muted = score === 1;
    const state = await setup(page, { muted, completed: game === "numbers" ? ["pattern", "words", "instructions"] : [] });
    const dashboard = await playAttempt(page, state, game, score, { testInfo, geometry: score === 4 });
    const sounds = await page.evaluate(() => window.__uiSounds);
    if (muted) expect(sounds).toEqual([]);
    else expect(sounds.map(notes => notes.length), "one gentle sound per submission; decorative stars add no rewards or sound plays").toEqual(Array.from({ length: 5 }, (_, i) => i < score ? 4 : 2));
    const continuation = dashboard.locator(".lx-pattern-continue");
    if (score < 3) {
      await expect(continuation).toBeDisabled();
      await expect(dashboard.locator(".lx-pattern-save-status")).toContainText(/3.*5|60%/);
      await dashboard.locator(".lx-pattern-retry").click();
      await expect(page.locator(".lx-tracker")).toBeVisible();
      await tracker(page, 0);
    } else if (game !== "numbers") {
      await expect(continuation).toBeEnabled();
      await continuation.click();
      const next = SUBCATEGORY_ORDER[SUBCATEGORY_ORDER.indexOf(game) + 1];
      await expect(page).toHaveURL(new RegExp(`/2/${next}$`));
      await expect(page.locator(".lx-video-howto")).toBeVisible();
    } else {
      await expect(continuation).toHaveText(/View Level Results/i);
      await continuation.click();
      const summary = page.locator(".lx-level-one-dashboard");
      await expect(summary).toContainText("Level 2 Complete");
      await expect(page.locator(".lx-background")).toHaveAttribute("src", /bg-level2\.webp$/);
      await expect(page.locator(".lx-pattern-result-bunny")).toHaveAttribute("src", /bunny-happy\.webp$/);
      const expected = { pattern: 35, words: 30, instructions: 40, numbers: 25 + score * 5 };
      for (const [key, value] of Object.entries(expected)) {
        await expect(summary.locator(".lx-level-one-category").filter({ hasText: NAMES[key] })).toContainText(String(value));
      }
      await expect(summary.locator(".lx-level-one-total")).toContainText(String(130 + score * 5));
      await expect(summary).not.toContainText(/Remember these numbers|Enter the numbers/);
      if (score === 4) await atBothSizes(page, testInfo, "level-one-complete", false);
      await summary.getByRole("button", { name: /Next Level/i }).click();
      await expect(page).toHaveURL(/\/3\/pattern$/);
      await expect(page.locator(".lx-background")).toHaveAttribute("src", /bg-level3\.webp$/);
    }
    expect(state.submissions).toHaveLength(1);
  });
}

test("sound control changes the following feedback effect without changing star rewards", async ({ page }) => {
  const state = await setup(page, { muted: true });
  await startGame(page, "pattern");
  let q = await currentQuestion(page, "pattern");
  await answer(page, "pattern", q, true);
  await expect(feedback(page)).toBeVisible();
  expect(await page.evaluate(() => window.__uiSounds)).toEqual([]);
  await page.getByRole("button", { name: "Unmute music", exact: true }).click();
  await board(page).getByRole("button", { name: "Next", exact: true }).click();
  q = await currentQuestion(page, "pattern");
  await answer(page, "pattern", q, false);
  await expect(feedback(page)).toBeVisible();
  expect(await page.evaluate(() => window.__uiSounds.map(notes => notes.length))).toEqual([2]);
  await expect(page.locator(".lx-nav-stars")).toHaveAttribute("aria-label", `${BASE_STARS + 5} stars`);
  expect(state.submissions).toEqual([]);
});
