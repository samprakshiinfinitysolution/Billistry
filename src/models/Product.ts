// models/Product.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IProduct extends Document {
  business: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  barcode?: string;
  // category?: string;
  category?: mongoose.Types.ObjectId; // <-- reference to Category
  description?: string;
  purchasePrice?: number;
  sellingPrice: number;
  taxPercent?: number;   // GST %
  hsnCode?: string;      // HSN Code for GST
  openingStock?: number; // Initial stock
  currentStock?: number; // Track current stock
  lowStockAlert?: number; // Minimum threshold
  unit?: string;          // pcs, kg, liter etc.
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProduct>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, index: true },
    sku: { type: String, index: true },
    barcode: { type: String, index: true },
    // category: { type: String, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true }, // relation
    description: { type: String },
    purchasePrice: { type: Number },
    sellingPrice: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 }, // GST %
    hsnCode: { type: String, index: true },   // HSN code
    openingStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 0 }, // Notify when stock ≤ this
    unit: { type: String, default: "pcs" },     // Default: pieces
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// For fast searching
ProductSchema.index({ business: 1, sku: 1 }, { unique: false });
ProductSchema.index({ business: 1, hsnCode: 1 });

export default models.Product || model<IProduct>("Product", ProductSchema);
