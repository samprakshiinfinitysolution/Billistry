// import mongoose, { Schema, Document } from "mongoose";

// export interface IExpense extends Document {
//   expenseNo: number;
//   category: string;
//   item?: string;
//   amount: number;
//   date: Date;
// }

// const expenseSchema = new Schema<IExpense>(
//   {
//     expenseNo: { type: Number, required: true, unique: true },
//     category: { type: String, required: true, trim: true },
//     item: { type: String, trim: true },
//     amount: { type: Number, required: true },
//     date: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// export const Expense =
//   mongoose.models.Expense || mongoose.model<IExpense>("Expense", expenseSchema);
