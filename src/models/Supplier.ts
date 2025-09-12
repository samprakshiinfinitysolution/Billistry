// models/Supplier.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISupplier extends Document {
  business: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstnumber: string;
  accountholdername?: string;
  accountnumber?: string;
  ifsc?: string;
  branch?: string;
  upi?: string;
  openingBalance: number; // positive => supplier owed by business
  balance: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, index: true },
    phone: { type: String, index: true },
    email: { type: String, index: true },
    address: { type: String },
    gstnumber: { type: String, default: "" },
    accountholdername: { type: String, default: "" },
    accountnumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    branch: { type: String, default: "" },
    upi: { type: String, default: "" },
    openingBalance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SupplierSchema.index({ business: 1, phone: 1 });

export default models.Supplier || model<ISupplier>("Supplier", SupplierSchema);

