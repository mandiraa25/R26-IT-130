import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const origin = 'http://127.0.0.1:5173';
const out = '../.design-backups/pattern-check-before/qa';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const progress = {
  isIdentificationCompleted: true,
  maxUnlockedLevel: 4,
  totalStars: 350,
  levelsProgress: [1, 2, 3, 4].map(levelNumber => ({
    levelNumber,
    subCategories: ['pattern', 'words', 'instructions', 'numbers'].map(subCategoryKey => ({
      subCategoryKey, isUnlocked: true, isCompleted: false,
    })),
  })),
};
const coverage = [];

try {
  for (const { level, language, width, height } of [
    ...[1, 2, 3, 4].map(level => ({ level, language: 'en', width: 1600, height: 900 })),
    { level: 2, language: 'si', width: 1366, height: 768 },
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    await context.addInitScript(({ origin, language }) => {
      if (location.origin !== origin) return;
      localStorage.setItem('token', 'pattern-check-regression');
      localStorage.setItem('i18nextLng', language);
      window.speechSynthesis.speak = utterance => utterance.onend?.();
      window.speechSynthesis.cancel = () => {};
    }, { origin, language });
    await context.route('**/api/students/profile', route => route.fulfill({ json: { _id: 'pattern-check-regression', grade: '3' } }));
    await context.route('**/api/working-memory/improvement/progress/**', route => route.fulfill({ json: { success: true, data: progress } }));
    await context.route('**/*youtube*', route => route.fulfill({ contentType: 'text/html', body: '' }));
    const submissions = [];
    await context.route('**/api/working-memory/improvement/submit-attempt', route => {
      const body = route.request().postDataJSON();
      submissions.push(body);
      return route.fulfill({ status: 201, json: { success: true, data: { isPassed: body.score >= 3, totalStars: 350 + body.score * 5, progress } } });
    });

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const shot = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
      await page.locator('.lx-pattern-artwork__image').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.locator('.lx-pattern-artwork__sprite').evaluateAll(async sprites => {
        const sources = [...new Set(sprites.map(sprite => getComputedStyle(sprite).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]).filter(Boolean))];
        await Promise.all(sources.map(async source => {
          const image = new Image();
          image.src = source;
          await image.decode();
        }));
      });
      await page.screenshot({ path: `${out}/level-${level}-${language}-${name}.png` });
    };
    await page.goto(`${origin}/improvement-activity-wm/3/${level}/pattern`);
    await page.locator('.lx-howto-skip').click();
    const board = page.locator('.lx-pattern-question');
    await board.waitFor();
    assert.equal(await page.locator('.lx-viewport').getAttribute('lang'), language);
    const ids = [];
    const finalAnswers = [];
    let expectedScore = 0;

    for (let index = 0; index < 5; index++) {
      const id = await board.getAttribute('data-question-id');
      ids.push(id);
      const question = await page.evaluate(async ({ level, language, id }) => {
        const { getSubCategoryData } = await import('/src/features/workingMemory/improvement/data/index.js');
        return getSubCategoryData('3', level, 'pattern', language).questions.find(question => question.id === id);
      }, { level, language, id });
      assert(question, `Question ${id} must be original grade-3 data`);
      const options = page.locator('.lx-pattern-option');
      const check = page.locator('.lx-pattern-check');
      await expect(check).toBeDisabled();
      assert.equal(await page.locator('.lx-pattern-option[aria-pressed=true]').count(), 0);
      assert.equal(await page.locator('.lx-pattern-toast, .lx-pattern-next').count(), 0);
      assert.equal(await page.locator('.lx-nav-stars strong').textContent(), String(350 + expectedScore * 5));
      assert.equal(await page.locator('.lx-tracker .is-done').count(), index);
      assert.equal(submissions.length, 0, 'Only the completed five-question attempt should be submitted');
      await check.evaluate(button => button.click());
      assert.equal(await page.locator('.lx-pattern-toast').count(), 0, 'Disabled Check must not submit an empty answer');
      if (index === 0) await shot('initial-disabled');

      const labels = await options.evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
      const correctIndex = labels.indexOf(`Answer: ${question.missingAnswer}`);
      const wrongIndex = labels.findIndex(label => label !== `Answer: ${question.missingAnswer}`);
      assert(correctIndex >= 0 && wrongIndex >= 0);
      const correct = [true, false, true, true, false][index];
      const finalIndex = correct ? correctIndex : wrongIndex;

      // Select another answer first, then change it before confirming. Keyboard
      // activation verifies that the new two-step interaction is accessible.
      await options.nth(correct ? wrongIndex : correctIndex).focus();
      await page.keyboard.press('Enter');
      await expect(check).toBeEnabled();
      assert.equal(await page.locator('.lx-pattern-toast, .lx-pattern-next').count(), 0);
      assert.equal(await page.locator('.lx-nav-stars strong').textContent(), String(350 + expectedScore * 5));
      await options.nth(finalIndex).focus();
      await page.keyboard.press('Space');
      await expect(options.nth(finalIndex)).toHaveAttribute('aria-pressed', 'true');
      assert.equal(await page.locator('.lx-pattern-option[aria-pressed=true]').count(), 1);
      assert.equal(await page.locator('.lx-pattern-toast, .lx-pattern-next').count(), 0, 'Choosing an option must not show feedback');
      assert.equal(await page.locator('.lx-tracker .is-done').count(), index, 'Choosing an option must not complete the tracker step');
      assert.equal(await page.locator('.lx-pattern-option:enabled').count(), labels.length);
      assert.equal(submissions.length, 0);

      if (index === 0) {
        const geometry = await page.evaluate(() => {
          const rectangle = selector => {
            const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect();
            return { x, y, width, height };
          };
          return { board: rectangle('.lx-pattern-question'), options: rectangle('.lx-pattern-options'), check: rectangle('.lx-pattern-check'), overflow: document.documentElement.scrollWidth > innerWidth };
        });
        assert.equal(geometry.overflow, false);
        assert(geometry.check.width >= 44 && geometry.check.height >= 44, 'Check should remain a usable touch target on laptop');
        assert(geometry.check.x >= geometry.board.x && geometry.check.x + geometry.check.width <= geometry.board.x + geometry.board.width);
        assert(geometry.check.y >= geometry.options.y + geometry.options.height, 'Check must sit below the answer choices');
        assert(geometry.check.y + geometry.check.height <= geometry.board.y + geometry.board.height, 'Check must fit inside the existing board');
        const overflowingArtwork = await page.locator('.lx-pattern-tile, .lx-pattern-option').evaluateAll(tiles => tiles.filter(tile => {
          const artwork = tile.querySelector('.lx-pattern-artwork');
          if (!artwork) return false;
          const card = tile.getBoundingClientRect(), picture = artwork.getBoundingClientRect();
          return picture.x < card.x - 1 || picture.y < card.y - 1 || picture.right > card.right + 1 || picture.bottom > card.bottom + 1;
        }).map(tile => tile.getAttribute('aria-label') || tile.textContent));
        assert.deepEqual(overflowingArtwork, [], 'Pattern illustrations must remain inside their answer cards and sequence tiles');
        await shot('selected-before-check');
      }

      // Both clicks happen synchronously to exercise the existing duplicate
      // answer guard, rather than relying on Playwright's action delay.
      if (index === 2) {
        await check.focus();
        await page.keyboard.press('Enter');
      } else {
        await check.evaluate(button => { button.click(); button.click(); });
      }
      await page.locator('.lx-pattern-toast').waitFor();
      if (correct) expectedScore++;
      finalAnswers.push(labels[finalIndex].slice('Answer: '.length));
      assert.equal(await page.locator('.lx-pattern-toast.is-incorrect').count(), correct ? 0 : 1);
      await expect(page.locator('.lx-nav-stars strong')).toHaveText(String(350 + expectedScore * 5));
      assert.equal(await page.locator('.lx-tracker .is-done').count(), index + 1);
      assert.equal(await page.locator('.lx-pattern-option:enabled').count(), 0);
      await options.nth(correct ? wrongIndex : correctIndex).evaluate(button => button.click());
      assert.equal(await board.getAttribute('data-question-id'), id);
      await expect(options.nth(finalIndex)).toHaveAttribute('aria-pressed', 'true');
      assert.equal(await page.locator('.lx-nav-stars strong').textContent(), String(350 + expectedScore * 5));
      if (index < 2) await shot(correct ? 'correct-feedback' : 'incorrect-feedback');
      await page.locator('.lx-pattern-next').evaluate(button => { button.click(); button.click(); });
      if (index < 4) {
        await expect(board).not.toHaveAttribute('data-question-id', id);
        await expect(page.locator('.lx-pattern-check')).toBeDisabled();
        assert.equal(await page.locator('.lx-pattern-option[aria-pressed=true]').count(), 0);
        assert.equal(await page.locator('.lx-pattern-toast').count(), 0);
      }
    }

    await page.getByTestId('pattern-results').waitFor();
    await expect(page.getByTestId('pattern-score')).toHaveText('3 / 5');
    await expect(page.locator('.lx-pattern-continue')).toBeEnabled();
    assert.equal(submissions.length, 1, 'One completed attempt must produce exactly one API submission');
    assert.equal(submissions[0].score, 3);
    assert.equal(submissions[0].questionResults.length, 5);
    assert.equal(new Set(ids).size, 5);
    assert.deepEqual(submissions[0].questionResults.map(result => result.questionId), ids);
    assert.deepEqual(submissions[0].questionResults.map(result => result.userAnswer), finalAnswers);
    assert.deepEqual(submissions[0].questionResults.map(result => result.isCorrect), [true, false, true, true, false]);
    assert.equal(await page.locator('.lx-pattern-statistics .is-stars strong').textContent(), '15');
    assert.deepEqual(errors, []);
    await shot('results');
    await page.locator('.lx-pattern-retry').click();
    await expect(page.locator('.lx-pattern-check')).toBeDisabled();
    assert.equal(await page.locator('.lx-pattern-option[aria-pressed=true], .lx-pattern-toast').count(), 0);
    assert.equal(await page.locator('.lx-tracker .is-done').count(), 0);
    coverage.push({ level, language, viewport: `${width}x${height}`, questionCount: 5, score: 3, submissions: submissions.length });
    console.log(`PASS level ${level} ${language}: select/change, Check-only feedback/scoring, one score per answer, Next/retry reset, five original questions, 3/5 saved once`);
    await context.close();
  }
  fs.writeFileSync(`${out}/coverage.json`, JSON.stringify({ api: 'mocked', coverage }, null, 2));
  console.log(`PASS English levels 1–4 and Sinhala laptop layout. Artifacts: ${out}`);
} finally {
  await browser.close();
}
