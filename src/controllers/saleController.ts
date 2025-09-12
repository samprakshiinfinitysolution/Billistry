


// src/controllers/saleController.ts
import { Sale, ISale } from '@/models/Sale';
import Product from '@/models/Product';
import { connectDB } from '@/lib/db';
import { UserPayload } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

interface SaleInput {
  billTo: string;
  items: Array<{
    item: string;
    quantity: number;
    rate: number;
  }>;
  paymentStatus?: string;
  date?: string;
  notes?: string;
}

// ✅ Generate sequential invoice per business
const generateNextInvoiceNo = async (businessId: mongoose.Types.ObjectId): Promise<string> => {
  const lastSale = await Sale.findOne({ business: businessId })
    .sort({ createdAt: -1 })
    .select("invoiceNo");

  let nextNumber = 1;
  if (lastSale && lastSale.invoiceNo) {
    const numericPart = parseInt(lastSale.invoiceNo.replace("INV-", ""), 10);
    nextNumber = isNaN(numericPart) ? 1 : numericPart + 1;
  }

  return `INV-${nextNumber.toString().padStart(5, "0")}`;
};

// ✅ Format invoice for UI
const formatSale = (sale: ISale) => {
  return {
    ...sale.toObject(),
    invoiceNoFormatted: sale.invoiceNo,
  };
};

// --------------------- CREATE ---------------------
export const createSale = async (data: SaleInput, user: UserPayload) => {
  await connectDB();

  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const invoiceNo = await generateNextInvoiceNo(new mongoose.Types.ObjectId(user.businessId));

  let totalInvoiceAmount = 0;
  const processedItems: {
    item: string;
    quantity: number;
    rate: number;
    total: number;
  }[] = [];

  for (const item of data.items) {
    const dbItem = await Product.findOne({ _id: item.item, business: user.businessId });
    if (!dbItem) throw new Error(`Item not found or unauthorized: ${item.item}`);

    if (dbItem.openingStock < item.quantity) {
      throw new Error(`Insufficient stock for item ${dbItem.name}`);
    }

    // ✅ Decrease stock
    dbItem.openingStock -= item.quantity;
    await dbItem.save();

    const base = item.quantity * item.rate;
    const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
    const total = base + gstAmount;

    totalInvoiceAmount += total;

    processedItems.push({
      item: item.item,
      quantity: item.quantity,
      rate: item.rate,
      total: parseFloat(total.toFixed(2)),
    });
  }

  const sale = await Sale.create({
    business: user.businessId,   // ✅ correct
    createdBy: user.userId,      // ✅ correct
    invoiceNo,
    billTo: data.billTo,
    items: processedItems,
    invoiceAmount: parseFloat(totalInvoiceAmount.toFixed(2)),
    paymentStatus: data.paymentStatus || 'unpaid',
    date: data.date ? new Date(data.date) : new Date(),
    notes: data.notes || '',
    isDeleted: false,
  });

  return formatSale(sale);
};

// --------------------- READ ALL ---------------------
export const getAllSales = async (user: UserPayload) => {
  await connectDB();

  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const sales = await Sale.find({ business: user.businessId })
    .populate('billTo')
    .populate('items.item')
    .sort({ createdAt: -1 });

  return sales.map(formatSale);
};

// --------------------- READ ONE ---------------------
export const getSaleById = async (id: string, user: UserPayload) => {
  await connectDB();

  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const sale = await Sale.findById(id)
    .populate('billTo')
    .populate('items.item');

  if (!sale || sale.isDeleted || sale.business.toString() !== user.businessId) {
    throw new Error('Sale not found or unauthorized');
  }

  return formatSale(sale);
};


// --------------------- UPDATE ---------------------

