// import mongoose, { Schema, Document} from 'mongoose';

// export interface ISupplier extends Document {
//   name: string;
//   phone: string;
//   email?: string;
//   address?: string;
//   gst?: string;
//   accountHolderName?: string;
//   bankName?: string;
//   ifscCode?: string;
//   branch?: string;
// }

// const supplierSchema = new Schema<ISupplier>(
//   {
//     name: {
//       type: String,
//       required: [true, 'Supplier name is required'],
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: [true, 'Phone number is required'],
//       trim: true,
//     },
//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//     },
//     address: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     gst: {
//       type: String,
//       trim: true,
//       uppercase: true,
//       default: '',
//     },
//     accountHolderName: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     bankName: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     ifscCode: {
//       type: String,
//       trim: true,
//       uppercase: true,
//       default: '',
//     },
//     branch: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', supplierSchema);




// import mongoose, { Schema, Document, model, models } from 'mongoose';

// export interface ISupplier extends Document {
//   business: mongoose.Types.ObjectId; // Reference to Business
//   name: string;
//   phone: string;
//   email?: string;
//   address?: string;
//   gst?: string;
//   accountHolderName?: string;
//   bankName?: string;
//   ifscCode?: string;
//   branch?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const SupplierSchema = new Schema<ISupplier>(
//   {
//     business: {
//       type: Schema.Types.ObjectId,
//       ref: 'Business',
//       required: [true, 'Business is required'],
//       index: true,
//     },
//     name: {
//       type: String,
//       required: [true, 'Supplier name is required'],
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: [true, 'Phone number is required'],
//       trim: true,
//     },
//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//     },
//     address: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     gst: {
//       type: String,
//       trim: true,
//       uppercase: true,
//       default: '',
//     },
//     accountHolderName: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     bankName: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//     ifscCode: {
//       type: String,
//       trim: true,
//       uppercase: true,
//       default: '',
//     },
//     branch: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Avoid recompiling model on hot reload
// export default models.Supplier || model<ISupplier>('Supplier', SupplierSchema);
