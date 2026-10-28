import { test, expect, type APIRequestContext } from "@playwright/test";
import { API_URL } from "../../support/env";
import { authHeader, createStudent, describeCase, type Student } from "../../support/fixtures";

const WM = `${API_URL}/working-memory`;
const CATEGORIES = ["Pattern", "Picture Memory", "Instruction", "Number Memory"];

// Saves a 15-question screening with `correct` right answers (no ML metrics, so the
// backend places the student by marks: <40% L1, <65% L2, <85% L3, else L4).
async function saveScreening(request: APIRequestContext, s: Student, correct: number, grade = "3") {
  const questionResults = Array.from({ length: 15 }, (_, i) => ({ questionId: `wm-g${grade}-${i + 1}`, category: CATEGORIES[i % 4], isCorrect: i < correct, timeTaken: 3000 }));
  const res = await request.post(`${WM}/identification/save-result`, { data: { studentId: s.studentId, grade, questionResults } });
  expect(res.status(), await res.text()).toBe(201);
  return res.json();
}

const attempt = (s: Student, levelNumber: number, subCategoryKey: string, score: number, extra: Record<string, unknown> = {}) => ({
  studentId: s.studentId, grade: s.grade, language: "en", levelNumber, subCategoryKey, score, totalQuestions: 5, totalTimeTaken: 20000,
  questionResults: Array.from({ length: 5 }, (_, i) => ({ questionId: `q${i + 1}`, isCorrect: i < score, timeTaken: 4000 })),
  ...extra,
});

const progressOf = async (request: APIRequestContext, s: Student) => (await (await request.get(`${WM}/improvement/progress/${s.studentId}`)).json()).data;
const game = (progress: any, level: number, key: string) => progress.levelsProgress.find((l: any) => l.levelNumber === level).subCategories.find((g: any) => g.subCategoryKey === key);

test.describe("Working Memory › API › Screening session and placement", () => {
  test("API-WM-01: Before screening, improvement is locked", async ({ request }) => {
    describeCase({ requirement: "Screening comes first", expected: "isIdentificationCompleted false, maxUnlockedLevel 0", priority: "High" });
    const s = await createStudent(request);
    const progress = await progressOf(request, s);
    expect(progress).toMatchObject({ isIdentificationCompleted: false, maxUnlockedLevel: 0 });
  });

  test("API-WM-02: Saved screening results are stored with score and can be fetched", async ({ request }) => {
    describeCase({ requirement: "Save and fetch screening results", expected: "201 with totalScore/totalQuestions; history returns it", priority: "High" });
    const s = await createStudent(request);
    const saved = await saveScreening(request, s, 9);
    expect(saved.data).toMatchObject({ totalScore: 9, totalQuestions: 15, grade: "3" });
    const history = await (await request.get(`${WM}/identification/student-results/${s.studentId}`)).json();
    expect(history.data).toHaveLength(1);
  });

  for (const [id, correct, level] of [["API-WM-03", 4, 1], ["API-WM-04", 7, 2], ["API-WM-05", 11, 3], ["API-WM-06", 15, 4]] as const) {
    test(`${id}: Screening with ${correct}/15 correct starts at Level ${level}`, async ({ request }) => {
      describeCase({ requirement: "Starting level from screening marks", expected: `maxUnlockedLevel ${level}; only Pattern open in Levels 1-${level}`, priority: "High" });
      const s = await createStudent(request);
      await saveScreening(request, s, correct);
      const progress = await progressOf(request, s);
      expect(progress.maxUnlockedLevel).toBe(level);
      for (const l of [1, 2, 3, 4]) {
        const unlocked = progress.levelsProgress.find((x: any) => x.levelNumber === l).subCategories.map((g: any) => g.isUnlocked);
        expect(unlocked, `Level ${l}`).toEqual(l <= level ? [true, false, false, false] : [false, false, false, false]);
      }
    });
  }
});

