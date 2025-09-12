







// import mongoose, { Schema, Document, model, models } from "mongoose";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";


// export type Role = "superadmin" | "shopkeeper" | "staff";

// // ✅ Define permission type
// export interface IPermissions {
//   // 🔹 Action permissions (CRUD-like)
//   manageBusiness?: boolean;
//   manageStaff?: boolean;
//   manageSubscription?: boolean;
//   manageProducts?: boolean;
//   manageSales?: boolean;
//   managePurchases?: boolean;
//   manageExpenses?: boolean;
//   viewReports?: boolean;

//   // 🔹 Visibility permissions (who can SEE financial/sensitive data)
//   viewAmounts?: boolean; // can see prices, totals, invoice amounts
//   viewProfit?: boolean; // can see cost vs sale difference
//   viewSensitiveReports?: boolean; // can see sensitive financial reports
// }

// export interface IUser extends Document {
//   name: string;
//   phone?: string;
//   email?: string;
//   passwordHash?: string;
//   role: Role;
//   business?: mongoose.Types.ObjectId;
//   isActive: boolean;
//   isDeleted?: boolean;
//   otp?: string;
//   otpExpiresAt?: Date;
//   permissions: IPermissions; // ✅ Added
//   comparePassword(candidate: string): Promise<boolean>;
//   setOtp(otp: string): void;
//   verifyOtp(candidateOtp: string): boolean;
//   clearOtp(): void;
// }

// const UserSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true, trim: true },
//     phone: { type: String, unique: true, sparse: true, trim: true },
//     email: {
//       type: String,
//       unique: true,
//       sparse: true,
//       lowercase: true,
//       trim: true,
//     },
//     passwordHash: { type: String },
//     role: {
//       type: String,
//       enum: ["superadmin", "shopkeeper", "staff"],
//       default: "shopkeeper",
//     },
//     business: { type: Schema.Types.ObjectId, ref: "Business" },
//     isActive: { type: Boolean, default: true },
//     isDeleted: { type: Boolean, default: false },
//     otp: { type: String },
//     otpExpiresAt: { type: Date },

//     // ✅ New permissions field
//     permissions: {
//       // 🔹 Action permissions
//       manageBusiness: { type: Boolean, default: false },
//       manageStaff: { type: Boolean, default: false },
//       manageSubscription: { type: Boolean, default: false },
//       manageProducts: { type: Boolean, default: false },
//       manageSales: { type: Boolean, default: false },
//       managePurchases: { type: Boolean, default: false },
//       manageExpenses: { type: Boolean, default: false },
//       viewReports: { type: Boolean, default: false },

//       // 🔹 Visibility permissions
//       viewAmounts: { type: Boolean, default: false }, // can see invoice/sale totals
//       viewProfit: { type: Boolean, default: false }, // can see profit/cost differences
//       viewSensitiveReports: { type: Boolean, default: false }, // can see financial reports
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Keep all your existing hooks and methods

// // UserSchema.index({ email: 1 }, { unique: true, sparse: true });
// // UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
// UserSchema.index({ role: 1 });

// UserSchema.pre("validate", function (next) {
//   if (
//     (!this.email || this.email.trim() === "") &&
//     (!this.phone || this.phone.trim() === "")
//   ) {
//     return next(new Error("At least one email or phone must be provided"));
//   }
//   next();
// });

// UserSchema.pre<IUser>("save", async function (next) {
//   if (this.isModified("passwordHash") && this.passwordHash) {
//     const salt = await bcrypt.genSalt(10);
//     this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
//   }
//   next();
// });

// UserSchema.methods.comparePassword = function (candidate: string) {
//   if (!this.passwordHash) return Promise.resolve(false);
//   return bcrypt.compare(candidate, this.passwordHash);
// };

// UserSchema.methods.setOtp = function (otp: string) {
//   this.otp = crypto.createHash("sha256").update(otp).digest("hex");
//   this.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
// };

// UserSchema.methods.verifyOtp = function (candidateOtp: string) {
//   if (!this.otp || !this.otpExpiresAt || this.otpExpiresAt < new Date())
//     return false;
//   const hashedCandidate = crypto
//     .createHash("sha256")
//     .update(candidateOtp)
//     .digest("hex");
//   return this.otp === hashedCandidate;
// };

// UserSchema.methods.clearOtp = function () {
//   this.otp = undefined;
//   this.otpExpiresAt = undefined;
// };

// export default models.User || model<IUser>("User", UserSchema);









import mongoose, { Schema, Document, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type Role = "superadmin" | "shopkeeper" | "staff";

// ✅ Nested permissions interface
export interface IPermissions {
  business?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  staff?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  products?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  sales?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  purchases?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  expenses?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  reports?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };

  subscription?: {
    manage?: boolean;
  };

  visibility?: {
    viewAmounts?: boolean;
    viewProfit?: boolean;
    viewSensitiveReports?: boolean;
  };
}

export interface IUser extends Document {
  name: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  role: Role;
  business?: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted?: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  permissions: IPermissions;
  comparePassword(candidate: string): Promise<boolean>;
  setOtp(otp: string): void;
  verifyOtp(candidateOtp: string): boolean;
  clearOtp(): void;
}

// ✅ Schema for nested permissions
const PermissionSchema = new Schema<IPermissions>(
  {
    business: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    staff: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    products: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    sales: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    purchases: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    expenses: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    reports: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    subscription: {
      manage: { type: Boolean, default: false },
    },
    visibility: {
      viewAmounts: { type: Boolean, default: false },
      viewProfit: { type: Boolean, default: false },
      viewSensitiveReports: { type: Boolean, default: false },
    },
  },
  { _id: false } // prevent creating _id for each subdoc
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["superadmin", "shopkeeper", "staff"],
      default: "shopkeeper",
    },
    business: { type: Schema.Types.ObjectId, ref: "Business" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },

    // ✅ Nested permissions field
    permissions: { type: PermissionSchema, default: {} },
  },
  { timestamps: true }
);

// ✅ Indexes
UserSchema.index({ role: 1 });

// ✅ Validation
UserSchema.pre("validate", function (next) {
  if (
    (!this.email || this.email.trim() === "") &&
    (!this.phone || this.phone.trim() === "")
  ) {
    return next(new Error("At least one email or phone must be provided"));
  }
  next();
});

// ✅ Password hashing
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("passwordHash") && this.passwordHash) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// ✅ Instance methods
UserSchema.methods.comparePassword = function (candidate: string) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.setOtp = function (otp: string) {
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
};

UserSchema.methods.verifyOtp = function (candidateOtp: string) {
  if (!this.otp || !this.otpExpiresAt || this.otpExpiresAt < new Date())
    return false;
  const hashedCandidate = crypto
    .createHash("sha256")
    .update(candidateOtp)
    .digest("hex");
  return this.otp === hashedCandidate;
};

UserSchema.methods.clearOtp = function () {
  this.otp = undefined;
  this.otpExpiresAt = undefined;
};

export default models.User || model<IUser>("User", UserSchema);
