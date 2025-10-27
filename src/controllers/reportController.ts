// // src/controllers/reportController.ts
// import { connectDB } from "@/lib/db";
// import { Transaction } from "@/models/transactionModel";
// import { Customer } from "@/models/customerModel";
// import { Supplier } from "@/models/supplierModel";
// import mongoose from "mongoose";

// type PartyType = "Customer" | "Supplier";

// export interface PartyBalanceFilters {
//   startDate?: string;  // ISO
//   endDate?: string;    // ISO
//   partyType?: PartyType | "All";
//   partyId?: string;
// }

// // export const getPartyBalancesReport = async (filters: PartyBalanceFilters) => {
// //   await connectDB();

// //   const match: any = {};
// //   if (filters.partyType && filters.partyType !== "All") {
// //     match.partyType = filters.partyType;
// //   }
// //   if (filters.partyId) {
// //     match.partyId = new mongoose.Types.ObjectId(filters.partyId);
// //   }
// //   if (filters.startDate || filters.endDate) {
// //     match.date = {};
// //     if (filters.startDate) match.date.$gte = new Date(filters.startDate);
// //     if (filters.endDate) {
// //       // include the full end day
// //       const end = new Date(filters.endDate);
// //       end.setHours(23, 59, 59, 999);
// //       match.date.$lte = end;
// //     }
// //   }

// //   const grouped = await Transaction.aggregate([
// //     { $match: match },
// //     {
// //       $group: {
// //         _id: { partyId: "$partyId", partyType: "$partyType" },
// //         totalGot: {
// //           $sum: {
// //             $cond: [{ $eq: ["$type", "You Got"] }, "$amount", 0],
// //           },
// //         },
// //         totalGave: {
// //           $sum: {
// //             $cond: [{ $eq: ["$type", "You Gave"] }, "$amount", 0],
// //           },
// //         },
// //       },
// //     },
// //     {
// //       $project: {
// //         _id: 0,
// //         partyId: "$_id.partyId",
// //         partyType: "$_id.partyType",
// //         totalGot: 1,
// //         totalGave: 1,
// //         balance: { $subtract: ["$totalGot", "$totalGave"] },
// //       },
// //     },
// //     { $sort: { balance: -1 } },
// //   ]);

// //   // Fetch names/phones in bulk to avoid N+1
// //   const customerIds = grouped.filter(g => g.partyType === "Customer").map(g => g.partyId);
// //   const supplierIds = grouped.filter(g => g.partyType === "Supplier").map(g => g.partyId);

// //   const [customers, suppliers] = await Promise.all([
// //     customerIds.length
// //       ? Customer.find({ _id: { $in: customerIds } }).select("_id name phone").lean()
// //       : [],
// //     supplierIds.length
// //       ? Supplier.find({ _id: { $in: supplierIds } }).select("_id name phone").lean()
// //       : [],
// //   ]);

// //   const customerMap = new Map(customers.map(c => [String(c._id), c]));
// //   const supplierMap = new Map(suppliers.map(s => [String(s._id), s]));

// //   let youWillGet = 0;
// //   let youWillGive = 0;

// //   const details = grouped.map(g => {
// //     if (g.balance > 0) youWillGet += g.balance;
// //     else if (g.balance < 0) youWillGive += Math.abs(g.balance);

// //     const key = String(g.partyId);
// //     const info =
// //       g.partyType === "Customer" ? customerMap.get(key) : supplierMap.get(key);

// //     return {
// //       _id: key,
// //       partyType: g.partyType as PartyType,
// //       name: info?.name ?? "(unknown)",
// //       phone: info?.phone ?? "",
// //       totalGot: g.totalGot,
// //       totalGave: g.totalGave,
// //       balance: g.balance,
// //       status:
// //         g.balance > 0 ? "You Will Get" : g.balance < 0 ? "You Will Give" : "Settled",
// //     };
// //   });

// //   return {
// //     youWillGet,
// //     youWillGive,
// //     net: youWillGet - youWillGive,
// //     count: details.length,
// //     details,
// //   };
// // };




// export const getPartyBalancesReport = async (filters: PartyBalanceFilters) => {
//   await connectDB();

