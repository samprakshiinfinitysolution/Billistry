



// src/controllers/reportController.ts
import { connectDB } from "@/lib/db";

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
