import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  price: number;
  durationInDays: number; // e.g., 30 for 1 month
  totalCount: number; // Number of billing cycles (e.g., 12 for a yearly plan billed monthly)
  razorpayPlanId?: string; // The ID of the plan on Razorpay's system
  features: string[];     // dynamic list of enabled features
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true },
    totalCount: { type: Number, required: true, default: 12 },
    razorpayPlanId: { type: String, trim: true, index: true, sparse: true },
    features: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "At least one feature is required.",
      },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const SubscriptionPlan =
  models.SubscriptionPlan ||
  model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);
