import Party, { IParty } from "@/models/Party";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";
import { Transaction } from "@/models/transactionModel";

// GET all parties (optional filter by type)
export const getParties = async (
  user: UserPayload,
  type?: "Customer" | "Supplier"
): Promise<IParty[]> => {
  const businessId = new mongoose.Types.ObjectId(user.businessId);
  const matchStage: any = { business: businessId, isDeleted: false };
  if (type) {
    matchStage.partyType = type;
  }

  const parties = await Party.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "transactions",
        let: { partyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$partyId", "$$partyId"] },
                  { $eq: ["$business", businessId] },
                ],
              },
            },
          },
        ],
        as: "transactions",
      },
    },
    {
      $addFields: {
        balance: {
          $reduce: {
            input: "$transactions",
            initialValue: "$openingBalance",
            in: {
              $add: [
                "$$value",
                {
                  $cond: {
                    if: { $eq: ["$$this.type", "You Got"] },
                    then: "$$this.amount",
                    else: { $multiply: ["$$this.amount", -1] },
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $project: { transactions: 0 } }, // Exclude transactions array from final output
  ]);

  return parties;
};

// GET single party
export const getPartyById = async (
  id: string,
  user: UserPayload
): Promise<{ party: IParty; transactions: any[] } | null> => {
  const party = await Party.findById(id).lean();
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }

  const transactions = await Transaction.find({ partyId: id, business: user.businessId })
    .sort({ date: -1 })
    .lean();

  return { party, transactions };
};

// CREATE new party
export const createParty = async (
  body: Partial<IParty>,
  user: UserPayload
): Promise<IParty> => {
  if (!body.partyName?.trim() || !body.mobileNumber?.trim()) {
    throw new Error("Party name and mobile number are required");
  }

  const existing = await Party.findOne({
    mobileNumber: body.mobileNumber.trim(),
    partyType: body.partyType || "Customer",
    business: user.businessId,
    isDeleted: false,
  });

  if (existing) {
    throw new Error(
      `A ${body.partyType || "Customer"} with this mobile number already exists`
    );
  }

  const party = await Party.create({
    partyName: body.partyName.trim(),
    mobileNumber: body.mobileNumber.trim(),
    email: body.email || "",
    gstin: body.gstin || "",
    panNumber: body.panNumber || "",
    partyType: body.partyType || "Customer",
    billingAddress: body.billingAddress || "",
    shippingAddress: body.shippingAddress || "",
    bankDetails: body.bankDetails || {
      accountNumber: "",
      ifsc: "",
      bankName: "",
      accountHolderName: "",
      upiId: "",
    },
    openingBalance: body.openingBalance || 0,
    balance: body.balance || 0,
    business: user.businessId,
    createdBy: user.userId,
    updatedBy: user.userId,
  });

  return party;
};

// UPDATE party
export const updateParty = async (
  id: string,
  updateData: Partial<IParty>,
  user: UserPayload
): Promise<IParty | null> => {
  const party = await Party.findById(id);
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }

  if ("business" in updateData) delete updateData.business;

  if ("partyName" in updateData && !updateData.partyName?.trim()) {
    throw new Error("Party name is required");
  }
  if ("mobileNumber" in updateData && !updateData.mobileNumber?.trim()) {
    throw new Error("Mobile number is required");
  }

  // Check duplicate mobile number if updated
  if (updateData.mobileNumber && updateData.mobileNumber !== party.mobileNumber) {
    const duplicate = await Party.findOne({
      mobileNumber: updateData.mobileNumber.trim(),
      partyType: updateData.partyType || party.partyType,
      business: user.businessId,
      isDeleted: false,
    });
    if (duplicate) {
      throw new Error(
        `A ${updateData.partyType || party.partyType} with this mobile number already exists`
      );
    }
  }

  Object.assign(party, updateData, { updatedBy: user.userId });
  await party.save();
  return party;
};

// DELETE (soft delete) party
export const deleteParty = async (
  id: string,
  user: UserPayload
): Promise<IParty | null> => {
  const party = await Party.findById(id);
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }

  party.isDeleted = true;
  party.deletedAt = new Date();
  party.updatedBy = user.userId;
  await party.save();
  return party;
};
