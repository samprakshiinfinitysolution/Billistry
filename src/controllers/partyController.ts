import Party, { IParty } from "@/models/Party";
import { UserPayload } from "@/lib/middleware/auth";

// GET all parties (optional filter by type)
export const getParties = async (
  user: UserPayload,
  type?: "Customer" | "Supplier"
): Promise<IParty[]> => {
  const query: any = { business: user.businessId, isDeleted: false };
  if (type) query.partyType = type;

  return Party.find(query).sort({ createdAt: -1 });
};

// GET single party
export const getPartyById = async (
  id: string,
  user: UserPayload
): Promise<IParty | null> => {
  const party = await Party.findById(id);
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }
  return party;
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
