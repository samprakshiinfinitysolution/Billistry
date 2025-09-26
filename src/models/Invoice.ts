// models/Invoice.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export type InvoiceType = "SALE" | "PURCHASE";

export interface IInvoiceItem {
  product: mongoose.Types.ObjectId;
  name?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxPercent?: number;
}

export interface IInvoice extends Document {
  business: mongoose.Types.ObjectId;
  type: InvoiceType;
  partner: mongoose.Types.ObjectId; // customer for SALE, supplier for PURCHASE
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "Paid" | "Partial" | "Unpaid";
  invoiceNumber?: string;
  date?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    type: { type: String, enum: ["SALE", "PURCHASE"], required: true },
    partner: { type: Schema.Types.ObjectId, required: true }, // Customer or Supplier
    items: { type: [InvoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["Paid", "Partial", "Unpaid"], default: "Unpaid" },
    invoiceNumber: { type: String, index: true },
    date: { type: Date, default: () => new Date() },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

InvoiceSchema.index({ business: 1, invoiceNumber: 1 }, { unique: false });

export default models.Invoice || model<IInvoice>("Invoice", InvoiceSchema);
