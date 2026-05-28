const Admin = require("../models/Admin");
const { hashPassword } = require("../utils/password");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = "Admin";

const seedAdmin = async () => {
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
