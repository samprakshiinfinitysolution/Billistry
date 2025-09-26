// models/Report.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export type ReportType = "Sales" | "Purchase" | "ProfitLoss" | "Cashflow" | "Outstanding";

export interface IReport extends Document {
  business: mongoose.Types.ObjectId;
  type: ReportType;
  periodStart: Date;
  periodEnd: Date;
  generatedBy?: mongoose.Types.ObjectId;
  fileUrl?: string; // CSV / PDF export
  meta?: any;
  createdAt?: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    type: { type: String, enum: ["Sales", "Purchase", "ProfitLoss", "Cashflow", "Outstanding"], required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    fileUrl: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ReportSchema.index({ business: 1, type: 1, periodStart: -1 });

export default models.Report || model<IReport>("Report", ReportSchema);
