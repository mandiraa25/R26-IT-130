const mongoose = require("mongoose");

const phonologicalIdentifySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    gradeCategory: {
      type: String,
      enum: ["1-3", "4-5"],
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    questionResults: [
      {
        questionId: String,
        category: String,
        isCorrect: Boolean,
        timeTaken: Number, // In milliseconds
        userAnswer: mongoose.Schema.Types.Mixed,
        correctAnswer: mongoose.Schema.Types.Mixed,
      },
    ],
    totalTimeTaken: {
      type: Number, // In milliseconds
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PhonologicalIdentify", phonologicalIdentifySchema);
