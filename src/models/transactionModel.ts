// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema(
//   {
//     partyType: {
//       type: String,
//       enum: ["Customer", "Supplier"],
//       required: true,
//     },
//     partyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       refPath: "partyType",
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ["You Gave", "You Got"],
//       required: true,
//     },
//     description: String,
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// export const Transaction =
//   mongoose.models.Transaction ||
//   mongoose.model("Transaction", transactionSchema);




import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  business: Types.ObjectId; // Reference to Business
  partyType: "Customer" | "Supplier";
  partyId: Types.ObjectId;
  amount: number;
  type: "You Gave" | "You Got";
  description?: string;
  date: Date;
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
    partyType: {
      type: String,
      enum: ["Customer", "Supplier"],
      required: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "partyType", // Dynamically references Customer or Supplier
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
  },
  { timestamps: true }
);

// ✅ Index for faster queries per business + party
transactionSchema.index({ business: 1, partyId: 1, date: 1 });

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
