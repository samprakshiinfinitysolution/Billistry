import mongoose, { Schema, Document, model, models } from "mongoose";
import { ISubscriptionPlan } from "./SubscriptionPlan";

export type SubscriptionStatus = "Pending" | "Active" | "Cancelled" | "Expired";

export interface ISubscription extends Document {
  business: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId | ISubscriptionPlan;
  status: SubscriptionStatus;
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    status: { type: String, enum: ["Pending", "Active", "Cancelled", "Expired"], default: "Pending", index: true },
    razorpaySubscriptionId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ business: 1, endDate: -1 });

export default models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);
