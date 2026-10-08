const Student = require("../../common/models/student.model");

/**
 * Middleware to validate student grade and language before displaying questions or submitting attempts
 * within the Phonological Awareness module.
 * Extracts grade and language from req.body, req.query, or req.headers, and validates against allowed values.
 * If req.user is set (via JWT auth middleware), fall back to the student's registered grade.
 */
exports.validateGradeAndLanguage = async (req, res, next) => {
  try {
    let grade = req.body?.grade || req.query?.grade || req.headers["x-student-grade"];
    let language = req.body?.language || req.query?.language || req.headers["x-language"] || req.headers["accept-language"];

    // Fallback: If grade is not provided in request, check logged-in student profile
    if (!grade && req.user && req.user.id) {
      const student = await Student.findById(req.user.id);
      if (student && student.grade) {
        grade = student.grade;
      }
    }

    // Default language fallback if not provided (default to English 'en')
    if (!language) {
      language = "en";
    }

    // Normalize values
    const gradeStr = grade ? String(grade).trim() : "";
    const langStr = String(language).toLowerCase().trim();

    // Allowed parameters
    const ALLOWED_GRADES = ["2", "3", "4"];
    const ALLOWED_LANGUAGES = ["en", "si"];

    // Validation checks
    if (!gradeStr || !ALLOWED_GRADES.includes(gradeStr)) {
      return res.status(400).json({
        success: false,
        message: `Invalid or missing student grade: '${gradeStr}'. Allowed grades are: ${ALLOWED_GRADES.join(", ")}.`,
      });
    }

    if (!ALLOWED_LANGUAGES.includes(langStr)) {
      return res.status(400).json({
        success: false,
        message: `Invalid language code: '${langStr}'. Allowed languages are: 'en' (English), 'si' (Sinhala).`,
      });
    }

    // Attach validated context to request object for downstream controllers
    req.studentContext = {
      grade: gradeStr,
      language: langStr,
    };

    next();
  } catch (error) {
    console.error("Error in validateGradeAndLanguage middleware:", error);
    res.status(500).json({
      success: false,
      message: "Server error validating student context",
      error: error.message,
    });
  }
};
