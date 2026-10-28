// VIVA: crypto protects reset tokens; bcrypt hashes passwords; JWT signs login credentials.
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRegistration, validateLogin, validateEmail, validatePassword } = require("../validation/studentValidation");
const { sendPasswordResetEmail } = require("../services/mailer");

const Student = require("../models/student.model");
const Admin = require("../../admin/models/admin.model");

// 🔹 Generate Token
// VIVA: Tokens carry identity/role for middleware; they expire seven days after issuance.
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 🟢 Register Student
exports.registerStudent = async (req, res) => {
  try {
    // VIVA: Server validation is authoritative even if a caller bypasses the React form.
    const { errors, message } = validateRegistration(req.body);
    if (message) return res.status(400).json({ message, errors });

    const fullName = req.body.fullName.trim();
    const age = Number(req.body.age);
    const grade = String(req.body.grade);
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists.", errors: { email: "An account with this email already exists." } });
    }

    // VIVA: Store a salted bcrypt hash (cost 10), never the submitted plaintext password.
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      fullName,
      age,
      email,
      password: hashedPassword,
      grade,
    });

    res.status(201).json({
      message: "Student registered",
      token: generateToken(student),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered",
      token: generateToken(admin),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Login (Both Student & Admin)
exports.login = async (req, res) => {
  try {
    const { errors, message } = validateLogin(req.body);
    if (message) return res.status(400).json({ message, errors });
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    // VIVA: This shared endpoint searches students first, then the admin collection.
    let user = await Student.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact administrator." });
    }

    // VIVA: Compare against the saved hash; a match is required before issuing a JWT.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user),
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Password reset links work for this long.
const RESET_MINUTES = 60;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// POST /api/auth/forgot-password  { email }
// Emails a one-time reset link to a registered student's address.
exports.forgotPassword = async (req, res) => {
  try {
    const emailError = validateEmail(req.body?.email);
    if (emailError) return res.status(400).json({ message: emailError });
    const email = req.body.email.trim().toLowerCase();

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "No LexiLand account uses this email address." });
    }

    // VIVA: Email the raw random token, but persist only its SHA-256 hash and a 60-minute expiry.
    const token = crypto.randomBytes(32).toString("hex");
    student.resetPasswordTokenHash = hashToken(token);
    student.resetPasswordExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
    await student.save();

    const appUrl = (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    try {
      await sendPasswordResetEmail({ to: email, name: student.fullName, resetUrl, minutes: RESET_MINUTES });
    } catch (mailError) {
      console.error("Password reset email failed:", mailError.message);
      return res.status(502).json({ message: "We could not send the email right now. Please try again later." });
    }

    res.json({ message: `A password reset link has been sent to ${email}. It works for ${RESET_MINUTES} minutes.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/reset-password  { email, token, password }
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body || {};
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) || validateEmail(email)) {
      return res.status(400).json({ message: "This reset link is not valid. Please request a new one." });
    }

    // VIVA: A reset succeeds only for the same email, matching hash and unexpired database record.
    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordTokenHash: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordTokenHash +resetPasswordExpires");
    if (!student) {
      return res.status(400).json({ message: "This reset link has expired or was already used. Please request a new one." });
    }

    // VIVA: Clearing both reset fields makes the emailed token unusable after this successful save.
    student.password = await bcrypt.hash(password, 10);
    student.resetPasswordTokenHash = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    res.json({ message: "Your password has been changed. You can sign in now." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
