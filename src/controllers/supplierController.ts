

import Supplier, { ISupplier } from "@/models/Supplier";
import { UserPayload } from "@/lib/middleware/auth";

// ✅ GET all suppliers
export const getSuppliers = async (user: UserPayload): Promise<ISupplier[]> => {
  return Supplier.find({ business: user.businessId, isDeleted: false })
    .sort({ createdAt: -1 });
};

// ✅ GET single supplier by ID
export const getSupplierById = async (
  id: string,
  user: UserPayload
): Promise<ISupplier | null> => {
  const supplier = await Supplier.findById(id);
  if (!supplier || supplier.isDeleted || supplier.business.toString() !== user.businessId) {
    return null;
  }
  return supplier;
};

// ✅ CREATE new supplier
export const createSupplier = async (
  body: Partial<ISupplier>,
  user: UserPayload
): Promise<ISupplier> => {
  if (!body.name || !body.phone) {
    throw new Error("Supplier name and phone are required");
  }
  // Check for existing supplier with same phone in the business
  const existing = await Supplier.findOne({ phone: body.phone, business: user.businessId, isDeleted: false });
  if (existing) {
    throw new Error("Supplier with this phone already exists");
  }



  const supplier = await Supplier.create({
    name: body.name,
    phone: body.phone,
    email: body.email || "",
    address: body.address || "",
    gstnumber: body.gstnumber || "",
    accountholdername: body.accountholdername || "",
    accountnumber: body.accountnumber || "",
    ifsc: body.ifsc || "",
    branch: body.branch || "",
    upi: body.upi || "",
    business: user.businessId,   // ✅ correct
    createdBy: user.userId,      // ✅ who created
    updatedBy: user.userId,
  });

  return supplier;
};

// ✅ UPDATE supplier
export const updateSupplier = async (
  id: string,
  updateData: Partial<ISupplier>,
  user: UserPayload
): Promise<ISupplier | null> => {
  const supplier = await Supplier.findById(id);
  if (!supplier || supplier.isDeleted || supplier.business.toString() !== user.businessId) {
    return null;
  }

  // Prevent changing business directly
  if ("business" in updateData) delete updateData.business;

  // Ensure name and phone are not empty if being updated
  if ("name" in updateData && !updateData.name) {
    throw new Error("Supplier name is required");
  }
  if ("phone" in updateData && !updateData.phone) {
    throw new Error("Supplier phone is required");
  }

  Object.assign(supplier, updateData, { updatedBy: user.userId });
  await supplier.save();
  return supplier;
};

// ✅ DELETE (soft) supplier
export const deleteSupplier = async (
  id: string,
  user: UserPayload
): Promise<ISupplier | null> => {
  const supplier = await Supplier.findById(id);
  if (!supplier || supplier.isDeleted || supplier.business.toString() !== user.businessId) {
    return null;
  }

  supplier.isDeleted = true;
  supplier.deletedAt = new Date();
  supplier.updatedBy = user.userId;
  await supplier.save();
  return supplier;
};
