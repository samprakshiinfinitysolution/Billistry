import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICompanyRole extends Document {
  name: string; // e.g., Cashier, Manager, Accountant
  business: mongoose.Types.ObjectId; // role belongs to one business
  permissions: string[]; // list of features/actions
  createdBy?: mongoose.Types.ObjectId; // shopkeeper who created
  isDefault?: boolean; // default roles (Manager, Cashier, etc.)
}

const CompanyRoleSchema = new Schema<ICompanyRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate role names inside same business
CompanyRoleSchema.index({ business: 1, name: 1 }, { unique: true });

export const CompanyRole =
  models.CompanyRole || model<ICompanyRole>("CompanyRole", CompanyRoleSchema);
