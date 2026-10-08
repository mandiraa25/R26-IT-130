const Student = require("../models/student.model");
const { WorkingMemoryImproveProgress } = require("../../workingMemory/models/workingMemoryImprove.model");

const readProgressStars = (progressDoc) =>
  Math.max(0, Number(progressDoc?.totalStars ?? progressDoc?.totalCarrots) || 0);

// GET /api/students/profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const wmProgress = await WorkingMemoryImproveProgress.findOne({ studentId: student._id });
    const totalStars = Math.max(Number(student.totalStars) || 0, readProgressStars(wmProgress));

    res.json({
      ...student.toObject(),
      totalStars,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/students/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, grade, profilePhoto, gender, school } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        grade,
        profilePhoto,
        gender,
        school,
      },
      { returnDocument: 'after', runValidators: true }
    ).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Profile updated successfully",
      student,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
