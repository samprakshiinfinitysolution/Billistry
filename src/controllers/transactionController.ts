import mongoose from "mongoose";
import { Transaction, ITransaction } from "@/models/transactionModel";
import Party from "@/models/Party";
import { UserPayload } from "@/lib/middleware/auth";
import { ApiError } from "@/controllers/apiError";

/**
 * Recalculates and updates the balance for a given party.
 * @param partyId - The ID of the party to update.
 * @param businessId - The ID of the business.
 */
const updatePartyBalance = async (partyId: mongoose.Types.ObjectId, businessId: mongoose.Types.ObjectId) => {
  const party = await Party.findById(partyId);
  if (!party) return;

  const result = await Transaction.aggregate([
    { $match: { partyId, business: businessId } },
    {
      $group: {
        _id: "$partyId",
        totalGave: { $sum: { $cond: [{ $eq: ["$type", "You Gave"] }, "$amount", 0] } },
        totalGot: { $sum: { $cond: [{ $eq: ["$type", "You Got"] }, "$amount", 0] } },
      },
    },
  ]);

  const balance = (result[0]?.totalGot || 0) - (result[0]?.totalGave || 0);
  party.balance = (party.openingBalance || 0) + balance;
  await party.save();
};

interface TransactionCreationData {
  partyId: string;
  amount: number;
  type: "You Gave" | "You Got";
  description?: string;
  date?: Date | string;
}

interface TransactionFilters {
  partyId?: string;
  startDate?: string;
  endDate?: string;
}

export const getTransactions = async (user: UserPayload, filters: TransactionFilters) => {
  const query: any = {
    business: new mongoose.Types.ObjectId(user.businessId),
  };

  if (filters.partyId) {
    query.partyId = new mongoose.Types.ObjectId(filters.partyId);
  }

  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  const transactions = await Transaction.find(query)
    .populate("partyId", "partyName partyType")
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return transactions;
};

export const createTransaction = async (data: TransactionCreationData, user: UserPayload) => {
  const { partyId, amount, type } = data;
  if (!partyId || !amount || !type) {
    throw new ApiError(400, "partyId, amount, and type are required");
  }

  const party = await Party.findOne({ _id: partyId, business: user.businessId });
  if (!party) {
    throw new ApiError(404, "Party not found or does not belong to this business");
  }

  const transaction = await Transaction.create({
    ...data,
    business: user.businessId,
    createdBy: user.userId,
    updatedBy: user.userId,
    date: data.date || new Date(),
  });

  await updatePartyBalance(party._id, new mongoose.Types.ObjectId(user.businessId));

  return transaction;
};

interface TransactionUpdateData {
  amount?: number;
  type?: "You Gave" | "You Got";
  description?: string;
  date?: string | Date;
}

export const updateTransaction = async (id: string, data: TransactionUpdateData, user: UserPayload) => {
  const transaction = await Transaction.findById(id);
  if (!transaction || transaction.business.toString() !== user.businessId) {
    throw new ApiError(404, "Transaction not found");
  }

  Object.assign(transaction, data, { updatedBy: user.userId });
  await transaction.save();

  await updatePartyBalance(transaction.partyId, new mongoose.Types.ObjectId(user.businessId));

  return transaction;
};

export const deleteTransaction = async (id: string, user: UserPayload) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: id,
    business: user.businessId,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  await updatePartyBalance(transaction.partyId, new mongoose.Types.ObjectId(user.businessId));

  return transaction;
};
