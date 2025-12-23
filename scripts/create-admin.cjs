/*
Usage examples:

1) Create/Update an OTP-based admin (recommended, uses existing /login OTP UI):
   set ADMIN_MOBILE=0912xxxxxxx
   set ADMIN_NAME=Admin Name
   node scripts/create-admin.cjs

2) Create/Update a username/password admin (for /api/auth/admin-login):
   set ADMIN_USERNAME=madah
   set ADMIN_PASSWORD=YourStrongPassword
   set ADMIN_NAME=Admin Name
   node scripts/create-admin.cjs

3) Provide both (admin can login either way):
   set ADMIN_MOBILE=0912xxxxxxx
   set ADMIN_USERNAME=madah
   set ADMIN_PASSWORD=YourStrongPassword
   node scripts/create-admin.cjs

Notes:
- Password is stored as bcrypt hash.
- Requires MONGODB_URI in environment.
*/

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_MOBILE = process.env.ADMIN_MOBILE;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Put it in .env.local or environment.");
  process.exit(1);
}

if (!ADMIN_MOBILE && !ADMIN_USERNAME) {
  console.error("Provide ADMIN_MOBILE (OTP admin) or ADMIN_USERNAME (password admin).");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  const UserSchema = new mongoose.Schema(
    {
      mobile: { type: String, unique: true, sparse: true, index: true },
      username: { type: String, unique: true, sparse: true, index: true },
      password: { type: String },
      name: { type: String },
      role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const update = {
    name: ADMIN_NAME,
    role: "admin",
  };

  if (ADMIN_USERNAME) update.username = ADMIN_USERNAME;

  if (ADMIN_PASSWORD) {
    update.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  }

  // Prefer matching by username if provided, else by mobile.
  const filter = ADMIN_USERNAME
    ? { username: ADMIN_USERNAME }
    : { mobile: ADMIN_MOBILE };

  if (!filter.username && !filter.mobile) {
    throw new Error("No valid filter to upsert admin.");
  }

  // Ensure mobile is set if provided (useful for OTP login)
  if (ADMIN_MOBILE) update.mobile = ADMIN_MOBILE;

  const user = await User.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  console.log("Admin upserted:");
  console.log({
    _id: String(user._id),
    mobile: user.mobile,
    username: user.username,
    role: user.role,
    name: user.name,
    hasPassword: Boolean(user.password),
  });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
