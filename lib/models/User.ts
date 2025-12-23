import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true },
    name: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