//   const txnMatch: any = {};
//   if (filters.partyType && filters.partyType !== "All") {
//     txnMatch.partyType = filters.partyType;
//   }
//   if (filters.partyId) {
//     txnMatch.partyId = new mongoose.Types.ObjectId(filters.partyId);
//   }
//   if (filters.startDate || filters.endDate) {
//     txnMatch.date = {};
//     if (filters.startDate) txnMatch.date.$gte = new Date(filters.startDate);
//     if (filters.endDate) {
//       const end = new Date(filters.endDate);
//       end.setHours(23, 59, 59, 999);
//       txnMatch.date.$lte = end;
//     }
//   }

//   // 1️⃣ Get all parties (depending on type)
//   let parties: { _id: mongoose.Types.ObjectId; name: string; phone?: string; partyType: PartyType }[] = [];
//   if (!filters.partyType || filters.partyType === "All") {
//     const [custs, sups] = await Promise.all([
//       Customer.find({}).select("_id name phone").lean(),
//       Supplier.find({}).select("_id name phone").lean(),
//     ]);
//     parties = [
//       ...custs.map(c => ({ ...c, partyType: "Customer" as PartyType })),
//       ...sups.map(s => ({ ...s, partyType: "Supplier" as PartyType })),
//     ];
//   } else if (filters.partyType === "Customer") {
//     const custs = await Customer.find({}).select("_id name phone").lean();
//     parties = custs.map(c => ({ ...c, partyType: "Customer" as PartyType }));
//   } else if (filters.partyType === "Supplier") {
//     const sups = await Supplier.find({}).select("_id name phone").lean();
//     parties = sups.map(s => ({ ...s, partyType: "Supplier" as PartyType }));
//   }

//   // 2️⃣ Aggregate transactions
//   const grouped = await Transaction.aggregate([
//     { $match: txnMatch },
//     {
//       $group: {
//         _id: { partyId: "$partyId", partyType: "$partyType" },
//         totalGot: {
//           $sum: { $cond: [{ $eq: ["$type", "You Got"] }, "$amount", 0] },
//         },
//         totalGave: {
//           $sum: { $cond: [{ $eq: ["$type", "You Gave"] }, "$amount", 0] },
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         partyId: "$_id.partyId",
//         partyType: "$_id.partyType",
//         totalGot: 1,
//         totalGave: 1,
//         balance: { $subtract: ["$totalGot", "$totalGave"] },
//       },
//     },
//   ]);

//   const txnMap = new Map(
//     grouped.map(g => [
//       `${g.partyType}-${g.partyId}`,
//       {
//         totalGot: g.totalGot,
//         totalGave: g.totalGave,
//         balance: g.balance,
//       },
//     ])
//   );

//   // 3️⃣ Merge parties with transaction data (or zeros)
//   let youWillGet = 0;
//   let youWillGive = 0;

//   const details = parties.map(p => {
//     const key = `${p.partyType}-${p._id}`;
//     const txn = txnMap.get(key) || { totalGot: 0, totalGave: 0, balance: 0 };

//     if (txn.balance > 0) youWillGet += txn.balance;
//     else if (txn.balance < 0) youWillGive += Math.abs(txn.balance);

//     return {
//       _id: String(p._id),
//       partyType: p.partyType,
//       name: p.name,
//       phone: p.phone || "",
//       totalGot: txn.totalGot,
//       totalGave: txn.totalGave,
//       balance: txn.balance,
//       status:
//         txn.balance > 0
//           ? "You Will Get"
//           : txn.balance < 0
//           ? "You Will Give"
//           : "Settled",
//     };
//   });

//   return {
//     youWillGet,
//     youWillGive,
//     net: youWillGet - youWillGive,
//     count: details.length,
//     details,
//   };
// };




// src/controllers/reportController.ts
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/transactionModel";
import mongoose from "mongoose";

type PartyType = "Customer" | "Supplier";

export interface PartyBalanceFilters {
  startDate?: string;   // ISO
  endDate?: string;     // ISO
  partyType?: PartyType | "All";
  partyId?: string;
  sortBy?: "balance" | "name";
  sortOrder?: 1 | -1;   // 1 = ASC, -1 = DESC
  page?: number;
  limit?: number;
}

