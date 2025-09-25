import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  price: number;
  durationInDays: number; // e.g., 30 for 1 month
  features: string[];     // dynamic list of enabled features
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true },
    features: [{ type: String, required: true }], // dynamic features
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Index by name for quick lookup
SubscriptionPlanSchema.index({ name: 1 }, { unique: true });

export const SubscriptionPlan =
  models.SubscriptionPlan ||
  model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);
