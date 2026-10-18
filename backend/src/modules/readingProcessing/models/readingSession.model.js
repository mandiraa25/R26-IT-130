const mongoose = require("mongoose");

const readingSessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    mode: { type: String, enum: ["identification", "improvement"], required: true, index: true },
    level: { type: String, enum: ["shapes", "letters", "words", "sentences"], required: true },
    difficulty: { type: Number, default: 1, min: 1, max: 5 },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    deviceMeta: {
      viewportW: Number,
      viewportH: Number,
      dpr: Number,
      ua: String,
    },
    status: { type: String, enum: ["active", "ended", "aborted"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingSession", readingSessionSchema);
