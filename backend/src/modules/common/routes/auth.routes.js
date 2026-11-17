const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// VIVA: Mounted under /api/auth by the app. Each POST delegates validation/work to its controller.
// VIVA: These entry/reset endpoints do not require an existing login token.
router.post("/register/student", authController.registerStudent);
router.post("/register/admin", authController.registerAdmin);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
