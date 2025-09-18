import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IReturnItem {
  product: mongoose.Types.ObjectId;
  name?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  condition?: "good" | "bad"; // ✅ good = refundable, bad = not
}

export interface IReturn extends Document {
  type: "sales" | "purchase";
  saleId?: mongoose.Types.ObjectId;
  purchaseId?: mongoose.Types.ObjectId;
  invoiceNo: string; // ✅ added
  items: IReturnItem[];
  reason?: string;
  refundAmount?: number; // ✅ only refundable if condition = good
  subtotal: number;
  tax: number;
  grandTotal: number;
  business: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    condition: { type: String, enum: ["good", "bad"], default: "good" },
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    type: { type: String, enum: ["sales", "purchase"], required: true },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale" },
    purchaseId: { type: Schema.Types.ObjectId, ref: "Purchase" },
    invoiceNo: { type: String, required: true, unique: true }, // ✅ added
    items: [ReturnItemSchema],
    reason: { type: String },
    refundAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.Return || model<IReturn>("Return", ReturnSchema);
