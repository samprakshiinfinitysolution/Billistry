// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     unit: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     purchasePrice: { type: Number, required: true },
//     salePrice: { type: Number, required: true },

//     lowStockAlert: { type: Number, required: true },
//   },
//   { timestamps: true }
// );

// export const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);







// import mongoose, { Document, Schema } from "mongoose";

// export interface IItem extends Document {
//   name: string;
//   photo?: string;
//   unit: string;
//   purchasePrice: number;
//   mrp: number;
//   openingStock: number;
//   lowStockAlert: number;
//   hsnCode?: string;
//   gstRate?: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const itemSchema = new Schema<IItem>(
//   {
//     name: { type: String, required: true },
//     photo: { type: String },
//     unit: { type: String, required: true },
//     purchasePrice: { type: Number, required: true },
//     mrp: { type: Number, required: true },
//     openingStock: { type: Number, required: true },
//     lowStockAlert: { type: Number, required: true },
//     hsnCode: { type: String },
//     gstRate: { type: Number },
//   },
//   { timestamps: true }
// );

// export const Item = mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);
