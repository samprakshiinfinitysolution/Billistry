<<<<<<< HEAD
// import mongoose, { Schema, Document, model, models } from "mongoose";

// export interface IBusiness extends Document {
//   name: string;
//   owner: mongoose.Types.ObjectId; // User._id of shopkeeper
//   address?: string;
//   phone?: string;
//   email?: string;
//   gstNumber?: string;
//   currency: string;
//   timezone: string;

//   subscriptionPlan?: mongoose.Types.ObjectId; // Reference to Plan model
//   subscriptionExpiry?: Date;

//   isActive: boolean;
//   isDeleted: boolean;
//   deletedAt?: Date | null;

//   createdBy?: mongoose.Types.ObjectId;
//   updatedBy?: mongoose.Types.ObjectId;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const BusinessSchema = new Schema<IBusiness>(
//   {
//     name: { type: String, required: true, trim: true },

//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     address: { type: String, trim: true },
//     phone: { type: String, trim: true },
//     email: { type: String, lowercase: true, trim: true },
//     gstNumber: { type: String, trim: true },

//     currency: { type: String, default: "INR" },
//     timezone: { type: String, default: "Asia/Kolkata" },

//     subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
//     subscriptionExpiry: { type: Date },

//     isActive: { type: Boolean, default: true },
//     isDeleted: { type: Boolean, default: false },
//     deletedAt: { type: Date, default: null },

//     createdBy: { type: Schema.Types.ObjectId, ref: "User" },
//     updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// // ✅ Each owner can only have ONE business
// BusinessSchema.index({ owner: 1 }, { unique: true });

// // ✅ Subscription lookups
// BusinessSchema.index({ subscriptionPlan: 1 });

// // ✅ Name + Owner for uniqueness (if in future you allow multiple shops per user)
// BusinessSchema.index({ name: 1, owner: 1 }, { unique: true });

// // ✅ Auto-set deletedAt when soft-deleting
// BusinessSchema.pre<IBusiness>("save", function (next) {
//   if (this.isDeleted && !this.deletedAt) {
//     this.deletedAt = new Date();
//   }
//   if (!this.isDeleted) {
//     this.deletedAt = null;
//   }
//   next();
// });

// export default models.Business || model<IBusiness>("Business", BusinessSchema);




import mongoose, { Schema, Document, model, models } from "mongoose";

// --- INTERFACE DEFINITION (Matches the frontend state) ---
export interface IBusiness extends Document {
  // Core Fields from original schema
  name: string; // "businessName" from UI
  owner: mongoose.Types.ObjectId;
  address: string; // "billingAddress" from UI
  phone: string;
  email: string;
  gstNumber?: string;
  currency: string;
  timezone: string;
  
  // New Fields to match the UI
  city?: string;
  state?: string;
  pincode?: string;
  panNumber?: string;
  website?: string;
  businessTypes: string[];
  industryTypes: string[];
  registrationType?: string;
  enableEInvoicing: boolean;
  enableTds: boolean;
  enableTcs: boolean;
  
  // Fields to store URLs of uploaded files
  logoUrl?: string;
  signatureUrl?: string;

  // Subscription & System Fields from original schema
  subscriptionPlan?: mongoose.Types.ObjectId;
  subscriptionExpiry?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}


// --- SCHEMA DEFINITION ---
const BusinessSchema = new Schema<IBusiness>(
  {
    // --- Core Information ---
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },

    // --- Address Information ---
    address: { type: String, trim: true }, // Main address line
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },

    // --- Legal & Tax Information ---
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    registrationType: { type: String, trim: true },

    // --- Business Classification ---
    businessTypes: [{ type: String }], // Array of strings
    industryTypes: [{ type: String }], // Array of strings

    // --- Additional Details & Settings ---
    website: { type: String, trim: true },
    enableEInvoicing: { type: Boolean, default: false },
    enableTds: { type: Boolean, default: false },
    enableTcs: { type: Boolean, default: false },

    // --- File Storage ---
    logoUrl: { type: String },
    signatureUrl: { type: String },
    
    // --- System Defaults & Subscription ---
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
    subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionExpiry: { type: Date },

    // --- Status and Auditing ---
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// --- INDEXES (for database performance) ---
BusinessSchema.index({ owner: 1 }, { unique: true });
BusinessSchema.index({ name: 1, owner: 1 }); // Good for lookups
BusinessSchema.index({ email: 1 });


// --- MIDDLEWARE (for automatic logic) ---
BusinessSchema.pre<IBusiness>("save", function (next) {
  // Auto-set deletedAt when soft-deleting
  if (this.isModified("isDeleted")) {
    this.deletedAt = this.isDeleted ? new Date() : null;
=======
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  owner: mongoose.Types.ObjectId; // User._id of shopkeeper
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  currency: string;
  timezone: string;

  subscriptionPlan?: mongoose.Types.ObjectId; // Reference to Plan model
  subscriptionExpiry?: Date;

  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;

  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    gstNumber: { type: String, trim: true },

    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },

    subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionExpiry: { type: Date },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ✅ Each owner can only have ONE business
BusinessSchema.index({ owner: 1 }, { unique: true });

// ✅ Subscription lookups
BusinessSchema.index({ subscriptionPlan: 1 });

// ✅ Name + Owner for uniqueness (if in future you allow multiple shops per user)
BusinessSchema.index({ name: 1, owner: 1 }, { unique: true });

// ✅ Auto-set deletedAt when soft-deleting
BusinessSchema.pre<IBusiness>("save", function (next) {
  if (this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  if (!this.isDeleted) {
    this.deletedAt = null;
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
  }
  next();
});

<<<<<<< HEAD
export default models.Business || model<IBusiness>("Business", BusinessSchema);
=======
export default models.Business || model<IBusiness>("Business", BusinessSchema);
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
