const mongoose = require("mongoose");

const readingBehaviorEventSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ReadingSession", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    t: { type: Number, required: true },
    type: {
      type: String,
      enum: ["FIXATION", "CONFUSION", "REGRESSION", "DECODING_ISSUE", "JITTER", "SKIP", "SACCADE"],
      required: true,
    },
    target: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

readingBehaviorEventSchema.index({ sessionId: 1, t: 1 });
readingBehaviorEventSchema.index({ studentId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("ReadingBehaviorEvent", readingBehaviorEventSchema);
