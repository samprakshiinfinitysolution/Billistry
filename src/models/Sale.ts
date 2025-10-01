


// models/sale.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISale extends Document {
  business: Types.ObjectId;   // Business reference
  invoiceNo: string;
  billTo: Types.ObjectId;
  items: {
    item: Types.ObjectId;
    quantity: number;
    rate: number;
    total: number;
  }[];
  subtotal: number;

  // 🆕 Discount
  discountType?: "flat" | "percent";
  discountValue?: number;
  discountAmount?: number;


  // 🆕 Tax
  taxRate?: number;
  taxAmount?: number;



 // Final totals
  invoiceAmount: number;  // subtotal - discount + tax

  paymentStatus: "unpaid" | "cash" | "online";
  date: Date;
  notes?: string;
  isDeleted?: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const saleSchema = new Schema<ISale>(
  {
    business: {type: mongoose.Schema.Types.ObjectId,ref: "Business",required: true},
    invoiceNo: {type: String,required: true,trim: true},
    billTo: {type: mongoose.Schema.Types.ObjectId,ref: "Party",required: true},
    items: [
      {
        item: {type: mongoose.Schema.Types.ObjectId,ref: "Product",required: true},
        quantity: {type: Number,required: true},
        rate: {type: Number,required: true},
        total: {type: Number,required: true},
      },
    ],

    subtotal: { type: Number, required: true, default: 0 },

    // 🆕 Discount fields
    discountType: { type: String, enum: ["flat", "percent"], default: "flat" },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },

    // 🆕 Tax fields
    taxRate: { type: Number, default: 0 }, // e.g. 18 (%)
    taxAmount: { type: Number, default: 0 },

    // Final invoice
    invoiceAmount: { type: Number, required: true, default: 0 },
 
    paymentStatus: {type: String,enum: ["unpaid", "cash", "online"],default: "unpaid"},
    date: {type: Date,required: true, default: () => new Date(),}, // Exact date/time at creation,
    notes: {type: String,default: "",trim: true},
    isDeleted: {type: Boolean,default: false},
    createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
    updatedBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
  },
 { timestamps: true }

);

// 🆕 Compound index to ensure invoiceNo is unique per business
saleSchema.index({ business: 1, invoiceNo: 1 }, { unique: true });

export const Sale =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", saleSchema);
