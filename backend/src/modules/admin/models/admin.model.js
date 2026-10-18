const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
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
    role: {
      type: String,
      enum: ["school admin", "super admin"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    school: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);