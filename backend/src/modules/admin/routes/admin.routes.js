const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, isAdmin, isSuperAdmin } = require("../../../middleware/auth.middleware");

// Auth routes
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

// Dashboard routes
router.get("/students", verifyToken, isAdmin, adminController.getAllStudents);
router.put("/students/:id", verifyToken, isSuperAdmin, adminController.superAdminUpdateStudent);
router.delete("/students/:id", verifyToken, isSuperAdmin, adminController.deleteStudent);

router.get("/results/working-memory/identify", verifyToken, isAdmin, adminController.getWMIdentifyResults);
router.get("/results/phonological-awareness/identify", verifyToken, isAdmin, adminController.getPAIdentifyResults);
router.get("/results/speech-processing/identify", verifyToken, isAdmin, adminController.getSpeechIdentifyResults);
router.get("/results/speech-processing/improve", verifyToken, isAdmin, adminController.getSpeechImproveResults);

// Super Admin Users & School Management
router.get("/schools", verifyToken, isAdmin, adminController.getAllSchools);
router.post("/schools", verifyToken, isSuperAdmin, adminController.createSchool);
router.get("/admins", verifyToken, isSuperAdmin, adminController.getAllAdmins);
router.post("/register-admin", verifyToken, isSuperAdmin, adminController.registerAdminByAdmin);
router.post("/register-student", verifyToken, isSuperAdmin, adminController.registerStudentByAdmin);
router.put("/admins/:id", verifyToken, isSuperAdmin, adminController.updateAdminByAdmin);
router.post("/users/reset-password", verifyToken, isSuperAdmin, adminController.resetUserPassword);
router.post("/users/toggle-status", verifyToken, isSuperAdmin, adminController.deactivateReactivateUser);

module.exports = router;
