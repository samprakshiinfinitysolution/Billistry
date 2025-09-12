// // models/Cashbook.ts
// import mongoose, { Schema, Document, model, models } from "mongoose";

// export type CashType = "You Gave" | "You Got"; 

// export interface ICashbook extends Document {
//   business: mongoose.Types.ObjectId;
//   partyType: "Customer" | "Supplier";
//   party: mongoose.Types.ObjectId;
//   type: CashType;
//   amount: number;
//   paymentMode?: "CASH" | "BANK" | "UPI" | "OTHER";
//   reference?: string;
//   note?: string;
//   date: Date;
//   createdBy?: mongoose.Types.ObjectId;
//   createdAt?: Date;
// }

// const CashbookSchema = new Schema<ICashbook>(
//   {
//     business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
//     partyType: { type: String, enum: ["Customer", "Supplier"], required: true },
//     party: { type: Schema.Types.ObjectId, required: true, index: true, refPath: "partyType" },
//     type: { type: String, enum: ["You Gave", "You Got"], required: true },
//     amount: { type: Number, required: true },
//     paymentMode: { type: String, enum: ["CASH", "BANK", "UPI", "OTHER"], default: "CASH" },
//     reference: { type: String },
//     note: { type: String },
//     date: { type: Date, default: () => new Date(), index: true },
//     createdBy: { type: Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// CashbookSchema.index({ business: 1, date: -1 });

// export default models.Cashbook || model<ICashbook>("Cashbook", CashbookSchema);
