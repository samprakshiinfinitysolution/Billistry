


import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  business: Types.ObjectId; // Reference to Business
  partyId: Types.ObjectId;
  amount: number;
  type: "You Gave" | "You Got";
  description?: string;
  date: Date;
  createdBy: Types.ObjectId; // Reference to User
  updatedBy: Types.ObjectId; // Reference to User
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business", // 🔗 Link to Business model
      required: true,
      index: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Party", // 🔗 Link to the unified Party model
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["You Gave", "You Got"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Index for faster queries per business + party
transactionSchema.index({ business: 1, partyId: 1, date: 1 });

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
