// import mongoose, { Schema, Document, Types } from 'mongoose';

// export interface IPurchase extends Document {
//   invoiceNo: string;
//   billTo: Types.ObjectId;
//   items: {
//     item: Types.ObjectId;
//     quantity: number;
//     rate: number;
//     total: number;
//   }[];
//   invoiceAmount: number;
//   paymentStatus: 'unpaid' | 'cash' | 'online';
//   date: Date;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const purchaseSchema = new Schema<IPurchase>(
//   {
//     invoiceNo: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     billTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Supplier',
//       required: true,
//     },
//     items: [
//       {
//         item: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'Item',
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//         },
//         rate: {
//           type: Number,
//           required: true,
//         },
//         total: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     invoiceAmount: {
//       type: Number,
//       required: true,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ['unpaid', 'cash', 'online'],
//       default: 'unpaid',
//     },
//     date: {
//       type: Date,
//       required: true,
//       default: () => new Date(), // ✅ Exact date/time at creation
//     },
//   },
//   { timestamps: true }
// );

// export const Purchase =
//   mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', purchaseSchema);




import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  business: Types.ObjectId;   // 🆕 Business reference
  invoiceNo: string;
  billTo: Types.ObjectId;
  items: {
    item: Types.ObjectId;
    quantity: number;
    rate: number;
    total: number;
  }[];
  invoiceAmount: number;
  paymentStatus: 'unpaid' | 'cash' | 'online';
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',   // 🆕 Assuming you have a Business model
      required: true,
      index: true,
    },
    invoiceNo: {
      type: String,
      required: true,
      trim: true,
    },
    billTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    invoiceAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'cash', 'online'],
      default: 'unpaid',
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

// 🆕 Compound index to ensure invoiceNo is unique per business
purchaseSchema.index({ business: 1, invoiceNo: 1 }, { unique: true });

export const Purchase =
  mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', purchaseSchema);
