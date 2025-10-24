import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IStaffPermissions {
  // 🔹 Action permissions
  manageProducts?: boolean;
  manageSales?: boolean;
  managePurchases?: boolean;
  manageExpenses?: boolean;

  // 🔹 Visibility permissions
  viewReports?: boolean;
  viewAmounts?: boolean;
  viewProfit?: boolean;
}

export interface IStaff extends Document {
  name: string;
  phone?: string;
  email?: string;
  role?: "manager" | "cashier" | "viewer"; // custom staff roles
  business: mongoose.Types.ObjectId; // each staff belongs to a business
  user?: mongoose.Types.ObjectId; // optional link to User if they need login
  isActive: boolean;
  permissions: IStaffPermissions;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ["manager", "cashier", "viewer"],
      default: "viewer",
    },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" }, // optional login
    isActive: { type: Boolean, default: true },

    // ✅ Staff permissions
    permissions: {
      manageProducts: { type: Boolean, default: false },
      manageSales: { type: Boolean, default: false },
      managePurchases: { type: Boolean, default: false },
      manageExpenses: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false },
      viewAmounts: { type: Boolean, default: false },
      viewProfit: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default models.Staff || model<IStaff>("Staff", StaffSchema);
