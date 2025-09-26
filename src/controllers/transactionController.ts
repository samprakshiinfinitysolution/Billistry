import { connectDB } from '@/lib/db';
import { Transaction } from '@/models/transactionModel';
import  Customer  from "@/models/Customer";
import  Supplier  from "@/models/Supplier";

export const createTransaction = async (data: any) => {
  await connectDB();
  return await Transaction.create(data);
};

export const getAllTransactions = async (filters: any) => {
  await connectDB();
  const query: any = {};

  if (filters.partyType) query.partyType = filters.partyType;
  if (filters.type) query.type = filters.type;
  if (filters.partyId) query.partyId = filters.partyId;
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  return await Transaction.find(query)
    .populate('partyId')
    .sort({ createdAt: -1 });
};

export const getPartyBalance = async (partyId: string, partyType: "Customer" | "Supplier") => {
  await connectDB();

  const transactions = await Transaction.find({ partyId, partyType });

  let totalGiven = 0;
  let totalGot = 0;

  transactions.forEach((txn) => {
    if (txn.type === "You Gave") totalGiven += txn.amount;
    if (txn.type === "You Got") totalGot += txn.amount;
  });

  const balance = totalGot - totalGiven;

  return {
    partyId,
    partyType,
    totalGiven,
    totalGot,
    balance,
    status: balance > 0 ? "You Will Get" : balance < 0 ? "You Will Give" : "Settled",
  };
};



export const getAllPartyBalance = async (type?: 'Supplier' | 'Customer') => {
  await connectDB();

  const matchStage: any = {};

  if (type) {
    matchStage['partyType'] = type;
  }

  const all = await Transaction.aggregate([
    {
      $match: matchStage, // filter by partyType if provided
    },
    {
      $group: {
        _id: {
          partyId: '$partyId',
          partyType: '$partyType',
        },
        balance: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'You Got'] },
              '$amount',
              { $multiply: ['$amount', -1] },
            ],
          },
        },
      },
    },
    {
      $match: {
        balance: { $ne: 0 },
      },
    },
  ]);

  let youWillGive = 0;
  let youWillGet = 0;

  const details = await Promise.all(
    all.map(async (entry) => {
      const { partyId, partyType } = entry._id;
      const balance = entry.balance;

      if (balance > 0) youWillGet += balance;
      else youWillGive += Math.abs(balance);

      let partyInfo = null;

      if (partyType === 'Customer') {
        partyInfo = await Customer.findById(partyId).select('name phone');
      } else if (partyType === 'Supplier') {
        partyInfo = await Supplier.findById(partyId).select('name phone');
      }

      return {
        _id: partyId,
        balance: Math.abs(balance),
        partyInfo,
      };
    })
  );

  return {
    youWillGive,
    youWillGet,
    details,
  };
};


export const deleteTransaction = async (id: string) => {
  await connectDB();
  return await Transaction.findByIdAndDelete(id);
};

export const updateTransaction = async (id: string, data: any) => {
  await connectDB();
  return await Transaction.findByIdAndUpdate(id, data, { new: true });
};

