// import { Expense } from "@/models/expenseModel";
// import { connectDB } from "@/lib/db";

// // 📌 Auto-increment logic
// async function getNextExpenseNo() {
//   const lastExpense = await Expense.findOne().sort({ expenseNo: -1 });
//   return lastExpense ? lastExpense.expenseNo + 1 : 1;
// }

// // ✅ Create Expense
// export const createExpense = async (data: any) => {
//   await connectDB();

//   if (!data.category) throw new Error("Category is required");
//   if (!data.amount || isNaN(data.amount)) throw new Error("Valid amount is required");

//   const expenseNo = await getNextExpenseNo();
//   const newExpense = await Expense.create({ ...data, expenseNo });

//   return newExpense;
// };

// // 📄 Get All Expenses
// export const getAllExpenses = async () => {
//   await connectDB();
//   return await Expense.find().sort({ createdAt: -1 });
// };

// // 🔍 Get One Expense
// export const getExpenseById = async (id: string) => {
//   await connectDB();
//   return await Expense.findById(id);
// };

// // ✏️ Update Expense
// export const updateExpense = async (id: string, data: any) => {
//   await connectDB();

//   if (data.category === "") throw new Error("Category cannot be empty");

//   const updated = await Expense.findByIdAndUpdate(id, data, { new: true });
//   return updated;
// };

// // 🗑️ Delete Expense
// export const deleteExpense = async (id: string) => {
//   await connectDB();
//   return await Expense.findByIdAndDelete(id);
// };
// import Expense, { IExpense } from "@/models/Expense";
// import { UserPayload } from "@/lib/middleware/auth";
// import mongoose from "mongoose";

// // ✅ Helper: Generate next sequential expense number
// export const generateExpenseNo = async (businessId: mongoose.Types.ObjectId) => {
//   const lastExpense = await Expense.findOne({ business: businessId })
//     .sort({ expenseNo: -1 })
//     .select("expenseNo");

//   return lastExpense ? lastExpense.expenseNo + 1 : 1; // keep numeric
// };

// // ✅ Helper: Format expense for UI (adds EXP-xxxxx)
// export const formatExpense = (expense: IExpense) => {
//   return {
//     ...expense.toObject(),
//     expenseNoFormatted: `EXP-${expense.expenseNo.toString().padStart(5, "0")}`,
//   };
// };

// // ✅ CREATE
// export const createExpense = async (body: Partial<IExpense>, user: UserPayload) => {
//   if (!body.title || !body.amount) {
//     throw new Error("Title and Amount are required");
//   }

//   const expenseNo = await generateExpenseNo(user.id);

//   const expense = await Expense.create({
//     ...body,
//     business: user.id,
//     createdBy: user.id,
//     expenseNo,
//     date: body.date || new Date(),
//   });

//   return formatExpense(expense);
// };

// // ✅ READ ALL
// export const getExpenses = async (user: UserPayload) => {
//   const expenses = await Expense.find({ business: user.id, isDeleted: false })
//     .sort({ date: -1 });

//   return expenses.map(formatExpense);
// };

// // ✅ READ ONE
// export const getExpenseById = async (id: string, user: UserPayload) => {
//   const expense = await Expense.findById(id);
//   if (!expense || expense.isDeleted || expense.business.toString() !== user.id) return null;

//   return formatExpense(expense);
// };

// // ✅ UPDATE
// export const updateExpense = async (id: string, body: Partial<IExpense>, user: UserPayload) => {
//   const expense = await Expense.findById(id);
//   if (!expense || expense.isDeleted || expense.business.toString() !== user.id) return null;

//   Object.assign(expense, body);
//   await expense.save();

//   return formatExpense(expense);
// };

// // ✅ DELETE (soft delete)
// export const deleteExpense = async (id: string, user: UserPayload) => {
//   const expense = await Expense.findById(id);
//   if (!expense || expense.business.toString() !== user.id) return null;

//   // expense.isDeleted = true;
//   // expense.deletedAt = new Date();
//   await expense.deleteOne();

//   return formatExpense(expense);
// };





import Expense, { IExpense } from "@/models/Expense";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";

// ✅ Helper: Generate next sequential expense number
export const generateExpenseNo = async (businessId: mongoose.Types.ObjectId) => {
  const lastExpense = await Expense.findOne({ business: businessId })
    .sort({ expenseNo: -1 })
    .select("expenseNo");

  return lastExpense ? lastExpense.expenseNo + 1 : 1; // keep numeric
};

// ✅ Helper: Format expense for UI (adds EXP-xxxxx)
export const formatExpense = (expense: IExpense) => {
  return {
    ...expense.toObject(),
    expenseNoFormatted: `EXP-${expense.expenseNo.toString().padStart(5, "0")}`,
  };
};

// ✅ CREATE
export const createExpense = async (body: Partial<IExpense>, user: UserPayload) => {
  if ( !body.amount) {
    throw new Error(" Amount are required");
  }

  const expenseNo = await generateExpenseNo(
    new mongoose.Types.ObjectId(user.businessId)
  );

  const expense = await Expense.create({
    ...body,
    business: user.businessId,   // ✅ correct field
    createdBy: user.userId,      // ✅ who created
    updatedBy: user.userId,
    expenseNo,
    date: body.date || new Date(),
  });

  return formatExpense(expense);
};

// ✅ READ ALL
export const getExpenses = async (user: UserPayload) => {
  const expenses = await Expense.find({
    business: user.businessId,
    isDeleted: false,
  }).sort({ date: -1 });

  return expenses.map(formatExpense);
};

// ✅ READ ONE
export const getExpenseById = async (id: string, user: UserPayload) => {
  const expense = await Expense.findById(id);
  if (!expense || expense.isDeleted || expense.business.toString() !== user.businessId) {
    return null;
  }

  return formatExpense(expense);
};

// ✅ UPDATE
export const updateExpense = async (
  id: string,
  body: Partial<IExpense>,
  user: UserPayload
) => {
  const expense = await Expense.findById(id);
  if (!expense || expense.isDeleted || expense.business.toString() !== user.businessId) {
    return null;
  }

  Object.assign(expense, body, { updatedBy: user.userId });
  await expense.save();

  return formatExpense(expense);
};

// ✅ DELETE (soft delete instead of hard delete)
export const deleteExpense = async (id: string, user: UserPayload) => {
  const expense = await Expense.findById(id);
  if (!expense || expense.business.toString() !== user.businessId) {
    return null;
  }

  expense.isDeleted = true;
  expense.deletedAt = new Date();
  expense.updatedBy = user.userId;
  await expense.save();

  return formatExpense(expense);
};
