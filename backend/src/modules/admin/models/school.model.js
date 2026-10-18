const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    studentCount: {
      type: Number,
      required: true,
    },
    grades: [
      {
        type: String,
        enum: ["2", "3", "4"],
      },
    ],
    plan: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
    },
    cost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", schoolSchema);
