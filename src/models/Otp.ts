import mongoose, { Schema, Document } from "mongoose";

interface INotification extends Document {
  userId: string; // shopkeeper or company user
  title: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
