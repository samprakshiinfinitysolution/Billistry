// src/controllers/purchaseController.ts
import { Purchase, IPurchase } from "@/models/Purchase";
import Product from "@/models/Product";
import Counter from "@/models/Counter";

//  new code
import "@/models/Party"; // Import Supplier model to register it


import { connectDB } from "@/lib/db";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";

interface PurchaseInput {
  billTo: string;
  items: Array<{
    item: string;
    quantity: number;
    rate: number;
  }>;
  paymentStatus?: "unpaid" | "cash" | "online";
  date?: string;
  notes?: string;
}

// ✅ Generate sequential invoice number for Purchase (per business)
const generateNextInvoiceNo = async (
  businessId: mongoose.Types.ObjectId
): Promise<string> => {
  const lastPurchase = await Purchase.findOne({ business: businessId })
    .sort({ createdAt: -1 })
    .select("invoiceNo");

  let nextNumber = 1;
  if (lastPurchase && lastPurchase.invoiceNo) {
    const numericPart = parseInt(
      lastPurchase.invoiceNo.replace("PUR-", ""),
      10
    );
    nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;
  }

  return `PUR-${nextNumber.toString().padStart(5, "0")}`;
};

// ✅ Format purchase for UI
const formatPurchase = (purchase: IPurchase) => {
  return {
    ...purchase.toObject(),
    invoiceNoFormatted: purchase.invoiceNo,
  };
};

// ✅ CREATE
export const createPurchase = async (
  data: PurchaseInput,
  user: UserPayload
) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error("Unauthorized");

  const invoiceNo = await generateNextInvoiceNo(
    new mongoose.Types.ObjectId(user.businessId)
  );

  let invoiceAmount = 0;
  const updatedItems: {
    item: string;
    quantity: number;
    rate: number;
    total: number;
  }[] = [];

  for (const item of data.items) {
    const dbItem = await Product.findOne({
      _id: item.item,
      business: user.businessId,
    });
    if (!dbItem)
      throw new Error(`Item not found or unauthorized: ${item.item}`);

    // ✅ Update stock
    dbItem.openingStock += item.quantity;
    await dbItem.save();

    const base = item.quantity * item.rate;
    const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
    const total = base + gstAmount;

    invoiceAmount += total;

    updatedItems.push({
      item: item.item,
      quantity: item.quantity,
      rate: item.rate,
      total: parseFloat(total.toFixed(2)),
    });
  }

  const purchase = await Purchase.create({
    business: user.businessId, // ✅ use businessId
    invoiceNo,
    billTo: data.billTo,
    items: updatedItems,
    invoiceAmount: parseFloat(invoiceAmount.toFixed(2)),
    paymentStatus: data.paymentStatus || "unpaid",
    date: data.date ? new Date(data.date) : new Date(),
    createdBy: user.userId, // ✅ keep actual user
    updatedBy: user.userId,
  });

  return formatPurchase(purchase);
};

// ✅ READ ALL
export const getAllPurchases = async (user: UserPayload) => {
  await connectDB();
  if (!user?.businessId) throw new Error("Unauthorized");

  const purchases = await Purchase.find({ business: user.businessId })
    .populate("billTo")
    .populate("items.item")
    .sort({ createdAt: -1 });

  return purchases.map(formatPurchase);
};

// ✅ READ ONE
export const getPurchaseById = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.businessId) throw new Error("Unauthorized");

  const purchase = await Purchase.findById(id)
    .populate("billTo")
    .populate("items.item");

  if (!purchase || purchase.business.toString() !== user.businessId) {
    throw new Error("Purchase not found or unauthorized");
  }

  return formatPurchase(purchase);
};

