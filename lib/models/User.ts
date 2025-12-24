import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // OTP-based users
    mobile: { type: String, unique: true, sparse: true, index: true },

    email: { type: String, unique: true, sparse: true, index: true },

    // Optional admin credentials (username/password)
    username: { type: String, unique: true, sparse: true, index: true },
    // Store a bcrypt hash (never store plaintext)
    password: { type: String },

    name: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  },
  { timestamps: true }
);

// In Next.js dev/HMR, `mongoose.models.User` may persist across reloads.
// If the schema changes (e.g. new fields like `email`), the cached model can
// cause strict updates to silently drop those fields.
const ExistingUserModel = mongoose.models.User as mongoose.Model<any> | undefined;
if (ExistingUserModel && !ExistingUserModel.schema.path("email")) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model("User", UserSchema);
