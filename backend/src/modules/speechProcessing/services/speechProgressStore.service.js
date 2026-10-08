const Student = require("../../common/models/student.model");
const SpeechProgress = require("../models/speechProgress.model");

const LEXILAND_PREFIX = "lexilandProgress.";

const defaultSpeechProgress = () => ({
  overallIdentificationStatus: "not_started",
  improvementUnlocked: false,
  identificationStatus: "not_started",
  supportLevel: "unknown",
  supportScore: undefined,
  identificationCompletedAt: undefined,
  recommendedActivityIds: [],
  completedActivityIds: [],
  currentActivityId: "",
  stars: 0,
  weakSkillFocus: "",
  baselineSnapshotId: undefined,
  latestCheckpointSnapshotId: undefined,
  checkpointCount: 0,
  activitiesSinceCheckpoint: 0,
  baselineRetestRequired: false,
  activityProgress: [],
});

const mapStudentAccountStatus = (student) => {
  if (!student) return "active";
  if (typeof student.isActive === "boolean") {
    return student.isActive ? "active" : "inactive";
  }
  return student.accountStatus || "active";
};

const buildLexilandProgress = (speechDoc = {}) => {
  const speech = speechDoc?.toObject ? speechDoc.toObject() : { ...speechDoc };
  delete speech.studentId;
  delete speech._id;
  delete speech.createdAt;
  delete speech.updatedAt;
  delete speech.__v;

  return {
    overallIdentificationStatus:
      speech.overallIdentificationStatus || "not_started",
    improvementUnlocked: Boolean(speech.improvementUnlocked),
    speech,
  };
};

const flattenLexilandSet = (setPayload = {}) => {
  const updates = {};
  Object.entries(setPayload).forEach(([key, value]) => {
    if (!key.startsWith(LEXILAND_PREFIX)) return;
    const path = key.slice(LEXILAND_PREFIX.length);
    if (path === "improvementUnlocked") {
      updates.improvementUnlocked = value;
      return;
    }
    if (path.startsWith("speech.")) {
      updates[path.slice("speech.".length)] = value;
      return;
    }
    updates[path] = value;
  });
  return updates;
};

const mongoose = require("mongoose");

const getOrCreateSpeechProgress = async (studentId) => {
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return defaultSpeechProgress();
  }
  let progress = await SpeechProgress.findOne({ studentId });
  if (!progress) {
    progress = await SpeechProgress.create({
      studentId,
      ...defaultSpeechProgress(),
    });
  }
  return progress;
};

const getSpeechProgressObject = async (studentId) => {
  const progress = await getOrCreateSpeechProgress(studentId);
  return progress?.toObject ? progress.toObject() : progress;
};

const applyLexilandProgressSet = async (studentId, setPayload = {}) => {
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return defaultSpeechProgress();
  }
  const updates = flattenLexilandSet(setPayload);
  if (!Object.keys(updates).length) return getOrCreateSpeechProgress(studentId);

  return SpeechProgress.findOneAndUpdate(
    { studentId },
    { $set: updates },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const loadStudentWithSpeech = async (studentId, select = "fullName email grade isActive") => {
  const query = Student.findById(studentId);
  const selected = query && typeof query.select === "function" ? query.select(select) : query;
  const student = selected && typeof selected.lean === "function" ? await selected.lean() : await selected;
  if (!student) return null;

  const speechProgress = student.lexilandProgress?.speech
    ? student.lexilandProgress
    : buildLexilandProgress(await getOrCreateSpeechProgress(studentId));
  return {
    ...student,
    _id: student._id || studentId,
    username: student.username || student.email || "",
    accountStatus: mapStudentAccountStatus(student),
    lexilandProgress: speechProgress,
  };
};

const attachSpeechToChild = async (child) => {
  if (!child) return null;
  const studentId = child._id || child.id;
  const speechProgress = await getOrCreateSpeechProgress(studentId);
  const plain = child.toObject ? child.toObject() : { ...child };
  plain.accountStatus = mapStudentAccountStatus(plain);
  plain.lexilandProgress = buildLexilandProgress(speechProgress);
  return plain;
};

module.exports = {
  getOrCreateSpeechProgress,
  getSpeechProgressObject,
  applyLexilandProgressSet,
  loadStudentWithSpeech,
  attachSpeechToChild,
  buildLexilandProgress,
  defaultSpeechProgress,
};
