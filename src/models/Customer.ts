// models/Customer.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICustomer extends Document {
  business: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number; // positive => customer owes business
  balance: number; // current balance
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, index: true },
    phone: { type: String,required:true, index: true },
    email: { type: String, index: true },
    address: { type: String },
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

CustomerSchema.index({ business: 1, phone: 1 }, { unique: true });

export default models.Customer || model<ICustomer>("Customer", CustomerSchema);
