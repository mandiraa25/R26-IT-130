const jwt = require("jsonwebtoken");
const ReadingSession = require("../models/readingSession.model");
const ReadingGazeSample = require("../models/readingGazeSample.model");
const ReadingBehaviorEvent = require("../models/readingBehaviorEvent.model");
const ReadingAdaptAction = require("../models/readingAdaptAction.model");
const { BehaviorAnalyzer } = require("../services/behaviorAnalysis");
const { AdaptiveEngine } = require("../services/adaptiveEngine");

function registerSocketHandlers(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id || decoded.type === "admin") return next(new Error("unauthorized"));
      socket.user = decoded;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const sessionState = new Map();

    socket.on("session.join", async ({ sessionId }, ack) => {
      const session = await ReadingSession.findById(sessionId).lean();
      if (!session || String(session.studentId) !== String(socket.user.id)) {
        return ack?.({ ok: false, error: "not_found" });
      }

      const sampleQueue = [];
      let engine;
      const analyzer = new BehaviorAnalyzer((evt) => {
        socket.emit("behavior.event", evt);
        if (engine && evt.type !== "FIXATION" && evt.type !== "SACCADE") {
          engine.onBehaviorEvent(evt, analyzer);
        }
        ReadingBehaviorEvent.create({
          sessionId,
          studentId: session.studentId,
          t: evt.t,
          type: evt.type,
          target: evt.target,
          meta: evt.meta,
        }).catch((e) => console.error("[reading behavior persist]", e.message));
      });
      engine = new AdaptiveEngine((act) => {
        socket.emit("adapt.action", act);
        ReadingAdaptAction.create({
          sessionId,
          studentId: session.studentId,
          t: act.t,
          action: act.action,
          target: act.target,
          reason: act.reason,
          meta: act.meta,
        }).catch((e) => console.error("[reading adapt persist]", e.message));
      });

      sessionState.set(sessionId, { session, analyzer, engine, sampleQueue, correct: 0 });
      socket.join(`session:${sessionId}`);
      ack?.({ ok: true });
    });

    socket.on("gaze.sample", (sample) => {
      const state = sessionState.get(sample.sessionId);
      if (!state) return;
      state.analyzer.ingest(sample);
      state.sampleQueue.push({ t: sample.t, x: sample.x, y: sample.y, target: sample.target });
      if (state.sampleQueue.length >= 30) flushSamples(state, sample.sessionId);
    });

    socket.on("gaze.batch", ({ sessionId, samples = [] }) => {
      const state = sessionState.get(sessionId);
      if (!state) return;
      for (const s of samples) {
        state.analyzer.ingest(s);
        state.sampleQueue.push({ t: s.t, x: s.x, y: s.y, target: s.target });
      }
      flushSamples(state, sessionId);
    });

    socket.on("game.tick", ({ sessionId, correct }) => {
      const state = sessionState.get(sessionId);
      if (!state) return;
      state.correct = correct;
      state.engine.onTick(Date.now(), state.analyzer, { correct });
    });

    socket.on("session.end", async ({ sessionId }) => {
      const state = sessionState.get(sessionId);
      if (!state) return;
      await flushSamples(state, sessionId);
      sessionState.delete(sessionId);
      socket.leave(`session:${sessionId}`);
    });

    socket.on("disconnect", async () => {
      for (const [sid, state] of sessionState.entries()) {
        try { await flushSamples(state, sid); } catch { /* keep the disconnect quiet */ }
      }
      sessionState.clear();
    });
  });
}

async function flushSamples(state, sessionId) {
  if (!state.sampleQueue.length) return;
  const docs = state.sampleQueue.splice(0).map((s) => ({
    sessionId,
    studentId: state.session.studentId,
    t: s.t,
    x: s.x,
    y: s.y,
    target: s.target,
  }));
  try {
    await ReadingGazeSample.insertMany(docs, { ordered: false });
  } catch (e) {
    console.error("[reading gaze persist]", e.message);
  }
}

module.exports = { registerSocketHandlers };
