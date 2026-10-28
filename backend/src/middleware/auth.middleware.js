const jwt = require("jsonwebtoken");

// VIVA: Authentication: read the Authorization header, verify the JWT, and attach its claims.
// VIVA: Protected route handlers use req.user.id instead of trusting a browser-supplied identity.
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// VIVA: Authorization runs after verifyToken and checks the claims required by admin-only routes.
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.type === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

exports.isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.type === 'admin' && req.user.role === 'super admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin only." });
  }
};