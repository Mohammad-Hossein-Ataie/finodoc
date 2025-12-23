import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, default: "login", index: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL index
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ mobile: 1, createdAt: -1 });

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
