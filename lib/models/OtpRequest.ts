import mongoose from "mongoose";

const OtpRequestSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    purpose: { type: String, default: "login", index: true },
    ip: { type: String, default: null, index: true },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

// Keep a short history for rate-limiting; older docs auto-expire.
// 7 days is usually enough for abuse investigation while staying small.
OtpRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
OtpRequestSchema.index({ mobile: 1, purpose: 1, createdAt: -1 });
OtpRequestSchema.index({ ip: 1, createdAt: -1 });

export default mongoose.models.OtpRequest ||
  mongoose.model("OtpRequest", OtpRequestSchema);
