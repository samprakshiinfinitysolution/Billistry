import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICounter extends Document {
  business: Types.ObjectId;
<<<<<<< HEAD
  prefix: string;
=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
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
<<<<<<< HEAD
      // no longer unique alone — use compound unique index with prefix
    },
    prefix: {
      type: String,
      required: true,
      default: 'INV',
=======
      unique: true, // ✅ ensure one counter per business
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

<<<<<<< HEAD
// compound unique index so each (business, prefix) pair is unique
counterSchema.index({ business: 1, prefix: 1 }, { unique: true });

=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
export default mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);
