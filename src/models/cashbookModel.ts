// import mongoose, { Schema, Document } from "mongoose";

// export interface ICashbook extends Document {
//   type: "IN" | "OUT";
//   amount: number;
//   mode: "cash" | "online";
//   description?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const cashbookSchema = new Schema<ICashbook>(
//   {
//     type: { type: String, enum: ["IN", "OUT"], required: true },
//     amount: { type: Number, required: true },
//     mode: { type: String, enum: ["cash", "online"], required: true },
//     description: { type: String, default: "" },
//   },
//   { timestamps: true }
// );

// export const Cashbook =
//   mongoose.models.Cashbook ||
//   mongoose.model<ICashbook>("Cashbook", cashbookSchema);

// import mongoose, { Schema, Document, Types } from "mongoose";

// export interface ICashbook extends Document {
//   business: Types.ObjectId; // link to Business
//   type: "IN" | "OUT";
//   amount: number;
//   mode: "cash" | "online";
//   description?: string;
//   createdBy: Types.ObjectId; // track which user created it
//   isDeleted: boolean;
//   deletedAt?: Date;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const cashbookSchema = new Schema<ICashbook>(
//   {
//     business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
//     type: { type: String, enum: ["IN", "OUT"], required: true },
//     amount: { type: Number, required: true },
//     mode: { type: String, enum: ["cash", "online"], required: true },
//     description: { type: String, default: "" },
//     createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ new
//     isDeleted: { type: Boolean, default: false }, // ✅ new
//     deletedAt: { type: Date, default: null }, // ✅ new
//   },
//   { timestamps: true }
// );

// export const Cashbook =
//   mongoose.models.Cashbook ||
//   mongoose.model<ICashbook>("Cashbook", cashbookSchema);


import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICashbook extends Document {
  business: Types.ObjectId;       // Link to the business
  type: "IN" | "OUT";             // Cashflow type
  amount: number;                  // Amount
  mode: "cash" | "online";         // Payment mode
  description?: string;            // Optional description
  createdBy: Types.ObjectId;       // User who created it
  updatedBy?: Types.ObjectId;      // User who last updated it
  isDeleted: boolean;              // Soft delete flag
  deletedAt?: Date;                // Timestamp of deletion
  createdAt?: Date;
  updatedAt?: Date;
}

const cashbookSchema = new Schema<ICashbook>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    type: { type: String, enum: ["IN", "OUT"], required: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["cash", "online"], required: true },
    description: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },   // Track updates
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Ensure proper numeric values for amount (optional validation)
cashbookSchema.path("amount").validate(function(value: number) {
  return value > 0;
}, "Amount must be greater than zero");

export const Cashbook =
  mongoose.models.Cashbook ||
  mongoose.model<ICashbook>("Cashbook", cashbookSchema);
