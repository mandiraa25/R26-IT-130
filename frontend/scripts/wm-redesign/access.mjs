import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const progress = {
  isIdentificationCompleted: true, maxUnlockedLevel: 1, totalStars: 0,
  levelsProgress: [{ levelNumber: 1, subCategories: ['pattern', 'numbers', 'words', 'instructions'].map(subCategoryKey => ({ subCategoryKey, isUnlocked: true })) }],
};
async function setup(storedId = 'stale-student-id') {
  const context = await browser.newContext();
  await context.addInitScript(id => {
    if (location.hostname !== '127.0.0.1') return;
    localStorage.setItem('token', 'access-regression');
    localStorage.setItem('i18nextLng', 'en');
    if (id) localStorage.setItem('studentId', id);
  }, storedId);
  const state = { progress, fail: false, profileFail: false, requests: [] };
  await context.route('**/api/students/profile', route => route.fulfill(state.profileFail
    ? { status: 503, json: { message: 'Unavailable' } }
    : { json: { _id: 'authenticated-student-id', grade: '3', fullName: 'Access Test' } }));
  await context.route('**/api/working-memory/improvement/progress/**', route => {
    state.requests.push(route.request().url().split('/').at(-1));
    return route.fulfill(state.fail ? { status: 503, json: { message: 'Unavailable' } } : { json: { success: true, data: state.progress } });
  });
  await context.route('**/*youtube*', route => route.fulfill({ body: '', contentType: 'text/html' }));
  return { context, page: await context.newPage(), state };
}
const url = game => `http://127.0.0.1:5173/improvement-activity-wm/3/1/${game}`;
try {
  {
    const { context, page, state } = await setup();
    await page.goto('http://127.0.0.1:5173/improvement-wm/3');
    await page.locator('.wm-level-card [data-action="play"]').first().waitFor();
    await page.locator('.wm-level-card').first().click();
    await page.getByRole('dialog').getByRole('button', { name: /Pattern/ }).click();
    await page.locator('.how-video-board').waitFor();
    await page.locator('.how-video-skip').click();
    await page.getByRole('button', { name: 'Start the game', exact: true }).click();
    await page.locator('.pattern-choice-tile').first().waitFor();
    assert(state.requests.length >= 2);
    assert(state.requests.every(id => id === 'authenticated-student-id'));
    console.log('PASS level map -> Level 1 -> Pattern -> playable question with stale stored ID');
    await context.close();
  }
  for (const game of ['pattern', 'numbers', 'words', 'instructions']) {
    const { context, page, state } = await setup(null);
    await page.goto(url(game));
    await page.locator('.how-video-board').waitFor();
    assert.deepEqual(state.requests, ['authenticated-student-id']);
    console.log('PASS missing stored ID:', game);
    await context.close();
  }
  for (const failure of ['fail', 'profileFail']) {
    const { context, page, state } = await setup();
    state[failure] = true;
    await page.goto(url('pattern'));
    await page.getByRole('heading', { name: 'Unable to load your progress' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Identification Required', exact: true }).count(), 0);
    state[failure] = false;
    await page.getByRole('button', { name: 'Try Again', exact: true }).click();
    await page.locator('.how-video-board').waitFor();
    console.log('PASS request failure shows retry, recovery loads game:', failure);
    await context.close();
  }
  for (const incomplete of [true, false]) {
    const { context, page, state } = await setup();
    state.progress = incomplete ? { ...progress, isIdentificationCompleted: false } : { ...progress, levelsProgress: [] };
    await page.goto(url('pattern'));
    await page.getByRole('heading', { name: incomplete ? /Identification Required/i : /^Locked/i }).waitFor();
    assert.equal(await page.locator('.how-video-board').count(), 0);
    console.log('PASS authoritative access restriction:', incomplete ? 'screening incomplete' : 'game locked');
    await context.close();
  }
} finally { await browser.close(); }
