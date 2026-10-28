/*
 * FILE PURPOSE
 * Mongoose schema for one completed screening attempt and its assessment features.
 *
 * HOW IT CONNECTS
 * The identification controller creates/saves documents and reads history; improvement placement reads
 * the first document. Admin/student report APIs also read these records.
 * Direct source importers: ../../admin/controllers/admin.controller.js,
 * ../../common/controllers/student.controller.js, ../controllers/workingMemoryIdentify.controller.js,
 * ../controllers/workingMemoryImprove.controller.js.
 *
 * THINGS TO REMEMBER
 * studentId links to Student. questionResults includes scalar/array answers, correctness, errorType
 * and millisecond timing. metrics keeps both frontend assessment values and optional ML
 * prediction/confidence. timestamps adds createdAt/updatedAt. Schema comments do not change validation
 * or fields.
 */

const mongoose = require("mongoose");

const workingMemoryIdentifySchema = new mongoose.Schema(
  // VIVA: One document represents one completed screening attempt. Mixed answer
  // fields support both scalar choices and picture/number sequences.
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    grade: {
      type: String,
      enum: ["2", "3", "4"],
      required: true,
    },

    totalScore: Number,
    totalQuestions: Number,

    questionResults: [
      {
        questionId: String,
        category: String,

        isCorrect: Boolean,
        timeTaken: Number,
        memorizationTimeAllocated: Number,

        userAnswer: mongoose.Schema.Types.Mixed,
        correctAnswer: mongoose.Schema.Types.Mixed,

        errorType: {
          type: String,
          enum: [
            "correct",
            "partial_recall",
            "wrong_order",
            "skipped",
            "incorrect",
            "guess",
          ],
        },
      },
    ],

    totalTimeTaken: Number,
    // VIVA: Screening response and total times are milliseconds. Risk/features
    // describe assessment performance; they are separate from improvement stars.

    // 🔥 FINAL SCORING + ML FEATURES
    metrics: {
      recallAccuracy: Number,
      avgResponseTime: Number,
      digitSpan: Number,
      digitSpanScore: Number,
      sequenceScore: Number,
      instructionScore: Number,
      patternScore: Number,
      timeScore: Number,
      finalScore: Number,
      riskLevel: {
        type: String,
        enum: ["Low", "Moderate", "High"],
      },
      weakAreas: [String],
      mlPrediction: String,
      mlConfidence: {
        Average: Number,
        High: Number,
        Low: Number
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "WorkingMemoryIdentify",
  workingMemoryIdentifySchema
);
