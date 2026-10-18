const mongoose = require("mongoose");

const readingResultSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ReadingSession", required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    mode: { type: String, enum: ["identification", "improvement"], required: true, index: true },
    level: { type: String, required: true },
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    avgReactionMs: Number,
    avgDecisionDelayMs: Number,
    brainSpeed: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    eventCounts: {
      CONFUSION: { type: Number, default: 0 },
      REGRESSION: { type: Number, default: 0 },
      DECODING_ISSUE: { type: Number, default: 0 },
      JITTER: { type: Number, default: 0 },
      SKIP: { type: Number, default: 0 },
    },
    promoted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingResult", readingResultSchema);
