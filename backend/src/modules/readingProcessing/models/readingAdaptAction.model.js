const mongoose = require("mongoose");

const readingAdaptActionSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ReadingSession", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    t: { type: Number, required: true },
    action: {
      type: String,
      enum: [
        "HIGHLIGHT_LETTERS",
        "SPLIT_WORD",
        "PLAY_AUDIO",
        "SIMPLIFY_UI",
        "ATTENTION_PROMPT",
        "DIFFICULTY_DOWN",
        "DIFFICULTY_UP",
      ],
      required: true,
    },
    target: String,
    reason: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

readingAdaptActionSchema.index({ sessionId: 1, t: 1 });

module.exports = mongoose.model("ReadingAdaptAction", readingAdaptActionSchema);
