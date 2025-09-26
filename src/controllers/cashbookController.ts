// import { Cashbook } from "@/models/cashbookModel";
// import { connectDB } from "@/lib/db";

// export const addCashbookEntry = async (data: {
//   type: "IN" | "OUT";
//   amount: number;
//   mode: "cash" | "online";
//   description?: string;
// }) => {
//   await connectDB();

//   if (!data.type || !data.amount || !data.mode) {
//     throw new Error("type, amount, and mode are required");
//   }

//   return await Cashbook.create(data);
// };

// export const getCashbookEntries = async () => {
//   await connectDB();

//   const entries = await Cashbook.find().sort({ createdAt: -1 });

//   const calcBalance = (filter: any) =>
//     Cashbook.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: "$type",
//           total: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$type", "IN"] },
//                 "$amount",
//                 { $multiply: ["$amount", -1] }
//               ]
//             }
//           }
//         }
//       }
//     ]);

//   // Total
//   const totalCash = await calcBalance({ mode: "cash" });
//   const totalOnline = await calcBalance({ mode: "online" });
//   const cashInHand = totalCash.reduce((sum, t) => sum + t.total, 0);
//   const online = totalOnline.reduce((sum, t) => sum + t.total, 0);
//   const totalBalance = cashInHand + online;

//   // Today
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const todayCash = await calcBalance({
//     mode: "cash",
//     createdAt: { $gte: today }
//   });
//   const todayOnline = await calcBalance({
//     mode: "online",
//     createdAt: { $gte: today }
//   });
//   const todaysCashInHand = todayCash.reduce((sum, t) => sum + t.total, 0);
//   const todaysOnline = todayOnline.reduce((sum, t) => sum + t.total, 0);
//   const todaysBalance = todaysCashInHand + todaysOnline;

//   return {
//     totalBalance,
//     cashInHand,
//     online,
//     todaysBalance,
//     todaysCashInHand,
//     todaysOnline,
//     entries
//   };
// };


// // ✅ Update (works for any _id format)
// export const updateCashbookEntry = async (id: string, data: Partial<CashbookData>) => {
//   await connectDB();

//   const updatedEntry = await Cashbook.findOneAndUpdate(
//     { _id: id },
//     { $set: data },
//     { new: true, runValidators: true }
//   );

//   if (!updatedEntry) {
//     throw new Error("Entry not found");
//   }

//   return updatedEntry;
// };

// // ✅ Delete
// export const deleteCashbookEntry = async (id: string) => {
//   await connectDB();

//   const deletedEntry = await Cashbook.findOneAndDelete({ _id: id });

//   if (!deletedEntry) {
//     throw new Error("Entry not found");
//   }

//   return { message: "Entry deleted successfully" };
// };
// import { Cashbook, ICashbook } from "@/models/cashbookModel";
// import { connectDB } from "@/lib/db";
// import { UserPayload } from "@/lib/middleware/auth";

// // ✅ GET all entries (scoped to user’s business)
// export const getCashbookEntries = async (
//   user: UserPayload
// ): Promise<{
//   entries: ICashbook[];
//   totalBalance: number;
//   cashInHand: number;
//   online: number;
//   todaysBalance: number;
//   todaysCashInHand: number;
//   todaysOnline: number;
// }> => {
//   await connectDB();

//   const filter = { business: user.businessId, isDeleted: false };

//   const entries = await Cashbook.find(filter).sort({ createdAt: -1 });

//   const calcBalance = (extraFilter: any) =>
//     Cashbook.aggregate([
//       { $match: { ...filter, ...extraFilter } },
//       {
//         $group: {
//           _id: null,
//           total: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$type", "IN"] },
//                 "$amount",
//                 { $multiply: ["$amount", -1] },
//               ],
//             },
//           },
//         },
//       },
//     ]);

//   // Totals
//   const totalCash = await calcBalance({ mode: "cash" });
//   const totalOnline = await calcBalance({ mode: "online" });
//   const cashInHand = totalCash[0]?.total || 0;
//   const online = totalOnline[0]?.total || 0;
//   const totalBalance = cashInHand + online;

//   // Today
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const todayCash = await calcBalance({ mode: "cash", createdAt: { $gte: today } });
//   const todayOnline = await calcBalance({ mode: "online", createdAt: { $gte: today } });
//   const todaysCashInHand = todayCash[0]?.total || 0;
//   const todaysOnline = todayOnline[0]?.total || 0;
//   const todaysBalance = todaysCashInHand + todaysOnline;

//   return {
//     totalBalance,
//     cashInHand,
//     online,
//     todaysBalance,
//     todaysCashInHand,
//     todaysOnline,
//     entries,
//   };
// };

// // ✅ GET single entry by ID (scoped)
// export const getCashbookEntryById = async (
//   id: string,
//   user: UserPayload
// ): Promise<ICashbook | null> => {
//   await connectDB();

//   return Cashbook.findOne({
//     _id: id,
//     business: user.businessId,
//     isDeleted: false,
//   });
// };

// // ✅ CREATE new entry
// export const addCashbookEntry = async (
//   user: UserPayload,
//   data: {
//     type: "IN" | "OUT";
//     amount: number;
//     mode: "cash" | "online";
//     description?: string;
//   }
// ): Promise<ICashbook> => {
//   await connectDB();

//   if (!data.type || !data.amount || data.amount <= 0 || !data.mode) {
//     throw new Error("Valid type, positive amount, and mode are required");
//   }

//   return Cashbook.create({
//     ...data,
//     business: user.businessId,
//     createdBy: user.userId,
//     updatedBy: user.userId,
//   });
// };

// // ✅ UPDATE entry (scoped + atomic)
// export const updateCashbookEntry = async (
//   user: UserPayload,
//   id: string,
//   updateData: Partial<{
//     type: "IN" | "OUT";
//     amount: number;
//     mode: "cash" | "online";
//     description?: string;
//   }>
// ): Promise<ICashbook | null> => {
//   await connectDB();

//   if (updateData.amount !== undefined && updateData.amount <= 0) {
//     throw new Error("Amount must be greater than zero");
//   }

//   return Cashbook.findOneAndUpdate(
//     { _id: id, business: user.businessId, isDeleted: false },
//     { $set: { ...updateData, updatedBy: user.userId } },
//     { new: true, runValidators: true }
//   );
// };

// // ✅ SOFT DELETE entry (scoped + atomic)
// export const deleteCashbookEntry = async (
//   user: UserPayload,
//   id: string
// ): Promise<ICashbook | null> => {
//   await connectDB();

//   return Cashbook.findOneAndUpdate(
//     { _id: id, business: user.businessId, isDeleted: false },
//     { $set: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId } },
//     { new: true }
//   );
// };
// import { Cashbook, ICashbook } from "@/models/cashbookModel";
// import { connectDB } from "@/lib/db";
// import { UserPayload } from "@/lib/middleware/auth";

// // ✅ GET all entries + balances
// export const getCashbookEntries = async (
//   user: UserPayload
// ): Promise<{
//   entries: ICashbook[];
//   totalBalance: number;
//   cashInHand: number;
//   online: number;
//   todaysBalance: number;
//   todaysCashInHand: number;
//   todaysOnline: number;
// }> => {
//   await connectDB();

//   const baseFilter = { business: user.businessId, isDeleted: false };
//   const entries = await Cashbook.find(baseFilter).sort({ createdAt: -1 });

//   const todayStart = new Date();
//   todayStart.setHours(0, 0, 0, 0);

//   // Single aggregation for all balances
//   const totals = await Cashbook.aggregate([
//     { $match: baseFilter },
//     {
//       $project: {
//         amount: { $toDouble: "$amount" },
//         type: 1,
//         mode: 1,
//         isToday: { $gte: ["$createdAt", todayStart] },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         cashInHand: {
//           $sum: {
//             $cond: [
//               { $eq: ["$mode", "cash"] },
//               { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
//               0,
//             ],
//           },
//         },
//         online: {
//           $sum: {
//             $cond: [
//               { $eq: ["$mode", "online"] },
//               { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
//               0,
//             ],
//           },
//         },
//         todaysCashInHand: {
//           $sum: {
//             $cond: [
//               { $and: [{ $eq: ["$mode", "cash"] }, { $eq: ["$isToday", true] }] },
//               { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
//               0,
//             ],
//           },
//         },
//         todaysOnline: {
//           $sum: {
//             $cond: [
//               { $and: [{ $eq: ["$mode", "online"] }, { $eq: ["$isToday", true] }] },
//               { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
//               0,
//             ],
//           },
//         },
//       },
//     },
//   ]);

//   const totalData = totals[0] || {};
//   const cashInHand = totalData.cashInHand || 0;
//   const online = totalData.online || 0;
//   const totalBalance = cashInHand + online;

//   const todaysCashInHand = totalData.todaysCashInHand || 0;
//   const todaysOnline = totalData.todaysOnline || 0;
//   const todaysBalance = todaysCashInHand + todaysOnline;

//   return {
//     entries,
//     totalBalance,
//     cashInHand,
//     online,
//     todaysBalance,
//     todaysCashInHand,
//     todaysOnline,
//   };
// };

// // ✅ GET single entry
// export const getCashbookEntryById = async (
//   user: UserPayload,
//   id: string
// ): Promise<ICashbook | null> => {
//   await connectDB();
//   return Cashbook.findOne({ _id: id, business: user.businessId, isDeleted: false });
// };

// // ✅ CREATE entry
// export const addCashbookEntry = async (
//   user: UserPayload,
//   data: { type: "IN" | "OUT"; amount: number; mode: "cash" | "online"; description?: string }
// ): Promise<ICashbook> => {
//   await connectDB();
//   if (!data.type || !data.amount || data.amount <= 0 || !data.mode) {
//     throw new Error("Valid type, positive amount, and mode are required");
//   }
//   return Cashbook.create({
//     ...data,
//     business: user.businessId,
//     createdBy: user.userId,
//     updatedBy: user.userId,
//     isDeleted: false,
//   });
// };

// // ✅ UPDATE entry
// export const updateCashbookEntry = async (
//   user: UserPayload,
//   id: string,
//   updateData: Partial<{ type: "IN" | "OUT"; amount: number; mode: "cash" | "online"; description?: string }>
// ): Promise<ICashbook | null> => {
//   await connectDB();
//   if (updateData.amount !== undefined && updateData.amount <= 0) {
//     throw new Error("Amount must be greater than zero");
//   }
//   return Cashbook.findOneAndUpdate(
//     { _id: id, business: user.businessId, isDeleted: false },
//     { $set: { ...updateData, updatedBy: user.userId } },
//     { new: true, runValidators: true }
//   );
// };

// // ✅ SOFT DELETE entry
// export const deleteCashbookEntry = async (
//   user: UserPayload,
//   id: string
// ): Promise<ICashbook | null> => {
//   await connectDB();
//   return Cashbook.findOneAndUpdate(
//     { _id: id, business: user.businessId, isDeleted: false },
//     { $set: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId } },
//     { new: true }
//   );
// };


import { Cashbook, ICashbook } from "@/models/cashbookModel";
import { connectDB } from "@/lib/db";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";

// ✅ GET all entries + balances
export const getCashbookEntries = async (
  user: UserPayload
): Promise<{
  entries: ICashbook[];
  totalBalance: number;
  cashInHand: number;
  online: number;
  todaysBalance: number;
  todaysCashInHand: number;
  todaysOnline: number;
  today: Date;
  calculatedAt: Date;
}> => {
  await connectDB();

  const baseFilter = { 
    business: new mongoose.Types.ObjectId(user.businessId), 
    isDeleted: false 
  };

  const entries = await Cashbook.find(baseFilter).sort({ createdAt: -1 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Single aggregation for balances
  const totals = await Cashbook.aggregate([
    { $match: baseFilter },
    {
      $project: {
        amount: { $toDouble: "$amount" },
        type: 1,
        mode: 1,
        createdAt: 1,
        isToday: {
          $cond: [{ $gte: ["$createdAt", todayStart] }, true, false]
        },
      },
    },
    {
      $group: {
        _id: null,
        cashInHand: {
          $sum: {
            $cond: [
              { $eq: ["$mode", "cash"] },
              { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
              0,
            ],
          },
        },
        online: {
          $sum: {
            $cond: [
              { $eq: ["$mode", "online"] },
              { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
              0,
            ],
          },
        },
        todaysCashInHand: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$mode", "cash"] }, { $eq: ["$isToday", true] }] },
              { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
              0,
            ],
          },
        },
        todaysOnline: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$mode", "online"] }, { $eq: ["$isToday", true] }] },
              { $cond: [{ $eq: ["$type", "IN"] }, "$amount", { $multiply: ["$amount", -1] }] },
              0,
            ],
          },
        },
      },
    },
  ]);

  const totalData = totals[0] || {};
  const cashInHand = totalData.cashInHand || 0;
  const online = totalData.online || 0;
  const totalBalance = cashInHand + online;

  const todaysCashInHand = totalData.todaysCashInHand || 0;
  const todaysOnline = totalData.todaysOnline || 0;
  const todaysBalance = todaysCashInHand + todaysOnline;

  return {
    entries,
    totalBalance,
    cashInHand,
    online,
    todaysBalance,
    todaysCashInHand,
    todaysOnline,
    today: todayStart,
    calculatedAt: new Date(),
  };
};

// ✅ GET single entry
export const getCashbookEntryById = async (
  user: UserPayload,
  id: string
): Promise<ICashbook | null> => {
  await connectDB();
  return Cashbook.findOne({ 
    _id: id, 
    business: new mongoose.Types.ObjectId(user.businessId), 
    isDeleted: false 
  });
};

// ✅ CREATE entry
export const addCashbookEntry = async (
  user: UserPayload,
  data: { type: "IN" | "OUT"; amount: number; mode: "cash" | "online"; description?: string }
): Promise<ICashbook> => {
  await connectDB();
  if (!data.type || !data.amount || data.amount <= 0 || !data.mode) {
    throw new Error("Valid type, positive amount, and mode are required");
  }
  return Cashbook.create({
    ...data,
    business: new mongoose.Types.ObjectId(user.businessId),
    createdBy: user.userId,
    updatedBy: user.userId,
    isDeleted: false,
  });
};

// ✅ UPDATE entry
export const updateCashbookEntry = async (
  user: UserPayload,
  id: string,
  updateData: Partial<{ type: "IN" | "OUT"; amount: number; mode: "cash" | "online"; description?: string }>
): Promise<ICashbook | null> => {
  await connectDB();
  if (updateData.amount !== undefined && updateData.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  return Cashbook.findOneAndUpdate(
    { _id: id, business: new mongoose.Types.ObjectId(user.businessId), isDeleted: false },
    { $set: { ...updateData, updatedBy: user.userId } },
    { new: true, runValidators: true }
  );
};

// ✅ SOFT DELETE entry
export const deleteCashbookEntry = async (
  user: UserPayload,
  id: string
): Promise<ICashbook | null> => {
  await connectDB();
  return Cashbook.findOneAndUpdate(
    { _id: id, business: new mongoose.Types.ObjectId(user.businessId), isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId } },
    { new: true }
  );
};
