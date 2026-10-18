const express = require("express");
const { verifyToken, isAdmin } = require("../../../middleware/auth.middleware");
const ReadingSession = require("../models/readingSession.model");
const ReadingResult = require("../models/readingResult.model");
const ReadingGazeSample = require("../models/readingGazeSample.model");
const ReadingBehaviorEvent = require("../models/readingBehaviorEvent.model");
const { BehaviorAnalyzer } = require("../services/behaviorAnalysis");
const { AdaptiveEngine } = require("../services/adaptiveEngine");
const { PROGRESSION, getTargets, nextLevelFor, shouldPromote } = require("../services/gameLogic");
const { aggregateBrainSpeed } = require("../services/brainSpeed");
const { buildDashboard } = require("../services/readingDashboard");

const router = express.Router();
const MODES = ["identification", "improvement"];

function fail(res, status, message) {
  return res.status(status).json({ message });
}

function sameStudent(session, userId) {
  return session && String(session.studentId) === String(userId);
}

router.get("/levels", verifyToken, (_req, res) => {
  res.json({ levels: PROGRESSION });
});

router.get("/next", verifyToken, async (req, res) => {
  try {
    const mode = MODES.includes(req.query.mode) ? req.query.mode : "identification";
    const requestedLevel = req.query.level;
    let level;
    let difficulty;

    if (requestedLevel && PROGRESSION.includes(requestedLevel)) {
      level = requestedLevel;
      difficulty = Number(req.query.difficulty) || 1;
    } else {
      const last = await ReadingResult.findOne({ studentId: req.user.id, mode }).sort({ createdAt: -1 }).lean();
      level = last ? nextLevelFor(last.level, last.promoted) : "shapes";
      difficulty = 1;
    }

    res.json({ level, difficulty, targets: getTargets(level, difficulty), mode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/session", verifyToken, async (req, res) => {
  try {
    const { level, mode, difficulty, deviceMeta } = req.body || {};
    if (!PROGRESSION.includes(level)) return fail(res, 400, "Choose a reading level.");
    if (!MODES.includes(mode)) return fail(res, 400, "Choose identification or improvement.");
    const levelDifficulty = Math.max(1, Math.min(5, Number(difficulty) || 1));
    const session = await ReadingSession.create({
      studentId: req.user.id,
      mode,
      level,
      difficulty: levelDifficulty,
      deviceMeta: deviceMeta && typeof deviceMeta === "object" ? deviceMeta : undefined,
    });
    res.status(201).json({ session, targets: getTargets(level, levelDifficulty) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/session/:id/end", verifyToken, async (req, res) => {
  try {
    const session = await ReadingSession.findById(req.params.id);
    if (!sameStudent(session, req.user.id)) return fail(res, 404, "Session not found");
    if (session.status === "ended") {
      const existing = await ReadingResult.findOne({ sessionId: session._id }).lean();
      if (existing) {
        return res.json({ result: existing, next: { level: nextLevelFor(session.level, existing.promoted) } });
      }
    }

    const correct = Math.max(0, Number(req.body?.correct) || 0);
    const total = Math.max(0, Number(req.body?.total) || 0);
    const reactions = Array.isArray(req.body?.reactions)
      ? req.body.reactions
          .filter((item) => item && Number.isFinite(Number(item.reactionMs)) && Number.isFinite(Number(item.decisionDelayMs)))
          .map((item) => ({ reactionMs: Number(item.reactionMs), decisionDelayMs: Number(item.decisionDelayMs) }))
      : [];

    session.endedAt = new Date();
    session.status = "ended";
    await session.save();

    const events = await ReadingBehaviorEvent.find({ sessionId: session._id }).select("type").lean();
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      { CONFUSION: 0, REGRESSION: 0, DECODING_ISSUE: 0, JITTER: 0, SKIP: 0 }
    );

    const speed = aggregateBrainSpeed(reactions);
    let result;
    try {
      result = await ReadingResult.create({
        sessionId: session._id,
        studentId: session.studentId,
        mode: session.mode,
        level: session.level,
        correct,
        total,
        eventCounts,
        ...speed,
        promoted: false,
      });
    } catch (err) {
      if (err.code === 11000) {
        const existing = await ReadingResult.findOne({ sessionId: session._id }).lean();
        return res.json({ result: existing, next: { level: nextLevelFor(session.level, existing?.promoted) } });
      }
      throw err;
    }
    result.promoted = shouldPromote(result);
    await result.save();

    res.json({
      result,
      next: { level: nextLevelFor(session.level, result.promoted) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/results", verifyToken, async (req, res) => {
  try {
    const mode = MODES.includes(req.query.mode) ? req.query.mode : undefined;
    const query = { studentId: req.user.id };
    if (mode) query.mode = mode;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const results = await ReadingResult.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const mode = MODES.includes(req.query.mode) ? req.query.mode : undefined;
    res.json(await buildDashboard(req.user.id, mode));
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

router.post("/track", verifyToken, async (req, res) => {
  try {
    const { sessionId, samples } = req.body || {};
    if (!sessionId || !Array.isArray(samples) || samples.length < 1 || samples.length > 500) {
      return fail(res, 400, "Send between 1 and 500 gaze samples.");
    }
    const session = await ReadingSession.findById(sessionId).lean();
    if (!sameStudent(session, req.user.id)) return fail(res, 404, "Session not found");
    const docs = samples
      .filter((sample) => Number.isFinite(sample?.t) && Number.isFinite(sample?.x) && Number.isFinite(sample?.y))
      .map((sample) => ({
        t: sample.t,
        x: sample.x,
        y: sample.y,
        target: typeof sample.target === "string" ? sample.target : undefined,
        sessionId,
        studentId: session.studentId,
      }));
    if (!docs.length) return fail(res, 400, "No usable gaze samples.");
    await ReadingGazeSample.insertMany(docs, { ordered: false });
    res.json({ accepted: docs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/analyze", verifyToken, (req, res) => {
  try {
    const samples = req.body?.samples;
    if (!Array.isArray(samples) || !samples.length) return fail(res, 400, "Send gaze samples to analyze.");
    const events = [];
    const actions = [];
    const analyzer = new BehaviorAnalyzer((evt) => events.push(evt));
    const engine = new AdaptiveEngine((act) => actions.push(act));
    for (const sample of samples) {
      if (!Number.isFinite(sample?.t) || !Number.isFinite(sample?.x) || !Number.isFinite(sample?.y)) continue;
      const before = events.length;
      analyzer.ingest(sample);
      for (let i = before; i < events.length; i++) engine.onBehaviorEvent(events[i], analyzer);
    }
    res.json({ events, actions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/dashboard/:studentId", verifyToken, isAdmin, async (req, res) => {
  try {
    const mode = MODES.includes(req.query.mode) ? req.query.mode : undefined;
    res.json(await buildDashboard(req.params.studentId, mode));
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
