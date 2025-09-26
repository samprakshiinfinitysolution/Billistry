import mongoose, { Schema, Document, models } from "mongoose";

export interface IHSN extends Document {
  hsn_code: string;
  hsn_name: string;
  chapter_name?: string;
  gst_rate: number;
  item_type: string; // goods | services
}

const HSNSchema = new Schema<IHSN>(
  {
    hsn_code: { type: String, required: true },
    hsn_name: { type: String, required: true },
    chapter_name: { type: String },
    gst_rate: { type: Number, required: true },
    item_type: { type: String, enum: ["goods", "services"], required: true }
  },
  { timestamps: true }
);

export default models.HSN || mongoose.model<IHSN>("HSN", HSNSchema);
