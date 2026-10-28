/*
 * FILE PURPOSE
 * Shared admin API router, including Working Memory screening-report access.
 * 
 * HOW IT CONNECTS
 * app.js mounts /api/admin. GET /results/working-memory/identify runs verifyToken/isAdmin then adminController.getWMIdentifyResults.
 * 
 * THINGS TO REMEMBER
 * The admin screening page reads this route. It is separate from student identification history and from the admin improvement placeholder. Other admin endpoints retain their existing implementation.
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, isAdmin, isSuperAdmin } = require("../../../middleware/auth.middleware");

// VIVA: Public admin authentication endpoints; these routes do not require an existing JWT.
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

// VIVA: verifyToken validates the JWT; isAdmin/isSuperAdmin then check its type and role.
router.get("/students", verifyToken, isAdmin, adminController.getAllStudents);
router.put("/students/:id", verifyToken, isSuperAdmin, adminController.superAdminUpdateStudent);
router.delete("/students/:id", verifyToken, isSuperAdmin, adminController.deleteStudent);

router.get("/results/working-memory/identify", verifyToken, isAdmin, adminController.getWMIdentifyResults);
router.get("/results/phonological-awareness/identify", verifyToken, isAdmin, adminController.getPAIdentifyResults);
router.get("/results/speech-processing/identify", verifyToken, isAdmin, adminController.getSpeechIdentifyResults);
router.get("/results/speech-processing/improve", verifyToken, isAdmin, adminController.getSpeechImproveResults);

// VIVA: School listing allows either admin role; write/account-management routes require super admin.
router.get("/schools", verifyToken, isAdmin, adminController.getAllSchools);
router.post("/schools", verifyToken, isSuperAdmin, adminController.createSchool);
router.get("/admins", verifyToken, isSuperAdmin, adminController.getAllAdmins);
router.post("/register-admin", verifyToken, isSuperAdmin, adminController.registerAdminByAdmin);
router.post("/register-student", verifyToken, isSuperAdmin, adminController.registerStudentByAdmin);
router.put("/admins/:id", verifyToken, isSuperAdmin, adminController.updateAdminByAdmin);
router.post("/users/reset-password", verifyToken, isSuperAdmin, adminController.resetUserPassword);
router.post("/users/toggle-status", verifyToken, isSuperAdmin, adminController.deactivateReactivateUser);

module.exports = router;
