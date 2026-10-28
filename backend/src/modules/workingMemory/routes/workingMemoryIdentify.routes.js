/*
 * FILE PURPOSE
 * Screening save/history Express endpoint definitions.
 *
 * HOW IT CONNECTS
 * backend/src/app.js mounts this router. Frontend identifyApi calls these paths;
 * workingMemoryIdentify.controller.js handles each request.
 * Direct source importers: ../../../app.js.
 *
 * THINGS TO REMEMBER
 * A route connects an HTTP method and URL to a controller function. These current WM routers do not
 * attach verifyToken/role middleware themselves. Frontend route guards and token headers must not be
 * mistaken for server-side authorization.
 */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/workingMemoryIdentify.controller");
// VIVA: The app mounts this router under /api/working-memory/identification;
// these paths select a controller, which reads/writes through its Mongoose model.

router.post("/save-result", controller.saveResult);
router.get("/student-results/:studentId", controller.getStudentResults);

module.exports = router;
