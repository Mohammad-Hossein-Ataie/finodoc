import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["video", "audio", "text", "pdf", "image", "rich-text"], 
      required: true 
    },
    url: { type: String }, // S3 URL for files (optional for rich-text)
    richContent: { type: String }, // HTML content for rich text editor
    description: { type: String }, // Optional description for the content
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

// Clear any existing model to avoid caching issues in development
if (mongoose.models.Content) {
  delete mongoose.models.Content;
}

export default mongoose.model("Content", ContentSchema);
