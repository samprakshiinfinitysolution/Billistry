// models/Notification.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export type Channel = "SMS" | "WHATSAPP" | "EMAIL";

export interface INotification extends Document {
  business: mongoose.Types.ObjectId;
  to: string; // phone or email
  channel: Channel;
  template: string;
  payload?: any;
  status: "PENDING" | "SENT" | "FAILED";
  error?: string;
  scheduledAt?: Date;
  sentAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    to: { type: String, required: true },
    channel: { type: String, enum: ["SMS", "WHATSAPP", "EMAIL"], required: true },
    template: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
    error: { type: String },
    scheduledAt: { type: Date },
    sentAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

NotificationSchema.index({ business: 1, status: 1, scheduledAt: 1 });

export default models.Notification || model<INotification>("Notification", NotificationSchema);
