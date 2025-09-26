// models/Stock.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export type StockTxnType = "IN" | "OUT" | "ADJUST";

export interface IStock extends Document {
  business: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;          // Transaction quantity
  openingQuantity: number;   // Before this txn
  closingQuantity: number;   // After this txn
  txnType: StockTxnType;     // IN, OUT, ADJUST
  unit?: string;             // optional (kg, pcs, etc.)
  reference?: string;        // invoice id / purchase id / reason
  remarks?: string;          // notes for adjustments
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
}

const StockSchema = new Schema<IStock>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    quantity: { type: Number, required: true },

    // Ledger style
    openingQuantity: { type: Number, required: true },
    closingQuantity: { type: Number, required: true },

    txnType: { type: String, enum: ["IN", "OUT", "ADJUST"], required: true },
    unit: { type: String },

    reference: { type: String },
    remarks: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for faster reporting
StockSchema.index({ business: 1, product: 1, createdAt: -1 });
StockSchema.index({ business: 1, txnType: 1, createdAt: -1 });

export default models.Stock || model<IStock>("Stock", StockSchema);
