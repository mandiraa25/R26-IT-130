export const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const exactText = (value) => new RegExp(`^${escapeRegExp(value)}$`);

/**
 * Drives the real Identify quiz UI to answer the currently-shown question,
 * either correctly or incorrectly, based on the question's own shape
 * (Pattern / Instruction / options-based / drag-and-drop). Shared by the
 * full-coverage Identify suite and the Improvement suite's initial
 * "complete a real Identification quiz" setup step.
 */
export async function answerIdentifyQuestion(page, q, mode) {
  const wantCorrect = mode === "correct";

  if (q.category === "Pattern") {
    const target = wantCorrect ? q.correct : q.options.find((o) => o !== q.correct);
    await page.getByTestId("wm-pattern-option").filter({ hasText: exactText(target) }).first().click();
    return;
  }

  if (q.category === "Instruction") {
    const target = wantCorrect ? q.correct : q.options.find((o) => o !== q.correct);
    await page.getByTestId("wm-pool-item").filter({ hasText: exactText(target) }).first().click();
    await page.getByTestId("wm-submit-answer").click();
    return;
  }

  if (q.options) {
    // These buttons render a "1"/"2"/"3" index badge immediately before the
    // option text with no separator (e.g. "1Cat, Ball, Tree"), so an
    // anchored exact match never matches — substring is what's safe here.
    const target = wantCorrect ? q.correct : q.options.find((o) => o !== q.correct);
    await page.getByTestId("wm-choice-option").filter({ hasText: target }).first().click();
    return;
  }

  const correctSeq = q.type === "SEQUENCE_MEMORY" ? q.sequence.map(String) : q.words;
  const clickSeq = wantCorrect ? correctSeq : [...correctSeq].reverse();
  for (const value of clickSeq) {
    await page.getByTestId("wm-pool-item").filter({ hasText: exactText(value) }).first().click();
  }
  await page.getByTestId("wm-submit-answer").click();
}
