const mongoose = require("mongoose");
const ReadingSession = require("../models/readingSession.model");
const ReadingResult = require("../models/readingResult.model");
const ReadingGazeSample = require("../models/readingGazeSample.model");
const ReadingBehaviorEvent = require("../models/readingBehaviorEvent.model");
const ReadingAdaptAction = require("../models/readingAdaptAction.model");
const { PROGRESSION } = require("./gameLogic");

function summariseReading(results) {
  if (!results?.length) {
    return { started: false, available: true, totalLevels: PROGRESSION.length };
  }
  const completed = new Set(results.filter((result) => result.promoted).map((result) => result.level));
  const last = results[results.length - 1];
  const lastIndex = PROGRESSION.indexOf(last.level);
  const nextIndex = last.promoted ? Math.min(lastIndex + 1, PROGRESSION.length - 1) : Math.max(lastIndex, 0);
  return {
    started: true,
    available: true,
    totalLevels: PROGRESSION.length,
    currentLevel: nextIndex + 1,
    completedLevels: completed.size,
    finished: completed.size >= PROGRESSION.length,
  };
}

async function buildDashboard(studentId, mode) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    const error = new Error("Invalid student");
    error.status = 400;
    throw error;
  }
  const id = new mongoose.Types.ObjectId(studentId);
  const sessionMatch = { studentId: id };
  if (mode === "identification" || mode === "improvement") sessionMatch.mode = mode;

  const sessions = await ReadingSession.find(sessionMatch).select("_id").lean();
  const sessionIds = sessions.map((session) => session._id);
  const results = await ReadingResult.find(sessionMatch).sort({ createdAt: -1 }).limit(30).lean();

  const heatmap = sessionIds.length
    ? await ReadingGazeSample.aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        {
          $group: {
            _id: { x: { $floor: { $divide: ["$x", 40] } }, y: { $floor: { $divide: ["$y", 40] } } },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, x: "$_id.x", y: "$_id.y", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 1000 },
      ])
    : [];

  const difficultyZones = sessionIds.length
    ? await ReadingBehaviorEvent.aggregate([
        { $match: { sessionId: { $in: sessionIds }, type: { $in: ["CONFUSION", "DECODING_ISSUE"] } } },
        { $group: { _id: { target: "$target", type: "$type" }, count: { $sum: 1 } } },
        { $project: { _id: 0, target: "$_id.target", type: "$_id.type", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ])
    : [];

  const actionDensity = sessionIds.length
    ? await ReadingAdaptAction.aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $project: { _id: 0, action: "$_id", count: 1 } },
      ])
    : [];

  const brainSpeedTrend = results
    .map((result) => ({ at: result.createdAt, brainSpeed: result.brainSpeed, level: result.level }))
    .reverse();

  return { results, heatmap, difficultyZones, actionDensity, brainSpeedTrend };
}

module.exports = { summariseReading, buildDashboard };
