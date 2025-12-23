import mongoose from "mongoose";

// Define schema based on the user provided JSON structure
const LetterSchema = new mongoose.Schema(
  {
    _id: { type: Number }, // tracingNo is used as _id in the example
    tracingNo: { type: Number, required: true, unique: true },
    symbol: { type: String, index: true },
    companyName: { type: String },
    title: { type: String },
    letterCode: { type: String },
    publishDateTimeJalali: { type: String },
    sentDateTimeJalali: { type: String },
    hasAttachment: { type: Boolean },
    hasExcel: { type: Boolean },
    hasHtml: { type: Boolean },
    hasPdf: { type: Boolean },
    hasXbrl: { type: Boolean },
    isEstimate: { type: Boolean },
    underSupervision: { type: Number },
    url: { type: String },
    excelUrl: { type: String },
    pdfUrl: { type: String },
    attachmentUrl: { type: String },
    tedanUrl: { type: String },
    xbrlUrl: { type: String },
    fetchedAt: { type: Date },
    
    // New field for tags
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true, _id: false } // We use custom _id or let it be
);

// If the collection name is 'codal_letters'
export default mongoose.models.Letter || mongoose.model("Letter", LetterSchema, "codal_letters");
