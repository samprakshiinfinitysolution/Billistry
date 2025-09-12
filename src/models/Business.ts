import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  owner: mongoose.Types.ObjectId; // User._id of shopkeeper
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  currency: string;
  timezone: string;

  subscriptionPlan?: mongoose.Types.ObjectId; // Reference to Plan model
  subscriptionExpiry?: Date;

  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;

  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    gstNumber: { type: String, trim: true },

    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },

    subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionExpiry: { type: Date },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ✅ Each owner can only have ONE business
BusinessSchema.index({ owner: 1 }, { unique: true });

// ✅ Subscription lookups
BusinessSchema.index({ subscriptionPlan: 1 });

// ✅ Name + Owner for uniqueness (if in future you allow multiple shops per user)
BusinessSchema.index({ name: 1, owner: 1 }, { unique: true });

// ✅ Auto-set deletedAt when soft-deleting
BusinessSchema.pre<IBusiness>("save", function (next) {
  if (this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  if (!this.isDeleted) {
    this.deletedAt = null;
  }
  next();
});

export default models.Business || model<IBusiness>("Business", BusinessSchema);
