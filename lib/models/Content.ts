import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "audio", "text", "pdf"], required: true },
    url: { type: String, required: true }, // S3 URL or text content
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Content || mongoose.model("Content", ContentSchema);
