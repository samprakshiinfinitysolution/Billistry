// src/controllers/saleReturnController.ts
import { connectDB } from "@/lib/db";
import ReturnModel, { IReturn } from "@/models/Return";
import {Sale} from "@/models/Sale";
import Product from "@/models/Product";

/**
 * ✅ Create Sale Return
 */
export const createSaleReturn = async (payload: Partial<IReturn>, user: any) => {
  await connectDB();

  const sale = await Sale.findById(payload.saleId);
  if (!sale) throw new Error("Sale not found");

  if (!payload.items || payload.items.length === 0) {
    throw new Error("At least one return item is required");
  }

  let subtotal = 0;
  let refundAmount = 0;

  const items = await Promise.all(
    (payload.items || []).map(async (item) => {
      if (!item.product) throw new Error("Product is required for return item");
      if (item.unitPrice === undefined || item.unitPrice === null) {
        throw new Error("Unit price is required for return item");
      }

      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const total = qty * price;

      subtotal += total;

      if (item.condition === "good") {
        refundAmount += total;

        // ✅ Increase stock for returned items
        await Product.findByIdAndUpdate(item.product, {
          $inc: { openingStock: qty },
        });
      }

      return {
        product: item.product,
        name: item.name || "",
        quantity: qty,
        unitPrice: price,
        total,
        condition: item.condition || "good",
      };
    })
  );

  const tax = Number(payload.tax) || 0;
  const grandTotal = refundAmount + tax;

  const returnDoc = await ReturnModel.create({
    type: "sales",
    saleId: payload.saleId,
    items,
    subtotal,
    refundAmount,
    tax,
    grandTotal,
    reason: payload.reason || "",
    createdBy: user._id,
    business: sale.business,
  });

  return returnDoc.populate("items.product", "name");
};

/**
 * ✅ Get All Sale Returns
 */
export const getSaleReturns = async (businessId: string) => {
  await connectDB();
  return ReturnModel.find({ business: businessId, type: "sales" })
    .populate("saleId", "invoiceNo")
    .populate("items.product", "name")
    .sort({ createdAt: -1 });
};

/**
 * ✅ Get One Sale Return
 */
export const getSaleReturnById = async (id: string, businessId: string) => {
  await connectDB();
  const doc = await ReturnModel.findOne({
    _id: id,
    business: businessId,
    type: "sales",
  })
    .populate("saleId", "invoiceNo")
    .populate("items.product", "name");

  if (!doc) throw new Error("Return not found");
  return doc;
};

/**
 * ✅ Update Sale Return
 */
export const updateSaleReturn = async (
  id: string,
  updates: Partial<IReturn>,
  businessId: string
) => {
  await connectDB();

  const existing = await ReturnModel.findOne({ _id: id, business: businessId, type: "sales" });
  if (!existing) throw new Error("Return not found");

  // Roll back stock changes first
  for (const item of existing.items) {
    if (item.condition === "good") {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { openingStock: -item.quantity },
      });
    }
  }

  let subtotal = 0;
  let refundAmount = 0;

  const items = await Promise.all(
    (updates.items || []).map(async (item) => {
      if (!item.product) throw new Error("Product is required for return item");
      if (item.unitPrice === undefined || item.unitPrice === null) {
        throw new Error("Unit price is required for return item");
      }

      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const total = qty * price;

      subtotal += total;
      if (item.condition === "good") {
        refundAmount += total;

        // ✅ Update stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { openingStock: qty },
        });
      }

      return {
        product: item.product,
        name: item.name || "",
        quantity: qty,
        unitPrice: price,
        total,
        condition: item.condition || "good",
      };
    })
  );

  const tax = Number(updates.tax) || 0;
  const grandTotal = refundAmount + tax;

  existing.items = items;
  existing.subtotal = subtotal;
  existing.refundAmount = refundAmount;
  existing.tax = tax;
  existing.grandTotal = grandTotal;
  existing.reason = updates.reason || existing.reason;

  await existing.save();

  return existing.populate("items.product", "name");
};

/**
 * ✅ Delete Sale Return
 */
export const deleteSaleReturn = async (id: string, businessId: string) => {
  await connectDB();
  const deleted = await ReturnModel.findOneAndDelete({
    _id: id,
    business: businessId,
    type: "sales",
  });
  if (!deleted) throw new Error("Return not found");

  // Roll back stock
  for (const item of deleted.items || []) {
    if (item.condition === "good") {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { openingStock: -item.quantity },
      });
    }
  }

  return { message: "Return deleted successfully" };
};
