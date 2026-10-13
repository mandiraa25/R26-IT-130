import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildSafariPresentation } from "./leoSafariPresentation.utils.js";
import { computeLevelProgression } from "./leoLevelProgression.utils.js";

const readSiblingSource = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("the recommended current activity becomes the only primary action", () => {
  const view = buildSafariPresentation({
    activities: [
      { activityId: "sound-hunt", state: "completed", title: "Sound Hunt" },
      { activityId: "echo-roar", state: "current", title: "Echo Roar" },
      { activityId: "robot-words", state: "available", title: "Robot Words" },
    ],
    recommendation: { nextActivityId: "echo-roar" },
  });

  assert.equal(view.primaryAction.activityId, "echo-roar");
  assert.equal(view.primaryAction.kind, "activity");
  assert.deepEqual(view.replayActivities.map((item) => item.activityId), ["sound-hunt"]);
  assert.equal(view.zones.find((item) => item.activityId === "robot-words").isPrimary, false);
});

test("a recommended available activity can be primary", () => {
  const view = buildSafariPresentation({
    activities: [{ activityId: "robot-words", state: "available", title: "Robot Words" }],
    recommendation: { nextActivity: { activityId: "robot-words" } },
  });

  assert.equal(view.primaryAction.activityId, "robot-words");
  assert.equal(view.primaryAction.state, "available");
});

test("a missing or blank recommendation id cannot create a primary action", () => {
  for (const recommendation of [null, {}, { nextActivityId: null }, { nextActivityId: "   " }]) {
    const view = buildSafariPresentation({
      activities: [{ activityId: null, state: "current", title: "Unknown activity" }],
      recommendation,
    });

    assert.equal(view.primaryAction, null);
    assert.equal(view.zones[0].isPrimary, false);
    assert.equal(view.trailMessage, "safari_trail_waiting");
  }
});

test("duplicate playable matches fail closed instead of creating multiple primary zones", () => {
  const view = buildSafariPresentation({
    activities: [
      { activityId: "echo-roar", state: "current", title: "Echo Roar" },
      { activityId: "echo-roar", state: "available", title: "Echo Roar duplicate" },
    ],
    recommendation: { nextActivityId: "echo-roar" },
  });

  assert.equal(view.primaryAction, null);
  assert.deepEqual(view.zones.map((zone) => zone.isPrimary), [false, false]);
  assert.equal(view.trailMessage, "safari_trail_waiting");
});

test("completed and replay activities are secondary and never become primary", () => {
  const view = buildSafariPresentation({
    activities: [
      { activityId: "sound-hunt", state: "completed", title: "Sound Hunt" },
      { activityId: "echo-roar", state: "replay", title: "Echo Roar" },
    ],
    recommendation: { nextActivityId: "sound-hunt" },
  });

  assert.equal(view.primaryAction, null);
  assert.deepEqual(view.replayActivities.map((item) => item.activityId), ["sound-hunt", "echo-roar"]);
  assert.deepEqual(view.zones.map((item) => item.state), ["replay", "replay"]);
  assert.deepEqual(view.zones.map((item) => item.backendState), ["completed", "replay"]);
});

test("locked zones keep the backend lock reason exactly", () => {
  const lockReason = "Complete one new game.";
  const view = buildSafariPresentation({
    activities: [{ activityId: "story-trail", state: "locked", lockReason }],
    recommendation: { nextActivityId: "story-trail" },
  });

  assert.equal(view.primaryAction, null);
  assert.equal(view.zones[0].state, "locked");
  assert.equal(view.zones[0].lockReason, lockReason);
});

test("unknown backend states are preserved but fail closed in the presentation", () => {
  const view = buildSafariPresentation({
    activities: [{ activityId: "story-trail", state: "paused", lockReason: "Wait for Leo." }],
    recommendation: { nextActivityId: "story-trail" },
  });

  assert.equal(view.primaryAction, null);
  assert.equal(view.zones[0].backendState, "paused");
  assert.equal(view.zones[0].state, "locked");
  assert.equal(view.zones[0].lockReason, "Wait for Leo.");
});

test("checkpoint due changes the recommended action and trail message", () => {
  const activity = { activityId: "sound-twins", state: "current", title: "Sound Twins" };
  const regular = buildSafariPresentation({
    activities: [activity],
    recommendation: { nextActivityId: "sound-twins" },
    checkpointDue: false,
  });
  const checkpoint = buildSafariPresentation({
    activities: [activity],
    recommendation: { nextActivityId: "sound-twins" },
    checkpointDue: true,
  });

  assert.equal(regular.primaryAction.kind, "activity");
  assert.equal(regular.primaryAction.labelKey, "safari_play_leos_pick");
  assert.equal(regular.trailMessage, "safari_trail_continue");
  assert.equal(checkpoint.primaryAction.kind, "checkpoint");
  assert.equal(checkpoint.primaryAction.labelKey, "safari_start_trail_check");
  assert.equal(checkpoint.trailMessage, "safari_trail_checkpoint_ready");
});

test("checkpoint messaging waits when there is no unique playable primary action", () => {
  const view = buildSafariPresentation({
    activities: [{ activityId: "sound-twins", state: "locked", title: "Sound Twins" }],
    recommendation: { nextActivityId: "sound-twins" },
    checkpointDue: true,
  });

  assert.equal(view.primaryAction, null);
  assert.equal(view.trailMessage, "safari_trail_waiting");
});

test("building the presentation does not mutate backend activity objects", () => {
  const activities = [{ activityId: "sound-hunt", state: "completed", title: "Sound Hunt" }];
  const snapshot = structuredClone(activities);

  buildSafariPresentation({ activities });

  assert.deepEqual(activities, snapshot);
});

