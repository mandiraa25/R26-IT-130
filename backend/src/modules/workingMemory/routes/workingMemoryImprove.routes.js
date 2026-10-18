const express = require("express");
const router = express.Router();

const controller = require("../controllers/workingMemoryImprove.controller");

router.get("/progress/:studentId", controller.getStudentProgress);
router.post("/submit-attempt", controller.submitSubCategoryAttempt);
router.get("/history/:studentId", controller.getAttemptHistory);

module.exports = router;
