import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICounter extends Document {
  business: Types.ObjectId;
  prefix: string;
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
      // no longer unique alone — use compound unique index with prefix
    },
    prefix: {
      type: String,
      required: true,
      default: 'INV',
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// compound unique index so each (business, prefix) pair is unique
counterSchema.index({ business: 1, prefix: 1 }, { unique: true });

export default mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);