test("the map keeps the primary game CTA independent from predicted checkpoint timing", () => {
  const source = readSiblingSource("../LeoTrainingSafari.jsx");

  assert.doesNotMatch(source, /uniqueCompletedCount\s*\+\s*1/);
  assert.match(source, /checkpointDue=\{authoritativeCheckpointDue\}/);
  assert.match(source, /t\(primaryAction\.labelKey\)/);
});

test("a locked session-start response returns from the game to the map", () => {
  const safariSource = readSiblingSource("../LeoTrainingSafari.jsx");
  const activitySource = readSiblingSource("./LeoActivityPlay.jsx");

  assert.match(safariSource, /onLocked=\{showLockedState\}/);
  assert.match(activitySource, /function LeoActivityPlay\(\{ activity, onComplete, onCancel, onLocked \}\)/);
  assert.match(activitySource, /data\.code === "activity_locked"/);
  assert.match(activitySource, /onLocked\?\.\(data\.lockReason \|\| data\.message\)/);
});

test("language choices use an accessible group and 44 pixel targets", () => {
  const source = readSiblingSource("./LeoSafariHud.jsx");

  assert.match(source, /role="group"/);
  assert.match(source, /className=\{`min-h-11 min-w-11/);
  assert.match(source, /aria-label=\{t\("safari_language_label"\)\}/);
});

const PROGRESSION_TEST_CONFIGS = [
  { level: 1, activityId: "leo_first_sound_hunt", title: "Sound Detective" },
  { level: 2, activityId: "leo_echo_roar", title: "Sound Matcher" },
  { level: 3, activityId: "leo_robot_words", title: "Odd One Out" },
  { level: 4, activityId: "leo_sound_twins", title: "Picture Stories" },
  { level: 5, activityId: "leo_story_roar", title: "Jungle Challenge" },
];

test("sequential progression: initially Level 1 is unlocked and other 4 levels are locked", () => {
  const result = computeLevelProgression({
    configs: PROGRESSION_TEST_CONFIGS,
    completedActivityIds: new Set(),
  });

  assert.equal(result[0].isUnlocked, true, "Level 1 must be unlocked");
  assert.equal(result[1].isUnlocked, false, "Level 2 must be locked");
  assert.equal(result[2].isUnlocked, false, "Level 3 must be locked");
  assert.equal(result[3].isUnlocked, false, "Level 4 must be locked");
  assert.equal(result[4].isUnlocked, false, "Level 5 must be locked");
});

test("sequential progression: backend available state cannot bypass predecessor locks", () => {
  const zones = [
    { activityId: "leo_first_sound_hunt", state: "current" },
    { activityId: "leo_echo_roar", state: "locked" },
    { activityId: "leo_robot_words", state: "available" },
    { activityId: "leo_sound_twins", state: "available" },
    { activityId: "leo_story_roar", state: "available" },
  ];

  const result = computeLevelProgression({
    configs: PROGRESSION_TEST_CONFIGS,
    completedActivityIds: new Set(),
    zones,
  });

  assert.equal(result[0].isUnlocked, true);
  assert.equal(result[1].isUnlocked, false);
  assert.equal(result[2].isUnlocked, false, "Level 3 must stay locked");
  assert.equal(result[3].isUnlocked, false, "Level 4 must stay locked");
  assert.equal(result[4].isUnlocked, false, "Level 5 must stay locked");
});

test("sequential progression: completing Level 1 unlocks Level 2 while Levels 3, 4, 5 stay locked", () => {
  const result = computeLevelProgression({
    configs: PROGRESSION_TEST_CONFIGS,
    completedActivityIds: new Set(["leo_first_sound_hunt"]),
  });

  assert.equal(result[0].isUnlocked, true);
  assert.equal(result[0].isCompleted, true);
  assert.equal(result[1].isUnlocked, true, "Level 2 unlocks after Level 1");
  assert.equal(result[1].isCompleted, false);
  assert.equal(result[2].isUnlocked, false, "Level 3 stays locked");
  assert.equal(result[3].isUnlocked, false, "Level 4 stays locked");
  assert.equal(result[4].isUnlocked, false, "Level 5 stays locked");
});

test("sequential progression: completing Level 1 and 2 unlocks Level 3 while 4 and 5 stay locked", () => {
  const result = computeLevelProgression({
    configs: PROGRESSION_TEST_CONFIGS,
    completedActivityIds: new Set(["leo_first_sound_hunt", "leo_echo_roar"]),
  });

  assert.equal(result[0].isUnlocked, true);
  assert.equal(result[1].isUnlocked, true);
  assert.equal(result[2].isUnlocked, true, "Level 3 unlocks after Level 2");
  assert.equal(result[3].isUnlocked, false, "Level 4 stays locked");
  assert.equal(result[4].isUnlocked, false, "Level 5 stays locked");
});

test("sequential progression: completing Levels 1 through 4 unlocks Level 5", () => {
  const result = computeLevelProgression({
    configs: PROGRESSION_TEST_CONFIGS,
    completedActivityIds: new Set([
      "leo_first_sound_hunt",
      "leo_echo_roar",
      "leo_robot_words",
      "leo_sound_twins",
    ]),
  });

  assert.equal(result[0].isUnlocked, true);
  assert.equal(result[1].isUnlocked, true);
  assert.equal(result[2].isUnlocked, true);
  assert.equal(result[3].isUnlocked, true);
  assert.equal(result[4].isUnlocked, true, "Level 5 unlocks after Level 4");
});

test("sequential progression: devUnlock flag unlocks all 5 levels", () => {
  const result = computeLevelProgression({
    configs: PROGRESSION_TEST_CONFIGS,
    completedActivityIds: new Set(),
    devUnlock: true,
  });

  for (let i = 0; i < 5; i++) {
    assert.equal(result[i].isUnlocked, true);
  }
});