test.describe("Working Memory › API › Submit answers and mastery", () => {
  test("API-WM-07: A locked game cannot be played", async ({ request }) => {
    describeCase({ requirement: "Games unlock in order", expected: "403 for Picture Memory before Pattern is passed", priority: "High" });
    const s = await createStudent(request);
    await saveScreening(request, s, 4);
    const res = await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, "words", 5) });
    expect(res.status()).toBe(403);
  });

  test("API-WM-08: 2/5 does not pass but still earns 5 stars per correct answer", async ({ request }) => {
    describeCase({ requirement: "Mastery needs 3/5; 1 correct = 5 stars", expected: "isPassed false, 10 stars, next game still locked", priority: "High" });
    const s = await createStudent(request);
    await saveScreening(request, s, 4);
    const body = await (await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, "pattern", 2) })).json();
    expect(body.data).toMatchObject({ isPassed: false, starsEarned: 10 });
    expect(game(body.data.progress, 1, "words").isUnlocked).toBe(false);
  });

  test("API-WM-09: 3/5 is the pass mark and unlocks the next game", async ({ request }) => {
    describeCase({ requirement: "Mastery boundary", expected: "isPassed true at exactly 3/5; Picture Memory unlocked", priority: "High" });
    const s = await createStudent(request);
    await saveScreening(request, s, 4);
    const body = await (await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, "pattern", 3) })).json();
    expect(body.data).toMatchObject({ isPassed: true, starsEarned: 15 });
    expect(game(body.data.progress, 1, "pattern").isCompleted).toBe(true);
    expect(game(body.data.progress, 1, "words").isUnlocked).toBe(true);
  });

  test("API-WM-10: Passing all four games completes the level, unlocks the next and awards 100 stars", async ({ request }) => {
    describeCase({ requirement: "Level completion", expected: "4 x 5/5 = 100 stars; Level 1 complete; Level 2 Pattern unlocked; profile total 100", priority: "High" });
    const s = await createStudent(request);
    await saveScreening(request, s, 4);
    let last: any;
    for (const key of ["pattern", "words", "instructions", "numbers"]) {
      last = await (await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, key, 5) })).json();
      expect(last.data.isPassed, key).toBe(true);
    }
    expect(last.data.totalStars).toBe(100);
    expect(last.data.progress.levelsProgress.find((l: any) => l.levelNumber === 1).isCompleted).toBe(true);
    expect(last.data.progress.maxUnlockedLevel).toBe(2);
    expect(game(last.data.progress, 2, "pattern").isUnlocked).toBe(true);
    const profile = await (await request.get(`${API_URL}/students/profile`, { headers: authHeader(s) })).json();
    expect(profile.moduleStars.workingMemory).toBe(100);
    expect(profile.totalStars).toBe(100);
  });

  test("API-WM-11: Attempt history returns saved attempts for a level and game", async ({ request }) => {
    describeCase({ requirement: "Fetch saved results", expected: "Two attempts, newest first, with score and stars", priority: "Medium" });
    const s = await createStudent(request);
    await saveScreening(request, s, 4);
    await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, "pattern", 2) });
    await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, "pattern", 4) });
    const history = (await (await request.get(`${WM}/improvement/history/${s.studentId}?levelNumber=1&subCategoryKey=pattern`)).json()).data;
    expect(history.map((a: any) => [a.score, a.starsEarned])).toEqual([[4, 20], [2, 10]]);
  });

  for (const [id, label, change] of [
    ["API-WM-12", "grade outside 2-4", { grade: "5" }],
    ["API-WM-13", "level outside 1-4", { levelNumber: 5 }],
    ["API-WM-14", "score above the number of questions", { score: 6 }],
    ["API-WM-15", "missing question results", { questionResults: [] }],
    ["API-WM-16", "unknown game", { subCategoryKey: "chess" }],
  ] as const) {
    test(`${id}: Attempt with ${label} is rejected`, async ({ request }) => {
      describeCase({ requirement: "Attempt validation", expected: "400 and nothing saved", priority: "Medium" });
      const s = await createStudent(request);
      await saveScreening(request, s, 4);
      const res = await request.post(`${WM}/improvement/submit-attempt`, { data: { ...attempt(s, 1, "pattern", 3), ...change } });
      expect(res.status()).toBe(400);
    });
  }

  test("API-WM-17: Attempts need a screening for that grade", async ({ request }) => {
    describeCase({ requirement: "Screening per grade", expected: "403 when no Grade 3 screening exists", priority: "Medium" });
    const s = await createStudent(request);
    const res = await request.post(`${WM}/improvement/submit-attempt`, { data: attempt(s, 1, "pattern", 5) });
    expect(res.status()).toBe(403);
  });
});

test.describe("Working Memory › API › Security", () => {
  test("API-WM-SEC-01: Working Memory progress requires a signed-in student", async ({ request }) => {
    describeCase({ requirement: "Protected routes (auth/JWT) cover Working Memory data", expected: "401 without a token", priority: "High" });
    const s = await createStudent(request);
    const res = await request.get(`${WM}/improvement/progress/${s.studentId}`);
    expect(res.status(), "progress is readable without any token").toBe(401);
  });

  test("API-WM-SEC-02: A student cannot save attempts for another student", async ({ request }) => {
    describeCase({ requirement: "Students only change their own records", expected: "403 when student A submits for student B", priority: "High" });
    const a = await createStudent(request);
    const b = await createStudent(request);
    await saveScreening(request, b, 4);
    const res = await request.post(`${WM}/improvement/submit-attempt`, { headers: authHeader(a), data: attempt(b, 1, "pattern", 5) });
    expect([401, 403], `status ${res.status()}: A changed B's progress`).toContain(res.status());
  });
});
