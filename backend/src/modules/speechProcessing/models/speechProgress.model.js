const mongoose = require("mongoose");

const activityProgressSchema = new mongoose.Schema(
  {
    activityId: String,
    status: {
      type: String,
      enum: ["locked", "available", "recommended", "current", "completed"],
      default: "locked",
    },
    starsEarned: { type: Number, default: 0 },
    attemptsCompleted: { type: Number, default: 0 },
    bestScore: Number,
    stars: { type: Number, default: 0 },
    completedAt: Date,
    lastPlayedAt: Date,
  },
  { _id: false }
);

const speechProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
      index: true,
    },
    overallIdentificationStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    improvementUnlocked: {
      type: Boolean,
      default: false,
    },
    identificationStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    supportLevel: {
      type: String,
      enum: ["unknown", "low_support", "medium_support", "high_support"],
      default: "unknown",
    },
    supportScore: Number,
    identificationCompletedAt: Date,
    recommendedActivityIds: { type: [String], default: [] },
    completedActivityIds: { type: [String], default: [] },
    currentActivityId: { type: String, default: "" },
    stars: { type: Number, default: 0, min: 0 },
    weakSkillFocus: { type: String, default: "" },
    baselineSnapshotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpeechAssessmentSnapshot",
    },
    latestCheckpointSnapshotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpeechAssessmentSnapshot",
    },
    checkpointCount: { type: Number, default: 0 },
    activitiesSinceCheckpoint: { type: Number, default: 0 },
    baselineRetestRequired: { type: Boolean, default: false },
    activityProgress: { type: [activityProgressSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpeechProgress", speechProgressSchema);
