/*
 * FILE PURPOSE
 * Shared student profile and learning-summary endpoints used by Working Memory entry/access.
 * 
 * HOW IT CONNECTS
 * app.js mounts /api/students. Student controller supplies identity, module stars and learning summary. Frontend student/api and improveApi call these routes.
 * 
 * THINGS TO REMEMBER
 * These student routes explicitly use verifyToken before reading req.user identity. This differs from the current dedicated WM routers, which do not attach that middleware. No middleware or route is changed here.
 */

const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const { verifyToken } = require("../../../middleware/auth.middleware");

// Routes
router.get("/profile", verifyToken, studentController.getProfile);
router.put("/profile", verifyToken, studentController.updateProfile);
router.get("/learning-summary", verifyToken, studentController.getLearningSummary);

module.exports = router;
