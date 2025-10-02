import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICounter extends Document {
  business: Types.ObjectId;
  seq: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const counterSchema = new Schema<ICounter>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true, // ✅ ensure one counter per business
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);
