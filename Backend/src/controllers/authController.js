const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/token");
const { sanitizeUser } = require("../utils/sanitize");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Admin = require("../models/Admin");
const DeliveryPartner = require("../models/DeliveryPartner");

const PLATFORM_COMMISSION_RATE = 0.05;

const createAuthHandlers = (Model, role, requiredFields = []) => {
  const register = asyncHandler(async (req, res) => {
    const { name, email, password, ...rest } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    for (const field of requiredFields) {
      if (!rest[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const exists = await Model.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await hashPassword(password);
    const account = await Model.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      ...rest,
    });

    const token = generateToken({
      id: account._id,
      role: account.role,
      email: account.email,
    });

    res.status(201).json({
      token,
      user: sanitizeUser(account),
    });
  });

  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const account = await Model.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (account.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }
    if (account.isSuspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }
    if (account.isActive === false) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const match = await comparePassword(password, account.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: account._id,
      role: account.role,
      email: account.email,
    });

    res.json({
      token,
      user: sanitizeUser(account),
    });
  });

  return { register, login };
};

const userAuth = createAuthHandlers(User, "user", ["mobileNo", "address"]);
const sellerAuth = createAuthHandlers(Seller, "seller", [
  "mobileNo",
  "shopAddress",
]);
const deliveryLogin = createAuthHandlers(DeliveryPartner, "deliveryPartner").login;
const { login: loginAdmin } = createAuthHandlers(Admin, "admin");

module.exports = {
  registerUser: userAuth.register,
  loginUser: userAuth.login,
  registerSeller: sellerAuth.register,
  loginSeller: sellerAuth.login,
  loginAdmin,
  loginDelivery: deliveryLogin,
  PLATFORM_COMMISSION_RATE,
};
