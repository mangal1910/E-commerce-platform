const Admin = require("../models/Admin");
const { hashPassword } = require("../utils/password");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = "Admin";

const seedAdmin = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Skipping admin seeding: ADMIN_EMAIL or ADMIN_PASSWORD not configured.");
    return;
  }

  await Admin.deleteMany({ email: { $ne: ADMIN_EMAIL } });

  const hashed = await hashPassword(ADMIN_PASSWORD);
  await Admin.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    },
    { upsert: true, new: true }
  );

  console.log("Admin account ready");
};

module.exports = seedAdmin;
