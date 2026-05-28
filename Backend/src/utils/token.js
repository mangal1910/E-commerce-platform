const jwt = require("jsonwebtoken");

const JWT_SECRET = "Batman_V/S_Superman";

const generateToken = (payload, expiresIn = "7d") =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
};
