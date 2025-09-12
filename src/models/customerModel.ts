// import mongoose, { Schema, Document } from 'mongoose';

// export interface ICustomer extends Document {
//   name: string;
//   phone: string;
//   email?: string;
//   gst?: string;
//   address?: string;
//   accountHolderName?: string;
//   bankName?: string;
//   ifscCode?: string;
//   branch?: string;
// }

// const CustomerSchema = new Schema<ICustomer>(
//   {
//     name: {
//       type: String,
//       required: [true, 'Customer name is required'],
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
//     gst: {
//       type: String,
//       trim: true,
//     },
//     address: {
//       type: String,
//       trim: true,
//       default: '',
//     },
//       accountHolderName: {
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
//     timestamps: true, // adds createdAt and updatedAt
//   }
// );

// export const Customer =
//   mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);




// import mongoose, { Schema, Document, model, models } from 'mongoose';

// export interface ICustomer extends Document {
//   business: mongoose.Types.ObjectId; // Reference to Business
//   name: string;
//   phone: string;
//   email?: string;
//   gst?: string;
//   address?: string;
//   accountHolderName?: string;
//   bankName?: string;
//   ifscCode?: string;
//   branch?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const CustomerSchema = new Schema<ICustomer>(
//   {
//     business: {
//       type: Schema.Types.ObjectId,
//       ref: 'Business',
//       required: [true, 'Business is required'],
//       index: true,
//     },
//     name: {
//       type: String,
//       required: [true, 'Customer name is required'],
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
//     gst: {
//       type: String,
//       trim: true,
//     },
//     address: {
//       type: String,
//       trim: true,
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
//     timestamps: true, // adds createdAt and updatedAt
//   }
// );

// // Avoid recompiling model in dev
// export default models.Customer || model<ICustomer>('Customer', CustomerSchema);
