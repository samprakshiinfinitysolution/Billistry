// models/ShopSettings.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IShopSettings extends Document {
  business: mongoose.Types.ObjectId;
  currency?: string;
  taxEnabled?: boolean;
  taxRate?: number;
  invoicePrefix?: string;
  receiptPrefix?: string;
  timezone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ShopSettingsSchema = new Schema<IShopSettings>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, unique: true },
    currency: { type: String, default: "INR" },
    taxEnabled: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 },
    invoicePrefix: { type: String, default: "INV" },
    receiptPrefix: { type: String, default: "RCPT" },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true }
);

export default models.ShopSettings || model<IShopSettings>("ShopSettings", ShopSettingsSchema);
