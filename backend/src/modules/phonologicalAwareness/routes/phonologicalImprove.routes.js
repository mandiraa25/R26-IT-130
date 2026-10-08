const express = require("express");
const router = express.Router();
const phonologicalImproveController = require("../controllers/phonologicalImprove.controller");

const { validateGradeAndLanguage } = require("../middleware/phonologicalContext.middleware");

// Route to get student progress & unlocked levels
router.get(
  "/progress/:studentId",
  phonologicalImproveController.getStudentProgress
);

// Route to submit a sub-category attempt & update unlock state
router.post(
  "/submit-attempt",
  validateGradeAndLanguage,
  phonologicalImproveController.submitSubCategoryAttempt
);

// Route to get historical attempts for a student
router.get(
  "/history/:studentId",
  phonologicalImproveController.getAttemptHistory
);

module.exports = router;