export const getPartyBalancesReport = async (filters: PartyBalanceFilters) => {
  await connectDB();

  const {
    startDate,
    endDate,
    partyType,
    partyId,
    sortBy = "balance",
    sortOrder = -1,
    page = 1,
    limit = 50,
  } = filters;

  const txnMatch: any = {};
  if (partyType && partyType !== "All") txnMatch.partyType = partyType;
  if (partyId) txnMatch.partyId = new mongoose.Types.ObjectId(partyId);
  if (startDate || endDate) {
    txnMatch.date = {};
    if (startDate) txnMatch.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      txnMatch.date.$lte = end;
    }
  }

  // Build pipeline
  const pipeline: any[] = [
    // 1️⃣ Load parties (from both collections) as a union
    {
      $unionWith: {
        coll: "suppliers",
        pipeline: [
          { $project: { _id: 1, name: 1, phone: 1, partyType: { $literal: "Supplier" } } },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        phone: 1,
        partyType: {
          $cond: [
            { $ifNull: ["$partyType", false] },
            "$partyType",
            { $literal: "Customer" },
          ],
        },
      },
    },
  ];

  // 2️⃣ Optionally filter parties by type or ID
  const partyMatch: any = {};
  if (partyType && partyType !== "All") partyMatch.partyType = partyType;
  if (partyId) partyMatch._id = new mongoose.Types.ObjectId(partyId);
  if (Object.keys(partyMatch).length > 0) {
    pipeline.push({ $match: partyMatch });
  }

  // 3️⃣ Lookup transactions
  pipeline.push({
    $lookup: {
      from: "transactions",
      let: { pid: "$_id", ptype: "$partyType" },
      pipeline: [
        { $match: { $expr: { $and: [
          { $eq: ["$partyId", "$$pid"] },
          { $eq: ["$partyType", "$$ptype"] },
          ...(txnMatch.date ? [{ $gte: ["$date", txnMatch.date.$gte || new Date(0)] }] : []),
          ...(txnMatch.date?.$lte ? [{ $lte: ["$date", txnMatch.date.$lte] }] : [])
        ] } } },
        {
          $group: {
            _id: null,
            totalGot: { $sum: { $cond: [{ $eq: ["$type", "You Got"] }, "$amount", 0] } },
            totalGave: { $sum: { $cond: [{ $eq: ["$type", "You Gave"] }, "$amount", 0] } },
          },
        },
      ],
      as: "txnData",
    },
  });

  // 4️⃣ Merge transaction totals into each party
  pipeline.push({
    $addFields: {
      totalGot: { $ifNull: [{ $arrayElemAt: ["$txnData.totalGot", 0] }, 0] },
      totalGave: { $ifNull: [{ $arrayElemAt: ["$txnData.totalGave", 0] }, 0] },
    },
  });

  // 5️⃣ Calculate balance & status
  pipeline.push({
    $addFields: {
      balance: { $subtract: ["$totalGot", "$totalGave"] },
      status: {
        $switch: {
          branches: [
            { case: { $gt: [{ $subtract: ["$totalGot", "$totalGave"] }, 0] }, then: "You Will Get" },
            { case: { $lt: [{ $subtract: ["$totalGot", "$totalGave"] }, 0] }, then: "You Will Give" },
          ],
          default: "Settled",
        },
      },
    },
  });

  // 6️⃣ Sorting
  pipeline.push({ $sort: { [sortBy]: sortOrder } });

  // 7️⃣ Pagination
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // 8️⃣ Run aggregation
  const details = await mongoose.connection.collection("customers").aggregate(pipeline).toArray();

  // 9️⃣ Calculate totals in JS
  let youWillGet = 0;
  let youWillGive = 0;
  details.forEach(d => {
    if (d.balance > 0) youWillGet += d.balance;
    else if (d.balance < 0) youWillGive += Math.abs(d.balance);
  });

  return {
    youWillGet,
    youWillGive,
    net: youWillGet - youWillGive,
    count: details.length,
    details,
  };
};
