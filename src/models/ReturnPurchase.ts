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

  items: IReturnItem[];
  reason?: string;

  // Financials
  refundAmount?: number; // ✅ only refundable if condition = good
  subtotal: number;
  tax: number;
  grandTotal: number;

  // Business Context
  business: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId; // ✅ purchase-specific (who the return goes to)
  createdBy?: mongoose.Types.ObjectId;

  // Tracking
  restock?: boolean; // ✅ true if returned items should go back to inventory
  status?: "pending" | "approved" | "rejected"; // ✅ workflow for purchase returns
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

    items: [ReturnItemSchema],
    reason: { type: String },

    // Financials
    refundAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Business Context
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" }, // ✅ purchase return link
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Workflow
    restock: { type: Boolean, default: true }, // ✅ control inventory adjustment
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Return || model<IReturn>("Return", ReturnSchema);
