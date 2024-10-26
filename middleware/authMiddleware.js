const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token is not valid" });
  }
};

const staffOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

module.exports = { auth, staffOnly };