// ✅ UPDATE PURCHASE with stock adjustment
export const updatePurchase = async (
  id: string,
  data: Partial<PurchaseInput>,
  user: UserPayload
) => {
  await connectDB();
  if (!user?.businessId) throw new Error("Unauthorized");

  const purchase = await Purchase.findById(id);
  if (!purchase || purchase.business.toString() !== user.businessId) {
    throw new Error("Purchase not found or unauthorized");
  }

  // If items are updated, adjust stock
  if (data.items) {
    // 1️⃣ Restore stock for old items
    for (const oldItem of purchase.items) {
      const dbItem = await Product.findOne({
        _id: oldItem.item,
        business: user.businessId,
      });
      if (dbItem) {
        dbItem.openingStock -= oldItem.quantity; // subtract old purchase quantity
        await dbItem.save();
      }
    }

    // 2️⃣ Process new items and update stock
    const processedItems: {
      item: string;
      quantity: number;
      rate: number;
      total: number;
    }[] = [];
    let totalPurchaseAmount = 0;

    for (const newItem of data.items) {
      const dbItem = await Product.findOne({
        _id: newItem.item,
        business: user.businessId,
      });
      if (!dbItem)
        throw new Error(`Item not found or unauthorized: ${newItem.item}`);

      dbItem.openingStock += newItem.quantity; // add new purchase quantity
      await dbItem.save();

      const total = newItem.quantity * newItem.rate;
      totalPurchaseAmount += total;

      processedItems.push({
        item: newItem.item,
        quantity: newItem.quantity,
        rate: newItem.rate,
        total: parseFloat(total.toFixed(2)),
      });
    }

    purchase.items = processedItems;
    purchase.totalAmount = parseFloat(totalPurchaseAmount.toFixed(2));
  }

  // 3️⃣ Update other fields if provided
  if (data.billTo) purchase.supplier = data.billTo;
  // if (data.billTo) purchase.billTo = data.billTo;
  if (data.paymentStatus) purchase.paymentStatus = data.paymentStatus;
  if (data.date) purchase.date = new Date(data.date);
  if (data.notes) purchase.notes = data.notes;

  purchase.updatedBy = user.userId;

  await purchase.save();

  return formatPurchase(purchase);
};

// ✅ DELETE purchase with role & permission check
export const deletePurchase = async (id: string, user: UserPayload) => {
  await connectDB();

  if (!user?.businessId || !user?.userId) throw new Error("Unauthorized");

  const canDelete =
    user.role === "superadmin" ||
    user.role === "shopkeeper" ||
    (user.role === "staff" && user.permissions?.purchases?.delete);

  if (!canDelete) {
    throw new Error(
      "Forbidden: You do not have permission to delete purchases"
    );
  }

  const purchase = await Purchase.findById(id);
  if (!purchase || purchase.business.toString() !== user.businessId) {
    throw new Error("Purchase not found or unauthorized");
  }

  await purchase.deleteOne();

  return { message: "Purchase deleted successfully" };
};
// --------------------- PURCHASE REPORT ---------------------

// Helper to get date range
const getDateRange = (type: string, start?: string, end?: string) => {
  const today = new Date();
  let fromDate: Date, toDate: Date;

  switch (type) {
    case "today": {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);

      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      fromDate = start;
      toDate = end;
      break;
    }

    case "week": {
      const now = new Date(today);

      // get start of week (Sunday as default)
      const dayOfWeek = now.getDay(); // 0 = Sunday
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);

      // end of week
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      fromDate = start;
      toDate = end;
      break;
    }

    case "month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);

      fromDate = start;
      toDate = end;
      break;
    }

    case "custom": {
      if (!start || !end)
        throw new Error("Start and end dates required for custom range");
      fromDate = new Date(start);
      toDate = new Date(end);
      toDate.setHours(23, 59, 59, 999);
      break;
    }

    default:
      throw new Error("Invalid date filter");
  }
  return { fromDate, toDate };
};

// GET Purchase Report
export const getPurchaseReport = async (
  user: UserPayload,
  filterQuery: {
    purchaseType?: string;
    payment?: string;
    status?: string;
    start?: string;
    end?: string;
  }
) => {
  await connectDB();
  if (!user?.businessId) throw new Error("Unauthorized");

  const { purchaseType, payment, start, end } = filterQuery;
  const filter: any = { business: user.businessId };

  // ✅ Date filter
  if (purchaseType) {
    const { fromDate, toDate } = getDateRange(purchaseType, start, end);
    filter.date = { $gte: fromDate, $lte: toDate };
  }

  // ✅ Payment filter
  if (payment) filter.paymentStatus = payment;

  const purchases = await Purchase.find(filter)
    .populate("billTo")
    .populate("items.item")
    .sort({ createdAt: -1 })
    .lean();

  const totalPurchasesAmount = purchases.reduce(
    (sum, p) => sum + (p.invoiceAmount || 0),
    0
  );

  return {
    purchases,
    totalPurchases: purchases.length,
    totalAmount: totalPurchasesAmount,
  };
};