export const updateSale = async (id: string, data: Partial<SaleInput>, user: UserPayload) => {
  await connectDB();

  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const sale = await Sale.findById(id);
  if (!sale || sale.isDeleted || sale.business.toString() !== user.businessId) {
    throw new Error('Sale not found or unauthorized');
  }

  // If items are updated, adjust product stock
  if (data.items) {
    // First, restore stock for old items
    for (const oldItem of sale.items) {
      const dbItem = await Product.findOne({ _id: oldItem.item, business: user.businessId });
      if (dbItem) {
        dbItem.openingStock += oldItem.quantity; // add back previous quantity
        await dbItem.save();
      }
    }

    // Then, process new items and reduce stock
    let totalInvoiceAmount = 0;
    const processedItems: {
      item: string;
      quantity: number;
      rate: number;
      total: number;
    }[] = [];

    for (const newItem of data.items) {
      const dbItem = await Product.findOne({ _id: newItem.item, business: user.businessId });
      if (!dbItem) throw new Error(`Item not found or unauthorized: ${newItem.item}`);

      if (dbItem.openingStock < newItem.quantity) {
        throw new Error(`Insufficient stock for item ${dbItem.name}`);
      }

      dbItem.openingStock -= newItem.quantity; // decrease stock
      await dbItem.save();

      const base = newItem.quantity * newItem.rate;
      const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
      const total = base + gstAmount;

      totalInvoiceAmount += total;

      processedItems.push({
        item: newItem.item,
        quantity: newItem.quantity,
        rate: newItem.rate,
        total: parseFloat(total.toFixed(2)),
      });
    }

    sale.items = processedItems;
    sale.invoiceAmount = parseFloat(totalInvoiceAmount.toFixed(2));
  }

  // Update other fields if provided
  if (data.billTo) sale.billTo = data.billTo;
  if (data.paymentStatus) sale.paymentStatus = data.paymentStatus;
  if (data.date) sale.date = new Date(data.date);
  if (data.notes) sale.notes = data.notes;

  sale.updatedBy = user.userId;

  await sale.save();

  return formatSale(sale);
};



// --------------------- DELETE (soft delete) ---------------------
// export const deleteSale = async (id: string, user: UserPayload) => {
//   await connectDB();

//   if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

//   const sale = await Sale.findById(id);
//   if (!sale || sale.business.toString() !== user.businessId) {
//     throw new Error('Sale not found or unauthorized');
//   }

//   // ❌ You had hard delete → `deleteOne()`
//   // ✅ Change to soft delete for consistency
 
//   await sale.deleteOne();

//   return { message: 'Sale deleted successfully' };
// };

export const deleteSale = async (id: string, user: UserPayload) => {
  await connectDB();

  if (!user?.userId || !user?.businessId) throw new Error("Unauthorized");

  // ❌ Role and permission check
  const canDelete =
    user.role === "superadmin" ||
    user.role === "shopkeeper" ||
    (user.role === "staff" && user.permissions?.manageSales);

  if (!canDelete) {
    throw new Error("Forbidden: You do not have permission to delete sales");
  }

  const sale = await Sale.findById(id);
  if (!sale || sale.business.toString() !== user.businessId) {
    throw new Error("Sale not found or unauthorized");
  }

  // Soft delete (optional: set isDeleted=true)
  // sale.isDeleted = true;
  // await sale.save();

  // Or hard delete (if you prefer)
  await sale.deleteOne();

  return { message: "Sale deleted successfully" };
};

// --------------------- SALE REPORT ---------------------
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
    if (!start || !end) throw new Error("Start and end dates required for custom range");
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

export const getSaleReport = async (
  user: UserPayload,
  filterQuery: {
    saleType?: string;
    payment?: string;
    start?: string;
    end?: string;
  }
) => {
  await connectDB();

  if ( !user?.businessId) throw new Error("Unauthorized");

  const { saleType, payment, start, end } = filterQuery;

  const filter: any = { business: user.businessId };

  if (saleType) {
    const { fromDate, toDate } = getDateRange(saleType, start, end);
    filter.date = { $gte: fromDate, $lte: toDate };
  }

  if (payment) filter.paymentStatus = payment;

  const sales = await Sale.find(filter)
    .populate("billTo")
    .populate("items.item")
    .sort({ createdAt: -1 })
    .lean();

  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.invoiceAmount || 0), 0);

  return {
    sales,
    totalSales: sales.length,
    totalAmount: totalSalesAmount,
  };
};
