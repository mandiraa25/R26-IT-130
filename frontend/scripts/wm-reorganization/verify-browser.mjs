// Run from frontend with Vite already running. All API traffic is mocked.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2] || 'latest';
const onlyScreening = process.argv.includes('--screening-only');
const out = path.resolve('.cache/wm-reorganization', phase, 'smoke');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const records = [];
const fixed = new Date('2026-10-17T06:00:00.000Z');
const progress = {
  studentId: 'wm-reorganization-review', isIdentificationCompleted: true,
  initialIdentifiedLevel: 1, maxUnlockedLevel: 4, totalStars: 123,
  totalCarrots: 123,
  levelsProgress: [1, 2, 3, 4].map(levelNumber => ({ levelNumber,
    isCompleted: false, subCategories: ['pattern', 'words', 'instructions', 'numbers'].map(subCategoryKey => ({
      subCategoryKey, isUnlocked: true, isCompleted: false, bestScore: 0, totalAttempts: 0,
    })),
  })),
};

async function setup(grade, lang) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [], missing = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && new URL(r.url()).host === '127.0.0.1:5173') missing.push(`${r.status()} ${r.url()}`); });
  await page.clock.install({ time: fixed });
  await page.clock.pauseAt(new Date(fixed.getTime() + 100));
  await page.addInitScript(({ lang }) => {
    localStorage.setItem('token', 'wm-reorganization-review');
    localStorage.setItem('studentId', 'wm-reorganization-review');
    localStorage.setItem('i18nextLng', lang);
    localStorage.setItem('lexiland-wm-muted', 'true');
    Math.random = () => 0.73;
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
    window.speechSynthesis.speak = utterance => queueMicrotask(() => { utterance.onstart?.(); utterance.onend?.(); });
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.getVoices = () => [];
  }, { lang });
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/improvement/progress/')) return route.fulfill({ json: { success: true, data: progress } });
    if (url.pathname.includes('/improvement/history/')) return route.fulfill({ json: { success: true, data: [] } });
    if (url.pathname.endsWith('/students/profile')) return route.fulfill({ json: { _id: 'wm-reorganization-review', grade, fullName: 'Review', totalStars: 123 } });
    return route.fulfill({ json: { success: true, grade, data: [] } });
  });
  await page.route(/https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//, route => route.abort());
  return { context, page, errors, missing };
}
async function capture(page, name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    // Boards and number buttons also use CSS backgrounds, outside document.images.
    const backgrounds = new Set();
    for (const element of document.querySelectorAll('*')) {
      for (const [, url] of getComputedStyle(element).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) backgrounds.add(url);
    }
    await Promise.all([...backgrounds].map(async url => {
      const image = new Image();
      image.src = url;
      await image.decode().catch(() => {});
    }));
  });
  await page.screenshot({ path: path.join(out, `${name}.png`), animations: 'disabled' });
  return page.evaluate(() => [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')));
}
async function run(grade, lang) {
  const { context, page, errors, missing } = await setup(grade, lang);
  for (const level of (onlyScreening?[]:[1, 2, 3, 4])) for (const game of ['pattern', 'words', 'instructions', 'numbers']) {
    const name = `g${grade}-${lang}-l${level}-${game}`;
    const record = { name, grade, lang, level, game, stages: [], broken: [] };
    try {
      await page.goto(`http://127.0.0.1:5173/improvement-activity-wm/${grade}/${level}/${game}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.lx-howto-skip').waitFor({ timeout: 20000 });
      record.broken.push(...await capture(page, `${name}-tutorial`));
      record.stages.push('tutorial');
      await page.locator('.lx-howto-skip').click();
      await page.locator('.lx-board[data-question-id]').waitFor();
      record.questionId = await page.locator('.lx-board').getAttribute('data-question-id');
      record.broken.push(...await capture(page, `${name}-ready`));
      record.stages.push('ready');
      if (game === 'numbers' || game === 'words') {
        await page.locator('.lx-reminder button,.lx-number-ready button').click();
        await page.getByRole('timer').waitFor();
        record.duration = await page.getByRole('timer').getAttribute('aria-label');
        record.broken.push(...await capture(page, `${name}-memorize`));
        record.stages.push('memorize');
        for (let i = 0; i < 30 && await page.getByRole('timer').count(); i++) await page.clock.runFor(1000);
        await page.locator(game === 'numbers' ? '.lx-keypad' : '.lx-picture-pool').waitFor();
      } else if (game === 'instructions') {
        await page.locator('.lx-actions button').first().click();
        for (let i = 0; i < 12 && await page.locator('.lx-actions button').count() < 2; i++) await page.clock.runFor(1000);
        await page.locator('.lx-actions button').nth(1).click();
        await page.locator('.lx-instruction-options').waitFor();
      }
      record.broken.push(...await capture(page, `${name}-answer`));
      record.stages.push('answer');
      if (game === 'pattern') {
        await page.locator('.lx-pattern-options button').first().click();
        await page.locator('.lx-pattern-check').click();
      } else if (game === 'instructions') await page.locator('.lx-instruction-option').first().click();
      else if (game === 'numbers') {
        const count = await page.locator('.lx-number-slot').count();
        for (let i = 0; i < count; i++) await page.getByRole('button', { name: 'Digit 1', exact: true }).click();
        await page.locator('.lx-actions button').last().click();
      } else {
        const count = await page.locator('.lx-picture-slot').count();
        for (let i = 0; i < count; i++) await page.locator('.lx-picture-pool [data-item-id]').first().click();
        await page.locator('.lx-actions button').last().click();
      }
      await page.getByTestId('level-one-feedback').waitFor();
      record.broken.push(...await capture(page, `${name}-feedback`));
      record.stages.push('feedback');
      record.ok = true;
    } catch (e) { record.ok = false; record.error = e.message; }
    records.push(record);
    console.log(JSON.stringify({ name, ok: record.ok, stages: record.stages.length, error: record.error, broken: record.broken }));
  }
  for (const [category, id] of [['pattern', `wm-g${grade}-1`], ['pictures', `wm-g${grade}-5`], ['instructions', `wm-g${grade}-9`], ['numbers', `wm-g${grade}-12`]]) {
    const name = `screening-g${grade}-${lang}-${category}`;
    const record = { name, grade, lang, stages: [], broken: [] };
    try {
      await page.goto(`http://127.0.0.1:5173/working-memory/${grade}?demo=true&ids=${lang==='si'?id.replace(/-(\d+)$/, '-si-$1'):id}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.wm-screen .lx-board').waitFor();
      record.broken.push(...await capture(page, `${name}-study`));
      record.stages.push('study');
      record.ok = true;
    } catch (e) { record.ok = false; record.error = e.message; }
    records.push(record);
  }
  records.push({ name: `diagnostics-g${grade}-${lang}`, errors, missing });
  await context.close();
}
const cases = ['2', '3', '4'].flatMap(grade => ['en', 'si'].map(lang => ({ grade, lang })));
const workers = Number(process.env.WM_BROWSER_WORKERS) || 2;
for (let index = 0; index < cases.length; index += workers) {
  await Promise.all(cases.slice(index, index + workers).map(({ grade, lang }) => run(grade, lang)));
}
await browser.close();
await writeFile(path.join(out, 'results.json'), JSON.stringify(records, null, 2));
console.log(JSON.stringify({ records: records.length, failures: records.filter(r => r.ok === false).length, broken: records.flatMap(r => r.broken || []).length }));

if (records.some(record => record.ok === false || record.broken?.length || record.errors?.length || record.missing?.length)) process.exitCode = 1;
