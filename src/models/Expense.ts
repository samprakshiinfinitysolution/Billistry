import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IExpense extends Document {
  business: mongoose.Types.ObjectId;
  expenseNo: number; // added
  amount: number;
  category?: string;
  paidTo?: string;
  date: Date;
  attachmentUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    expenseNo: { type: Number, required: true }, // 👈 fixed, required so always saved
    amount: { type: Number, required: true },
    category: { type: String },
    paidTo: { type: String },
    date: { type: Date, default: () => new Date(), index: true },
    attachmentUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ business: 1, expenseNo: 1 }, { unique: true }); // 👈 unique per business
ExpenseSchema.index({ business: 1, date: -1 });

export default models.Expense || model<IExpense>("Expense", ExpenseSchema);
