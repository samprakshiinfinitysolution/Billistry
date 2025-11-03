import Party from "@/models/Party";
import {Transaction} from "@/models/transactionModel";
import { UserPayload } from "@/lib/middleware/auth";
import { ApiError } from "./apiError";

/**
 * Get ledger details for a specific party
 * @param partyId - The ID of the party
 * @param user - The authenticated user
 * @returns The party and their transactions
 */
export const getLedger = async (partyId: string, user: UserPayload) => {
  const party = await Party.findOne({ _id: partyId, business: user.businessId });

  if (!party) {
    throw new ApiError(404, "Party not found");
  }

  const transactions = await Transaction.find({ partyId: partyId, business: user.businessId }).sort({ date: -1 });

  return { party, transactions };
};