/*
 * FILE PURPOSE
 * Improvement progress/attempt/history Express endpoint definitions.
 *
 * HOW IT CONNECTS
 * backend/src/app.js mounts this router. Frontend improveApi calls these paths;
 * workingMemoryImprove.controller.js handles each request.
 * Direct source importers: ../../../app.js.
 *
 * THINGS TO REMEMBER
 * A route connects an HTTP method and URL to a controller function. These current WM routers do not
 * attach verifyToken/role middleware themselves. Frontend route guards and token headers must not be
 * mistaken for server-side authorization.
 */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/workingMemoryImprove.controller");
// VIVA: Mounted under /api/working-memory/improvement, these routes expose
// current unlocks, attempt saving and detailed history to the frontend service.

router.get("/progress/:studentId", controller.getStudentProgress);
router.post("/submit-attempt", controller.submitSubCategoryAttempt);
router.get("/history/:studentId", controller.getAttemptHistory);

module.exports = router;
