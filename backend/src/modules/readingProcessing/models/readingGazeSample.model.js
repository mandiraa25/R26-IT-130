const mongoose = require("mongoose");

const readingGazeSampleSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ReadingSession", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    t: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    target: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  },
  { versionKey: false }
);

readingGazeSampleSchema.index({ sessionId: 1, t: 1 });

module.exports = mongoose.model("ReadingGazeSample", readingGazeSampleSchema);
