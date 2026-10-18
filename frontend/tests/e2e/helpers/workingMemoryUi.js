import { expect } from "@playwright/test";

export async function expectFeedbackBelowBoard(page) {
  const feedback = page.getByTestId("level-one-feedback");
  if (await feedback.count() === 0) return null;
  const geometry = await feedback.evaluate(element => {
    const stage = element.closest(".lx-stage");
    const stageBox = stage.getBoundingClientRect();
    const scale = stageBox.width / stage.offsetWidth;
    const board = stage.querySelector(".lx-board").getBoundingClientRect();
    const banner = element.getBoundingClientRect();
    const nextElement = stage.querySelector(".lx-feedback-footer > button");
    const next = nextElement?.getBoundingClientRect();
    const bunny = stage.querySelector(".lx-bunny")?.getBoundingClientRect();
    const intersects = (a, b) => a && b ? Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1 : false;
    return {
      outsideBoard: !element.closest(".lx-board"),
      centered: ((banner.left + banner.right) / 2 - (board.left + board.right) / 2) / scale,
      boardGap: (banner.top - board.bottom) / scale,
      stageBottomGap: (stageBox.bottom - banner.bottom) / scale,
      overlapsNext: intersects(banner, next),
      overlapsBunny: intersects(banner, bunny),
      nextInsideBoard: Boolean(nextElement?.closest(".lx-board")) && next.left >= board.left && next.right <= board.right && next.top >= board.top && next.bottom <= board.bottom,
      banner: banner.toJSON(),
    };
  });
  expect(geometry.outsideBoard, "the notification is a separate banner below the vine board").toBe(true);
  expect(Math.abs(geometry.centered), "the notification is centered beneath its board").toBeLessThanOrEqual(1);
  expect(geometry.boardGap, "the notification clears the bottom of the board").toBeGreaterThanOrEqual(8);
  expect(geometry.stageBottomGap, "the whole notification remains visible inside the stage").toBeGreaterThanOrEqual(0);
  expect(geometry.nextInsideBoard, "Next stays inside the vine board").toBe(true);
  expect(geometry.overlapsNext).toBe(false);
  expect(geometry.overlapsBunny).toBe(false);
  await expect(page.locator(".lx-feedback-footer .lx-answer-feedback")).toHaveCount(0);
  return geometry;
}

export async function expectImprovementFeedback(page, { correct }) {
  const feedback = page.getByTestId("level-one-feedback");
  await expect(feedback).toBeVisible();
  await expect(feedback.locator("h2")).toHaveText(correct ? "Well done!" : "Oops!");
  await expect(feedback.locator("p")).toHaveText(correct ? "You found the answer!" : "That’s not the correct answer. Try again later!");
  await expect(feedback.locator(".lx-feedback-stars img")).toHaveCount(correct ? 3 : 0);
  await expect(feedback.locator(".lx-feedback-reward")).toHaveCount(correct ? 1 : 0);
  if (!correct) {
    const icon = feedback.locator("svg.lucide-x");
    await expect(icon).toHaveCount(1);
    const red = await icon.evaluate(element => {
      const components = getComputedStyle(element).color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      return components?.length === 3 && components[0] > components[1] && components[0] > components[2];
    });
    expect(red, "an incorrect answer uses the red X icon").toBe(true);
  }
  await expectFeedbackBelowBoard(page);
}

// Completion means a submitted question. Incorrect answers still count as
// completed; rewards and correctness are checked separately by each suite.
export async function expectImprovementTracker(page, index) {
  const list = page.locator(".lx-game .lx-tracker");
  const items = list.locator(".lx-step");
  const answered = await page.locator(".lx-phase--feedback").count() > 0;
  await expect(items).toHaveCount(5);
  await expect(items.nth(index)).toHaveAttribute("aria-current", "step");
  await expect(items.nth(index)).toHaveClass(/is-current/);
  await expect(list.locator("[aria-current=step]")).toHaveCount(1);
  await expect(list.locator(".is-done > b")).toHaveCount(index + Number(answered));
  await expect(list.locator(".is-upcoming")).toHaveCount(4 - index);
  await expect(items.nth(index).locator("b")).toHaveCount(Number(answered));
  const currentId = await page.locator(".lx-board[data-question-id]").getAttribute("data-question-id");
  await expect(items.nth(index)).toHaveAttribute("data-question-id", currentId);
  const geometry = await list.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const stage = element.closest(".lx-stage");
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
    const grid = getComputedStyle(element).display === "grid";
    const active = element.querySelector("[aria-current=step]");
    return {
      background: getComputedStyle(element).backgroundImage,
      shadow: getComputedStyle(active).boxShadow,
      ids: [...element.children].map(child => child.dataset.questionId),
      circles: [...element.children].map((child, i) => {
        const circle = child.getBoundingClientRect();
        const expectedX = grid ? (i + .5) * bounds.width / 5 : (100 + i * 212) / 1050 * bounds.width;
        return { x: ((circle.left + circle.right) / 2 - bounds.left - expectedX) / scale,
          y: (circle.top + circle.bottom - bounds.top - bounds.bottom) / 2 / scale,
          width: circle.width / scale };
      }),
      coveredNumbers: [...element.querySelectorAll(".lx-step > b")].filter(badge => {
        const circle = badge.parentElement.getBoundingClientRect();
        const check = badge.getBoundingClientRect();
        const x = (circle.left + circle.right) / 2, y = (circle.top + circle.bottom) / 2;
        return x > check.left && x < check.right && y > check.top && y < check.bottom;
      }).length,
    };
  });
  expect(geometry.background).toContain("nav-tracker.png");
  expect(geometry.shadow).not.toBe("none");
  expect(new Set(geometry.ids).size, "tracker state belongs to the five current question IDs").toBe(5);
  for (const circle of geometry.circles) {
    expect(Math.abs(circle.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(circle.y)).toBeLessThanOrEqual(1);
    expect(circle.width).toBeCloseTo(45, 0);
  }
  expect(geometry.coveredNumbers, "completion checks leave question numbers readable").toBe(0);
}
