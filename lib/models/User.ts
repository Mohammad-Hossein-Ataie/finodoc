import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // OTP-based users
    mobile: { type: String, unique: true, sparse: true, index: true },

    // Optional admin credentials (username/password)
    username: { type: String, unique: true, sparse: true, index: true },
    // Store a bcrypt hash (never store plaintext)
    password: { type: String },

    name: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
