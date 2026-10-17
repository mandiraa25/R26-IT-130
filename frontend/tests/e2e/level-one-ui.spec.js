import { test, expect } from "@playwright/test";
import { expectFeedbackBelowBoard, expectImprovementFeedback, expectImprovementTracker } from "./helpers/workingMemoryUi";
import { getSubCategoryData } from "../../src/features/workingMemory/improvement/data";
import { getLevelDisplaySeconds, SUBCATEGORY_ORDER } from "../../src/features/workingMemory/config/gameConfig";
import { parseInstructionSteps } from "../../src/features/workingMemory/logic/presentation";

const GRADE = "2";
const BASE_STARS = 98_765; // Deliberately large enough to catch badge clipping.
const VIEWPORTS = [{ width: 1366, height: 768 }, { width: 2878, height: 1540 }];
const NAMES = { pattern: "Pattern Recognition", words: "Picture Memory", instructions: "Following Instructions", numbers: "Number Memory" };
const FIXED_TIME = new Date("2026-10-17T06:00:00.000Z");
const CORRECT_FEEDBACK_NOTES = [523.25, 659.25, 783.99, 1046.5];
const INCORRECT_FEEDBACK_NOTES = [220, 164.81];
const board = page => page.locator(".lx-level-one .lx-board");
const feedback = page => page.getByTestId("level-one-feedback");

