import mongoose, { Schema, Document, model, models } from "mongoose";

export interface BankDetails {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  upiId: string;
}

export interface IParty extends Document {
  business: mongoose.Types.ObjectId;
  partyType: "Customer" | "Supplier";
  partyName: string;
  mobileNumber: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstin?: string;
  panNumber?: string;
  bankDetails: BankDetails | null;
  openingBalance: number;
  balance: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

const BankSchema = new Schema<BankDetails>(
  {
    accountNumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    upiId: { type: String, default: "" },
  },
  { _id: false }
);

const PartySchema = new Schema<IParty>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    partyType: { type: String, enum: ["Customer", "Supplier"], required: true, index: true },
    partyName: { type: String, required: true, index: true },
    mobileNumber: { type: String, required: true, index: true },
    email: { type: String, default: "" },
    billingAddress: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    gstin: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    bankDetails: { type: BankSchema, default: null },
    openingBalance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Unique mobile per business per type
PartySchema.index({ business: 1, mobileNumber: 1, partyType: 1 }, { unique: true });

export default models.Party || model<IParty>("Party", PartySchema);
