const mongoose = require("mongoose");

// VIVA: Mongoose maps this schema to student documents; controllers hash passwords before saving.
const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
      enum: ["2", "3", "4"],
    },
    school: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    // VIVA: All documents in this collection are students; admin accounts use a separate model.
    role: {
      type: String,
      enum: ["student"],
      default: "student",
    },
    // VIVA: The profile form sends an image data URL, represented here as a string.
    profilePhoto: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    packageType: {
      type: String,
      enum: ["individual", "school"],
      default: "individual",
    },
    totalStars: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Password reset: only a SHA-256 hash of the emailed token is stored.
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  // VIVA: Mongoose maintains createdAt and updatedAt automatically.
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