function initialProgress({ completed = [], nextUnlocked = false } = {}) {
  return {
    studentId: "level-one-ui-review",
    isIdentificationCompleted: true,
    initialIdentifiedLevel: 1,
    maxUnlockedLevel: nextUnlocked ? 2 : 1,
    totalStars: BASE_STARS,
    totalCarrots: BASE_STARS,
    levelsProgress: [1, 2, 3, 4].map(levelNumber => ({
      levelNumber,
      isCompleted: levelNumber === 1 && completed.length === 4,
      subCategories: SUBCATEGORY_ORDER.map(subCategoryKey => ({
        subCategoryKey,
        isUnlocked: levelNumber <= 2,
        isCompleted: levelNumber === 1 && completed.includes(subCategoryKey),
        bestScore: levelNumber === 1 && completed.includes(subCategoryKey) ? 5 : 0,
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
  _id: `saved-${i}`, studentId: "level-one-ui-review", levelNumber: 1,
  subCategoryKey, score, totalQuestions: 5, starsEarned: score * 5,
  carrotsEarned: score * 5, completedAt: `2026-10-${String(i + 1).padStart(2, "0")}T06:00:00.000Z`,
}));

async function setup(page, options = {}) {
  const state = { progress: initialProgress(options), history: savedHistory(), submissions: [], unexpectedWrites: [], errors: [] };
  page.on("pageerror", error => state.errors.push(error.message));
  // Pause browser time before loading. Tests advance the *existing* configured
  // durations; no production timing, data, reward, or progression is replaced.
  await page.clock.install({ time: FIXED_TIME });
  await page.clock.pauseAt(new Date(FIXED_TIME.getTime() + 60_000));
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
    window.__uiMediaStates = [];
    const mediaStates = new WeakMap();
    const recordMedia = element => {
      let record = mediaStates.get(element);
      if (!record) {
        record = { src: element.src || element.currentSrc, paused: true, playCalls: 0, pauseCalls: 0 };
        mediaStates.set(element, record);
        window.__uiMediaStates.push(record);
      }
      return record;
    };
    HTMLMediaElement.prototype.play = function () {
      const record = recordMedia(this); record.paused = false; record.playCalls++;
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      const record = recordMedia(this); record.paused = true; record.pauseCalls++;
    };
    window.__uiSounds = [];
    window.AudioContext = class {
      constructor() { this.currentTime = 0; this.state = "running"; this.destination = {}; this.notes = []; window.__uiSounds.push(this.notes); }
      createOscillator() {
        return { frequency: { setValueAtTime: frequency => this.notes.push(frequency) }, connect() {}, disconnect() {}, start() {}, stop() {} };
      }
      createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
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

async function startGame(page, game, { level = 1, inspect } = {}) {
  await page.goto(`/improvement-activity-wm/${GRADE}/${level}/${game}`);
  await expect(page.locator(".lx-video-howto")).toBeVisible();
  if (inspect) await inspect("how-to");
  await page.getByRole("button", { name: "Skip & Play", exact: true }).click();
  await expect(page.locator(".lx-board[data-question-id]")).toBeVisible();
}

async function currentQuestion(page, game, level = 1) {
  const id = await page.locator(".lx-board[data-question-id]").getAttribute("data-question-id");
  const question = getSubCategoryData(GRADE, level, game, "en").questions.find(item => item.id === id);
  expect(question, `rendered ${game} question exists in the unchanged question bank`).toBeTruthy();
  return question;
}

async function tracker(page, index) {
  await expectImprovementTracker(page, index);
}

async function questionToAnswer(page, game, q, { inspect, checkReadyTiming = false } = {}) {
  if (game === "pattern") {
    await expect(page.locator(".lx-pattern-options")).toBeVisible();
    if (inspect) await inspect("answer");
    return;
  }
  if (game === "instructions") {
    await expect(page.locator(".lx-listening-bunny")).toHaveCount(1);
    await expect(page.locator(".lx-bunny")).toHaveCount(1);
    await expect(page.locator(".lx-instruction-options")).toHaveCount(0);
    if (inspect) await inspect("listen-ready");
    await page.getByRole("button", { name: "Listen", exact: true }).click();
    await advance(page, (parseInstructionSteps(q.instruction).length + 1) * 1000);
    await expect(page.getByRole("button", { name: "Show question", exact: true })).toBeVisible();
    if (inspect) await inspect("listened");
    await page.getByRole("button", { name: "Show question", exact: true }).click();
    await expect(page.locator(".lx-instruction-options")).toBeVisible();
    if (inspect) await inspect("answer");
    return;
  }
  const ready = page.getByRole("button", { name: "Ready", exact: true });
  await expect(ready).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.locator(".lx-keypad,.lx-picture-pool")).toHaveCount(0);
  if (game === "numbers") {
    await expect(page.locator(".lx-numbers-show,.lx-number-slots")).toHaveCount(0);
    const blanks = page.locator(".lx-number-ready[data-number-stage=ready] .lx-number-concealed .lx-number");
    await expect(blanks).toHaveCount(q.showItems.length);
    await expect(blanks).toHaveText(q.showItems.map(() => ""));
    for (const blank of await blanks.all()) await expect(blank).toBeDisabled();
  }
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
  const duration = game === "words" ? 10 : getLevelDisplaySeconds(1);
  await expect(page.getByRole("timer")).toHaveAttribute("aria-label", `${duration} seconds remaining`);
  if (game === "numbers") {
    await expect(page.locator(".lx-numbers-show[data-number-stage=reveal] .lx-number")).toHaveText(q.showItems);
    await expect(page.locator(".lx-number-slots,.lx-keypad")).toHaveCount(0);
  }
  else await expect(page.locator(".lx-picture-sequence [data-item-id]")).toHaveCount(q.showItems.length);
  if (inspect) await inspect("memorize");
  // Commit each existing timer tick before advancing the next virtual second.
  await advance(page, 50);
  for (let remaining = duration - 1; remaining >= 0; remaining--) {
    await advance(page, 1000);
    if (remaining > 0) {
      await expect(page.getByRole("timer")).toHaveAttribute("aria-label", `${remaining} seconds remaining`);
      await expect(page.locator(".lx-keypad,.lx-picture-pool")).toHaveCount(0);
    }
  }
  await expect(page.locator(game === "numbers" ? ".lx-keypad" : ".lx-picture-pool")).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  if (game === "numbers") {
    await expect(page.locator(".lx-numbers-show")).toHaveCount(0);
    await expect(page.locator(".lx-number-slots[data-number-stage=recall]")).toBeVisible();
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
  const root = page.locator(".lx-level-one");
  await expect(root.locator(".lx-background")).toHaveAttribute("src", /\/backgrounds\/bg-level1\.webp$/);
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
    const controls = [...screen.querySelectorAll(".lx-nav-left,.lx-nav-right")].map(rect);
    const content = [...screen.querySelectorAll([
      ".lx-question-heading", ".lx-pattern-sequence", ".lx-pattern-options", ".lx-pattern-response",
      ".lx-picture-sequence", ".lx-card-rows", ".lx-numbers-show", ".lx-number-slots", ".lx-keypad",
      ".lx-instruction-options", ".lx-listening-scene", ".lx-actions", ".lx-reminder", ".lx-timer",
      ".lx-pattern-result-heading", ".lx-pattern-score", ".lx-pattern-statistics", ".lx-pattern-result-actions",
      ".lx-feedback-footer", ".lx-answer-feedback", ".lx-pattern-save-status",
    ].join(","))].filter(element => element.closest(".lx-board") && rect(element).width > 0 && rect(element).height > 0).map(element => {
      const box = rect(element);
      return { name: element.className, left: (box.left - board.left) / scale, right: (board.right - box.right) / scale, top: (box.top - board.top) / scale, bottom: (board.bottom - box.bottom) / scale };
    });
    const intersection = (a, b) => a && b ? Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1 : false;
    const steps = [...screen.querySelectorAll(".lx-tracker .lx-step")].map(rect);
    const currentCircle = screen.querySelector(".lx-step[aria-current=step]");
    const activeBox = rect(currentCircle);
    const activeIndex = currentCircle ? [...currentCircle.parentElement.children].indexOf(currentCircle) : 0;
    const trackerGrid = screen.querySelector(".lx-tracker") && getComputedStyle(screen.querySelector(".lx-tracker")).display === "grid";
    const ringOffset = currentCircle && tracker ? {
      x: ((activeBox.left + activeBox.right) / 2 - tracker.left - (trackerGrid ? (activeIndex + .5) / 5 : (100 + activeIndex * 212) / 1050) * tracker.width) / scale,
      y: (activeBox.top + activeBox.bottom - tracker.top - tracker.bottom) / 2 / scale,
    } : null;
    const primaryStyles = [...screen.querySelectorAll(".lx-button:not(.lx-button--secondary),.lx-pattern-check,.lx-pattern-next,.lx-howto-skip,.lx-howto-watch")]
      .filter(element => !element.disabled && rect(element).width > 0).map(element => {
        const style = getComputedStyle(element);
        const background = `${style.backgroundImage} ${style.backgroundColor}`;
        const colors = [...background.matchAll(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/g)].map(match => match.slice(1).map(Number));
        return { name: element.className, orange: /orange/.test(background) || colors.some(([r,g,b]) => r > g && g > b && r - b > 70) };
      });
    return {
      boardPadding: board && !screen.querySelector(".lx-level-one-dashboard") ? (() => { const style = getComputedStyle(screen.querySelector(".lx-board-content")); return { top: parseFloat(style.paddingTop), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), left: parseFloat(style.paddingLeft) }; })() : null,
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
      starClipping: (() => { const badge = screen.querySelector(".lx-nav-stars"); const value = badge?.querySelector("strong"); if (!badge || !value) return false; const a = rect(badge), b = rect(value); return b.left < a.left || b.right > a.right || b.top < a.top || b.bottom > a.bottom; })(),
    };
  });
  expect(result.horizontalOverflow).toBe(false);
  if (result.boardPadding) {
    expect(result.boardPadding.top, "questions clear the vine artwork above the cream content area").toBeGreaterThanOrEqual(64);
    expect(result.boardPadding.bottom).toBeGreaterThanOrEqual(56);
    expect(result.boardPadding.left).toBeGreaterThanOrEqual(80);
    expect(result.boardPadding.right).toBeGreaterThanOrEqual(80);
  }
  expect(result.navOverlap, "long game plaque does not collide with stars/music").toBe(false);
  expect(result.navBounds.every(item => item.left >= 19 && item.right >= 19)).toBe(true);
  expect(result.starClipping, "large real star totals remain inside the padded badge").toBe(false);
  expect(result.nonOrangePrimary, "enabled primary actions retain the shared orange theme").toEqual([]);
  expect(result.frameCollisions, "question/dashboard content clears the wooden frame").toEqual([]);
  await expectFeedbackBelowBoard(page);
  if (question && result.tracker) {
    expect(Math.abs(result.tracker.center)).toBeLessThanOrEqual(2);
    expect(result.tracker.boardGap, "tracker has a clear gap above the vine board").toBeGreaterThanOrEqual(8);
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
    if (name) await page.screenshot({ path: testInfo.outputPath(`${name}-${viewport.width}.png`), animations: "disabled" });
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
    await expectImprovementFeedback(page, { correct });
    await expect(feedback(page).locator(".lx-feedback-stars img")).toHaveCount(correct ? 3 : 0);
    for (const image of await feedback(page).locator("img").all()) await expect(image).toHaveAttribute("alt", "");
    await expect(feedback(page)).toContainText(correct ? /correct|great|well done/i : /oops|try again later/i);
    await expect(feedback(page)).not.toContainText(/not quite|correct sequence|the answer (is|was)/i);
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
  await expect(dashboard).toContainText(/Level 1/);
  await expect(dashboard.locator(".lx-pattern-statistics .is-correct strong")).toHaveText(String(score));
  await expect(dashboard.locator(".lx-pattern-statistics .is-incorrect strong")).toHaveText(String(5 - score));
  await expect(dashboard.locator(".lx-pattern-statistics .is-stars strong")).toHaveText(String(score * 5));
  await expect(page.locator(".lx-pattern-result-bunny")).toHaveAttribute("src", new RegExp(`bunny-${score >= 3 ? "happy" : "sad"}\\.webp$`));
  await expect(dashboard.locator(".lx-pattern-save-status")).not.toContainText(/Saving/);
  expect(state.submissions).toHaveLength(1);
  expect(state.submissions[0]).toMatchObject({ grade: GRADE, levelNumber: 1, subCategoryKey: game, score, totalQuestions: 5 });
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
    expect(sounds, "exactly one correct or incorrect feedback sound per submission, independent of music mute").toEqual(Array.from({ length: 5 }, (_, i) => i < score ? CORRECT_FEEDBACK_NOTES : INCORRECT_FEEDBACK_NOTES));
    expect(await page.evaluate(() => localStorage.getItem("lexiland-wm-muted"))).toBe(String(muted));
    if (muted) {
      const music = await page.evaluate(() => window.__uiMediaStates.filter(record => record.src.includes("/audio/workingMemory/bgmusic.mp3")));
      expect(music).toHaveLength(1);
      expect(music[0].paused).toBe(true);
      expect(music[0].playCalls, "answer sounds do not start muted background music").toBe(0);
    }
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
      await expect(page).toHaveURL(new RegExp(`/1/${next}$`));
      await expect(page.locator(".lx-video-howto")).toBeVisible();
    } else {
      await expect(continuation).toHaveText(/View Level Results/i);
      await continuation.click();
      const summary = page.locator(".lx-level-one-dashboard");
      await expect(summary).toContainText("Level 1 Complete");
      await expect(page.locator(".lx-background")).toHaveAttribute("src", /bg-level1\.webp$/);
      await expect(page.locator(".lx-pattern-result-bunny")).toHaveAttribute("src", /bunny-happy\.webp$/);
      const expected = { pattern: 35, words: 30, instructions: 40, numbers: 25 + score * 5 };
      for (const [key, value] of Object.entries(expected)) {
        await expect(summary.locator(".lx-level-one-category").filter({ hasText: NAMES[key] })).toContainText(String(value));
      }
      await expect(summary.locator(".lx-level-one-total")).toContainText(String(130 + score * 5));
      await expect(summary).not.toContainText(/Remember these numbers|Enter the numbers/);
      if (score === 4) await atBothSizes(page, testInfo, "level-one-complete", false);
      await summary.getByRole("button", { name: /Next Level/i }).click();
      await expect(page).toHaveURL(/\/2\/pattern$/);
      await expect(page.locator(".lx-background")).toHaveAttribute("src", /bg-level2\.webp$/);
    }
    expect(state.submissions).toHaveLength(1);
  });
}

test("feedback sounds stay independent of background music and preserve star rewards", async ({ page }) => {
  const state = await setup(page, { muted: true });
  const musicState = () => page.evaluate(() => ({
    preference: localStorage.getItem("lexiland-wm-muted"),
    media: window.__uiMediaStates.filter(record => record.src.includes("/audio/workingMemory/bgmusic.mp3"))
      .map(({ paused, playCalls }) => ({ paused, playCalls })),
  }));
  await startGame(page, "pattern");
  let q = await currentQuestion(page, "pattern");
  await answer(page, "pattern", q, true);
  await expect(feedback(page)).toBeVisible();
  expect(await page.evaluate(() => window.__uiSounds), "a muted background still allows exactly one correct-answer chime").toEqual([CORRECT_FEEDBACK_NOTES]);
  expect(await musicState(), "feedback does not start background music or change its mute preference").toEqual({ preference: "true", media: [{ paused: true, playCalls: 0 }] });

  await page.getByRole("button", { name: "Unmute music", exact: true }).click();
  await board(page).getByRole("button", { name: "Next", exact: true }).click();
  q = await currentQuestion(page, "pattern");
  await answer(page, "pattern", q, false);
  await expect(feedback(page)).toBeVisible();
  expect(await page.evaluate(() => window.__uiSounds), "incorrect feedback uses the same two-note tone as Phonological Awareness").toEqual([CORRECT_FEEDBACK_NOTES, INCORRECT_FEEDBACK_NOTES]);
  const playing = await musicState();
  expect(playing.preference).toBe("false");
  expect(playing.media).toHaveLength(1);
  expect(playing.media[0].paused).toBe(false);
  await expect(page.locator(".lx-nav-stars")).toHaveAttribute("aria-label", `${BASE_STARS + 5} stars`);

  await page.getByRole("button", { name: "Mute music", exact: true }).click();
  const mutedAgain = await musicState();
  expect(mutedAgain.preference).toBe("true");
  expect(mutedAgain.media[0].paused).toBe(true);
  await board(page).getByRole("button", { name: "Next", exact: true }).click();
  q = await currentQuestion(page, "pattern");
  await answer(page, "pattern", q, true);
  await expect(feedback(page)).toBeVisible();
  expect(await page.evaluate(() => window.__uiSounds), "muting music again keeps feedback audible without duplicate sound plays").toEqual([CORRECT_FEEDBACK_NOTES, INCORRECT_FEEDBACK_NOTES, CORRECT_FEEDBACK_NOTES]);
  expect(await musicState()).toEqual(mutedAgain);
  await expect(page.locator(".lx-nav-stars")).toHaveAttribute("aria-label", `${BASE_STARS + 10} stars`);
  expect(state.submissions).toEqual([]);
  expect(state.unexpectedWrites).toEqual([]);
  expect(state.errors).toEqual([]);
});

test("Level 2 number flow and Screening keep their existing presentation and timing", async ({ page }) => {
  const state = await setup(page, { nextUnlocked: true });
  await startGame(page, "numbers", { level: 2 });
  await expect(page.locator(".lx-level-one")).toHaveCount(0);
  await expect(page.locator(".lx-bucket")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ready", exact: true })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.locator(".lx-numbers-show")).toHaveCount(0);
  await page.getByRole("button", { name: "Ready", exact: true }).click();
  await expect(page.locator(".lx-numbers-show")).toBeVisible();
  await expect(page.getByRole("timer")).toHaveAttribute("aria-label", `${getLevelDisplaySeconds(2)} seconds remaining`);
  await expect(page.locator(".lx-background")).toHaveAttribute("src", /bg-level2\.webp$/);
  await advance(page, getLevelDisplaySeconds(2) * 1000);
  await expect(page.locator(".lx-keypad")).toBeVisible();
  await page.goto("/working-memory/2?demo=true&ids=wm-g2-1");
  await expect(page.locator(".wm-screen")).toBeVisible();
  await expect(page.locator(".lx-level-one")).toHaveCount(0);
  await expect(page.locator(".wm-screen__category")).toHaveText("Pattern Memory");
  await expect(page.getByTestId("wm-pattern-option")).toHaveCount(3);
  await expect(page.locator(".wm-screen__stars li")).toHaveCount(1);
  expect(state.submissions).toEqual([]);
  expect(state.unexpectedWrites).toEqual([]);
  expect(state.errors).toEqual([]);
});

async function finishPatternQuestions(page) {
  await startGame(page, "pattern");
  for (let index = 0; index < 5; index++) {
    await tracker(page, index);
    const question = await currentQuestion(page, "pattern");
    await answer(page, "pattern", question, true);
    await expect(feedback(page)).toBeVisible();
    await tracker(page, index);
    await doubleActivate(board(page).getByRole("button", { name: /^(Next|See results)$/i }));
  }
  return page.locator(".lx-level-one-dashboard.lx-pattern-result");
}

test("a saved attempt can restart while progress refresh is pending, without submitting twice", async ({ page }) => {
  const state = await setup(page);
  let releaseRefresh;
  const refreshGate = new Promise(resolve => { releaseRefresh = resolve; });
  let pendingRefreshes = 0;
  await page.route("**/working-memory/improvement/progress/**", async route => {
    if (state.submissions.length === 0) return route.fallback();
    pendingRefreshes++;
    await refreshGate;
    return route.fallback();
  });
  try {
    const dashboard = await finishPatternQuestions(page);
    await expect(dashboard).toBeVisible();
    await expect.poll(() => state.submissions.length).toBe(1);
    await expect.poll(() => pendingRefreshes).toBe(1);
    await expect(dashboard.locator(".lx-pattern-save-status")).not.toContainText(/Saving/);
    await expect(dashboard.locator(".lx-pattern-retry")).toBeEnabled();
    await dashboard.locator(".lx-pattern-retry").click();
    await tracker(page, 0);
    await expect(page.locator(".lx-tracker .is-done")).toHaveCount(0);
    releaseRefresh();
    await expect(page.locator(".lx-board[data-question-id]")).toBeVisible();
    await tracker(page, 0);
    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0]).toMatchObject({ score: 5, totalQuestions: 5 });
    expect(state.errors).toEqual([]);
  } finally {
    releaseRefresh();
  }
});

test("failed saving retries the same scored attempt once and leaves progression disabled until saved", async ({ page }) => {
  const state = await setup(page);
  const attemptedPayloads = [];
  await page.route("**/working-memory/improvement/submit-attempt", async route => {
    attemptedPayloads.push(route.request().postDataJSON());
    if (attemptedPayloads.length === 1) return route.fulfill({ status: 503, json: { success: false, message: "Temporary preview failure" } });
    return route.fallback();
  });
  const dashboard = await finishPatternQuestions(page);
  await expect(dashboard).toBeVisible();
  await expect(dashboard.locator(".lx-pattern-save-status")).toContainText(/could not be saved/i);
  const retry = dashboard.getByRole("button", { name: "Retry Saving", exact: true });
  await expect(retry).toBeEnabled();
  await expect(dashboard.getByRole("button", { name: "Next Game", exact: true })).toHaveCount(0);
  expect(state.submissions).toHaveLength(0);
  await doubleActivate(retry);
  await expect(dashboard.getByRole("button", { name: "Next Game", exact: true })).toBeEnabled();
  await expect(dashboard.locator(".lx-pattern-save-status")).not.toContainText(/Saving|could not be saved/i);
  expect(attemptedPayloads).toHaveLength(2);
  expect(attemptedPayloads[1]).toEqual(attemptedPayloads[0]);
  expect(state.submissions).toHaveLength(1);
  expect(state.submissions[0]).toMatchObject({ score: 5, totalQuestions: 5 });
  expect(state.submissions[0].questionResults.filter(result => result.isCorrect)).toHaveLength(5);
  expect(state.unexpectedWrites).toEqual([]);
  expect(state.errors).toEqual([]);
});
