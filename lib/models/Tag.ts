import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    group: { type: String, default: "General" }, // e.g., "Financial", "Education"
  },
  { timestamps: true }
);

export default mongoose.models.Tag || mongoose.model("Tag", TagSchema);
