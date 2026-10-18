const test = require("node:test");
const assert = require("node:assert/strict");

const { getLeoActivityAccess } = require("../services/leoActivityAccess.service");
const {
  buildActivityMap,
  getActivityPlan,
} = require("../services/leoActivityRecommendation.service");
const speechProcessingController = require("../controllers/speechProcessing.controller");
const SpeechAttempt = require("../models/speechAttempt.model");
const SpeechSession = require("../models/speechSession.model");
const Student = require("../../common/models/student.model");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const getLockedEchoSpeech = () => ({
  identificationStatus: "completed",
  improvementUnlocked: true,
  supportLevel: "low_support",
  completedActivityIds: [],
});

test("locked activities are denied with an actionable reason", () => {
  const result = getLeoActivityAccess({
    activities: [
      {
        activityId: "leo_echo_roar",
        state: "locked",
        lockReason: "Complete Sound Hunt first.",
      },
    ],
    activityId: "leo_echo_roar",
  });

  assert.deepEqual(result, {
    allowed: false,
    state: "locked",
    lockReason: "Complete Sound Hunt first.",
  });
});

test("current available completed and replay states are allowed", () => {
  for (const state of ["current", "available", "completed", "replay"]) {
    assert.equal(
      getLeoActivityAccess({ activities: [{ activityId: "a", state }], activityId: "a" }).allowed,
      true
    );
  }
});

test("unknown activities are denied with Leo's fallback lock reason", () => {
  assert.deepEqual(getLeoActivityAccess({ activities: [], activityId: "missing" }), {
    allowed: false,
    state: "unknown",
    lockReason: "Leo could not find this activity.",
  });
});

test("the activity map gives locked activities the current Leo pick as an actionable reason", () => {
  const speech = getLockedEchoSpeech();
  const plan = getActivityPlan({ speech });
  const echoRoar = buildActivityMap({ speech, plan }).find(
    (activity) => activity.activityId === "leo_echo_roar"
  );

  assert.deepEqual(
    { state: echoRoar.state, lockReason: echoRoar.lockReason },
    { state: "locked", lockReason: "Complete Story Trail first." }
  );
});

test("the activity map preserves stars from a Mongoose progress subdocument", () => {
  const progressSubdocument = {};
  Object.defineProperties(progressSubdocument, {
    activityId: { value: "leo_first_sound_hunt", enumerable: false },
    status: { value: "completed", enumerable: false },
    starsEarned: { value: 14, enumerable: false },
    stars: { value: 14, enumerable: false },
    attemptsCompleted: { value: 8, enumerable: false },
  });
  const speech = {
    identificationStatus: "completed",
    improvementUnlocked: true,
    supportLevel: "high_support",
    completedActivityIds: ["leo_first_sound_hunt"],
    currentActivityId: "leo_echo_roar",
    activityProgress: [progressSubdocument],
  };

  const activity = buildActivityMap({
    speech,
    plan: getActivityPlan({ speech }),
  }).find((item) => item.activityId === "leo_first_sound_hunt");

  assert.equal(activity.starsEarned, 14);
  assert.equal(activity.stars, 14);
  assert.equal(activity.attemptsCompleted, 8);
});

test("activity detail denies a locked activity without returning prompts", async () => {
  const originalStudentFindById = Student.findById;
  const originalAttemptFind = SpeechAttempt.find;
  const speech = getLockedEchoSpeech();

  Student.findById = () => ({
    select: async () => ({ accountStatus: "active", lexilandProgress: { speech } }),
  });
  SpeechAttempt.find = () => ({
    sort() {
      return this;
    },
    limit() {
      return this;
    },
    lean: async () => [],
  });

  try {
    const response = createResponse();
    await speechProcessingController.getImprovementActivityDetail(
      { user: { id: "student-access" }, params: { activityId: "leo_echo_roar" } },
      response
    );

    assert.equal(response.statusCode, 403);
    assert.deepEqual(response.body, {
      code: "activity_locked",
      lockReason: "Complete Story Trail first.",
    });
  } finally {
    Student.findById = originalStudentFindById;
    SpeechAttempt.find = originalAttemptFind;
  }
});

test("session creation denies a locked activity before creating a session", async () => {
  const originalStudentFindById = Student.findById;
  const originalAttemptFind = SpeechAttempt.find;
  const originalSessionCreate = SpeechSession.create;
  const speech = getLockedEchoSpeech();
  let createCalled = false;

  Student.findById = () => ({
    select: async () => ({
      grade: "4",
      accountStatus: "active",
      lexilandProgress: { speech },
    }),
  });
  SpeechAttempt.find = () => ({
    sort() {
      return this;
    },
    limit() {
      return this;
    },
    lean: async () => [],
  });
  SpeechSession.create = async () => {
    createCalled = true;
    return { _id: "unexpected-session" };
  };

  try {
    const response = createResponse();
    await speechProcessingController.startImprovementSession(
      {
        user: { id: "student-access", type: "student" },
        body: { activityId: "leo_echo_roar" },
      },
      response
    );

    assert.equal(response.statusCode, 403);
    assert.deepEqual(response.body, {
      code: "activity_locked",
      lockReason: "Complete Story Trail first.",
    });
    assert.equal(createCalled, false);
  } finally {
    Student.findById = originalStudentFindById;
    SpeechAttempt.find = originalAttemptFind;
    SpeechSession.create = originalSessionCreate;
  }
});

test("the activity map unlocks Level 2 when Level 1 is completed while Level 3 remains locked", () => {
  const speech = {
    identificationStatus: "completed",
    improvementUnlocked: true,
    supportLevel: "low_support",
    completedActivityIds: ["leo_first_sound_hunt"],
  };
  const plan = getActivityPlan({ speech });
  const map = buildActivityMap({ speech, plan });
  const level1 = map.find((item) => item.activityId === "leo_first_sound_hunt");
  const level2 = map.find((item) => item.activityId === "leo_echo_roar");
  const level3 = map.find((item) => item.activityId === "leo_robot_words");

  assert.equal(level1.state, "completed");
  assert.equal(level2.state, "available");
  assert.equal(getLeoActivityAccess({ activities: map, activityId: "leo_echo_roar" }).allowed, true);
  assert.equal(level3.state, "locked");
  assert.equal(getLeoActivityAccess({ activities: map, activityId: "leo_robot_words" }).allowed, false);
});

test("the activity map unlocks Level 3 when Level 2 is completed while Level 4 remains locked", () => {
  const speech = {
    identificationStatus: "completed",
    improvementUnlocked: true,
    supportLevel: "low_support",
    completedActivityIds: ["leo_first_sound_hunt", "leo_echo_roar"],
  };
  const plan = getActivityPlan({ speech });
  const map = buildActivityMap({ speech, plan });
  const level2 = map.find((item) => item.activityId === "leo_echo_roar");
  const level3 = map.find((item) => item.activityId === "leo_robot_words");
  const level4 = map.find((item) => item.activityId === "leo_sound_twins");

  assert.equal(level2.state, "completed");
  assert.equal(level3.state, "available");
  assert.equal(getLeoActivityAccess({ activities: map, activityId: "leo_robot_words" }).allowed, true);
  assert.equal(level4.state, "locked");
  assert.equal(getLeoActivityAccess({ activities: map, activityId: "leo_sound_twins" }).allowed, false);
});

