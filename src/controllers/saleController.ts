


// import { Sale, ISale } from '@/models/Sale';
// import Product from '@/models/Product';
// import Counter from '@/models/Counter'; // ✅ counter model for invoice
// import { connectDB } from '@/lib/db';
// import { UserPayload } from '@/lib/middleware/auth';
// import mongoose from 'mongoose';

// interface SaleInput {
//   billTo: string;
//   items: Array<{
//     item: string;
//     quantity: number;
//     rate: number;
//   }>;
//   paymentStatus?: string;
//   date?: string;
//   notes?: string;
// }

// // --------------------- Invoice Generator (Race-safe) ---------------------
// const generateNextInvoiceNo = async (businessId: mongoose.Types.ObjectId): Promise<string> => {
//   const counter = await Counter.findOneAndUpdate(
//     { business: businessId },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   return `INV-${counter.seq.toString().padStart(5, "0")}`;
// };

// // --------------------- Format Sale ---------------------
// const formatSale = (sale: ISale) => ({
//   ...sale.toObject(),
//   invoiceNoFormatted: sale.invoiceNo,
// });

// // --------------------- CREATE SALE ---------------------
// export const createSale = async (data: SaleInput, user: UserPayload) => {
//   await connectDB();
//   if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

//   const invoiceNo = await generateNextInvoiceNo(new mongoose.Types.ObjectId(user.businessId));

//   let totalInvoiceAmount = 0;
//   const processedItems: { item: string; quantity: number; rate: number; total: number }[] = [];

//   for (const item of data.items) {
//     const dbItem = await Product.findOne({ _id: item.item, business: user.businessId });
//     if (!dbItem) throw new Error(`Item not found or unauthorized: ${item.item}`);
//     if (dbItem.openingStock < item.quantity) throw new Error(`Insufficient stock for ${dbItem.name}`);

//     dbItem.openingStock -= item.quantity;
//     await dbItem.save();

//     const base = item.quantity * item.rate;
//     const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
//     const total = base + gstAmount;
//     totalInvoiceAmount += total;

//     processedItems.push({ item: item.item, quantity: item.quantity, rate: item.rate, total: parseFloat(total.toFixed(2)) });
//   }

//   const sale = await Sale.create({
//     business: user.businessId,
//     createdBy: user.userId,
//     invoiceNo,
//     billTo: data.billTo,
//     items: processedItems,

    

//     invoiceAmount: parseFloat(totalInvoiceAmount.toFixed(2)),
//     paymentStatus: data.paymentStatus || 'unpaid',
//     date: data.date ? new Date(data.date) : new Date(),
//     notes: data.notes || '',
//     isDeleted: false,
//   });

//   return formatSale(sale);
// };

// // --------------------- READ ALL SALES ---------------------
// export const getAllSales = async (user: UserPayload) => {
//   await connectDB();
//   if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

//   const sales = await Sale.find({ business: user.businessId, isDeleted: false })
//     .populate('billTo')
//     .populate('items.item')
//     .sort({ createdAt: -1 });

//   return sales.map(formatSale);
// };

// // --------------------- READ ONE SALE ---------------------
// export const getSaleById = async (id: string, user: UserPayload) => {
//   await connectDB();
//   if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

//   const sale = await Sale.findOne({ _id: id, business: user.businessId, isDeleted: false })
//     .populate('billTo')
//     .populate('items.item');

//   if (!sale) throw new Error('Sale not found or unauthorized');
//   return formatSale(sale);
// };

// // --------------------- UPDATE SALE ---------------------
// export const updateSale = async (id: string, data: Partial<SaleInput>, user: UserPayload) => {
//   await connectDB();
//   if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

//   const sale = await Sale.findOne({ _id: id, business: user.businessId, isDeleted: false });
//   if (!sale) throw new Error('Sale not found or unauthorized');

//   // Restore stock for old items
//   if (data.items) {
//     for (const oldItem of sale.items) {
//       const dbItem = await Product.findOne({ _id: oldItem.item, business: user.businessId });
//       if (dbItem) {
//         dbItem.openingStock += oldItem.quantity;
//         await dbItem.save();
//       }
//     }

//     // Process new items
//     let totalInvoiceAmount = 0;
//     const processedItems: { item: string; quantity: number; rate: number; total: number }[] = [];

//     for (const newItem of data.items) {
//       const dbItem = await Product.findOne({ _id: newItem.item, business: user.businessId });
//       if (!dbItem) throw new Error(`Item not found or unauthorized: ${newItem.item}`);
//       if (dbItem.openingStock < newItem.quantity) throw new Error(`Insufficient stock for ${dbItem.name}`);

//       dbItem.openingStock -= newItem.quantity;
//       await dbItem.save();

//       const base = newItem.quantity * newItem.rate;
//       const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
//       const total = base + gstAmount;
//       totalInvoiceAmount += total;

//       processedItems.push({ item: newItem.item, quantity: newItem.quantity, rate: newItem.rate, total: parseFloat(total.toFixed(2)) });
//     }

//     sale.items = processedItems;
//     sale.invoiceAmount = parseFloat(totalInvoiceAmount.toFixed(2));
//   }

//   if (data.billTo) sale.billTo = data.billTo;
//   if (data.paymentStatus) sale.paymentStatus = data.paymentStatus;
//   if (data.date) sale.date = new Date(data.date);
//   if (data.notes) sale.notes = data.notes;

//   sale.updatedBy = user.userId;
//   await sale.save();

//   return formatSale(sale);
// };

// // --------------------- DELETE SALE (Soft Delete) ---------------------
// export const deleteSale = async (id: string, user: UserPayload) => {
//   await connectDB();
//   if (!user?.userId || !user?.businessId) throw new Error("Unauthorized");

//   const canDelete = user.role === "superadmin" || user.role === "shopkeeper" || (user.role === "staff" && user.permissions?.sales?.delete);
//   if (!canDelete) throw new Error("Forbidden: You do not have permission to delete sales");

//   const sale = await Sale.findOne({ _id: id, business: user.businessId });
//   if (!sale) throw new Error("Sale not found or unauthorized");

//   sale.isDeleted = true;
//   sale.updatedBy = user.userId;
//   await sale.save();

//   return { message: "Sale deleted successfully (soft delete)" };
// };

// // --------------------- SALE REPORT ---------------------
// const getDateRange = (type: string, start?: string, end?: string) => {
//   const today = new Date();
//   let fromDate: Date, toDate: Date;

//   switch (type) {
//     case "today":
//       fromDate = new Date(today.setHours(0, 0, 0, 0));
//       toDate = new Date(today.setHours(23, 59, 59, 999));
//       break;
//     case "week":
//       const dayOfWeek = today.getDay();
//       fromDate = new Date(today);
//       fromDate.setDate(today.getDate() - dayOfWeek);
//       fromDate.setHours(0, 0, 0, 0);
//       toDate = new Date(fromDate);
//       toDate.setDate(fromDate.getDate() + 6);
//       toDate.setHours(23, 59, 59, 999);
//       break;
//     case "month":
//       fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
//       toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       toDate.setHours(23, 59, 59, 999);
//       break;
//     case "custom":
//       if (!start || !end) throw new Error("Start and end dates required for custom range");
//       fromDate = new Date(start);
//       toDate = new Date(end);
//       toDate.setHours(23, 59, 59, 999);
//       break;
//     default:
//       throw new Error("Invalid date filter");
//   }

//   return { fromDate, toDate };
// };

// export const getSaleReport = async (
//   user: UserPayload,
//   filterQuery: { saleType?: string; payment?: string; start?: string; end?: string }
// ) => {
//   await connectDB();
//   if (!user?.businessId) throw new Error("Unauthorized");

//   const { saleType, payment, start, end } = filterQuery;
//   const filter: any = { business: user.businessId, isDeleted: false };

//   if (saleType) {
//     const { fromDate, toDate } = getDateRange(saleType, start, end);
//     filter.date = { $gte: fromDate, $lte: toDate };
//   }
//   if (payment) filter.paymentStatus = payment;

//   const sales = await Sale.find(filter).populate("billTo").populate("items.item").sort({ createdAt: -1 }).lean();
//   const totalSalesAmount = sales.reduce((sum, s) => sum + (s.invoiceAmount || 0), 0);

//   return { sales, totalSales: sales.length, totalAmount: totalSalesAmount };
// };



import { Sale, ISale } from '@/models/Sale';
import Product from '@/models/Product';
import Counter from '@/models/Counter';

//this is new file
import '@/models/Party'; // Import Customer model to register it

import { connectDB } from '@/lib/db';
import { UserPayload } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

interface SaleItemInput {
  item: string;
  quantity: number;
  rate: number;
}

interface SaleInput {
  billTo: string;
  items: SaleItemInput[];
  paymentStatus?: "unpaid" | "cash" | "online";
  date?: string;
  notes?: string;
  discountType?: "flat" | "percent";
  discountValue?: number;
  taxRate?: number;
}

// --------------------- Invoice Generator (Race-safe) ---------------------
const generateNextInvoiceNo = async (businessId: mongoose.Types.ObjectId): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { business: businessId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `INV-${counter.seq.toString().padStart(5, "0")}`;
};

// --------------------- Format Sale ---------------------
const formatSale = (sale: ISale) => ({
  ...sale.toObject(),
  invoiceNoFormatted: sale.invoiceNo,
});

// --------------------- CREATE SALE ---------------------
export const createSale = async (data: SaleInput, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const invoiceNo = await generateNextInvoiceNo(new mongoose.Types.ObjectId(user.businessId));

  let subtotal = 0;
  const processedItems: { item: string; quantity: number; rate: number; total: number }[] = [];

  for (const item of data.items) {
    const dbItem = await Product.findOne({ _id: item.item, business: user.businessId });
    if (!dbItem) throw new Error(`Item not found or unauthorized: ${item.item}`);
    if (dbItem.openingStock < item.quantity) throw new Error(`Insufficient stock for ${dbItem.name}`);

    dbItem.openingStock -= item.quantity;
    await dbItem.save();

    const base = item.quantity * item.rate;
    const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
    const total = base + gstAmount;

    subtotal += total;
    processedItems.push({ item: item.item, quantity: item.quantity, rate: item.rate, total: parseFloat(total.toFixed(2)) });
  }

  // ---------------- Discount Calculation ----------------
  let discountAmount = 0;
  if (data.discountType === "percent") {
    discountAmount = ((data.discountValue || 0) / 100) * subtotal;
  } else {
    discountAmount = data.discountValue || 0;
  }

  // ---------------- Tax Calculation ----------------
  const taxAmount = ((data.taxRate || 0) / 100) * (subtotal - discountAmount);

  const invoiceAmount = subtotal - discountAmount + taxAmount;

  const sale = await Sale.create({
    business: user.businessId,
    createdBy: user.userId,
    invoiceNo,
    billTo: data.billTo,
    items: processedItems,
    subtotal,
    discountType: data.discountType || "flat",
    discountValue: data.discountValue || 0,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    taxRate: data.taxRate || 0,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    invoiceAmount: parseFloat(invoiceAmount.toFixed(2)),
    paymentStatus: data.paymentStatus || "unpaid",
    date: data.date ? new Date(data.date) : new Date(),
    notes: data.notes || '',
    isDeleted: false,
  });

  return formatSale(sale);
};

// --------------------- READ ALL SALES ---------------------
export const getAllSales = async (user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const sales = await Sale.find({ business: user.businessId, isDeleted: false })
    .populate("billTo")
    .populate('items.item')
    .sort({ createdAt: -1 });

  return sales.map(formatSale);
};

// --------------------- READ ONE SALE ---------------------
export const getSaleById = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const sale = await Sale.findOne({ _id: id, business: user.businessId, isDeleted: false })
    .populate('billTo')
    .populate('items.item');

  if (!sale) throw new Error('Sale not found or unauthorized');
  return formatSale(sale);
};

// --------------------- UPDATE SALE ---------------------
export const updateSale = async (id: string, data: Partial<SaleInput>, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const sale = await Sale.findOne({ _id: id, business: user.businessId, isDeleted: false });
  if (!sale) throw new Error('Sale not found or unauthorized');

  // Restore stock for old items
  if (data.items) {
    for (const oldItem of sale.items) {
      const dbItem = await Product.findOne({ _id: oldItem.item, business: user.businessId });
      if (dbItem) {
        dbItem.openingStock += oldItem.quantity;
        await dbItem.save();
      }
    }

    // Process new items
    let subtotal = 0;
    const processedItems: { item: string; quantity: number; rate: number; total: number }[] = [];

    for (const newItem of data.items) {
      const dbItem = await Product.findOne({ _id: newItem.item, business: user.businessId });
      if (!dbItem) throw new Error(`Item not found or unauthorized: ${newItem.item}`);
      if (dbItem.openingStock < newItem.quantity) throw new Error(`Insufficient stock for ${dbItem.name}`);

      dbItem.openingStock -= newItem.quantity;
      await dbItem.save();

      const base = newItem.quantity * newItem.rate;
      const gstAmount = ((dbItem.gstRate || 0) / 100) * base;
      const total = base + gstAmount;
      subtotal += total;

      processedItems.push({ item: newItem.item, quantity: newItem.quantity, rate: newItem.rate, total: parseFloat(total.toFixed(2)) });
    }

    sale.items = processedItems;

    // Recalculate discount & tax
    let discountAmount = 0;
    if (data.discountType === "percent") {
      discountAmount = ((data.discountValue || 0) / 100) * subtotal;
    } else {
      discountAmount = data.discountValue || sale.discountValue || 0;
    }
    const taxAmount = ((data.taxRate || sale.taxRate || 0) / 100) * (subtotal - discountAmount);

    sale.subtotal = subtotal;
    sale.discountType = data.discountType || sale.discountType;
    sale.discountValue = data.discountValue || sale.discountValue;
    sale.discountAmount = parseFloat(discountAmount.toFixed(2));
    sale.taxRate = data.taxRate || sale.taxRate;
    sale.taxAmount = parseFloat(taxAmount.toFixed(2));
    sale.invoiceAmount = parseFloat((subtotal - discountAmount + taxAmount).toFixed(2));
  }

  if (data.billTo) sale.billTo = data.billTo;
  // if (data.billTo) sale.billTo = new mongoose.Types.ObjectId(data.billTo);
  if (data.paymentStatus) sale.paymentStatus = data.paymentStatus;
  if (data.date) sale.date = new Date(data.date);
  if (data.notes) sale.notes = data.notes;

  sale.updatedBy = user.userId;
  await sale.save();

  return formatSale(sale);
};

// --------------------- DELETE SALE (Soft Delete) ---------------------
export const deleteSale = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error("Unauthorized");

  const canDelete = user.role === "superadmin" || user.role === "shopkeeper" || (user.role === "staff" && user.permissions?.sales?.delete);
  if (!canDelete) throw new Error("Forbidden: You do not have permission to delete sales");

  const sale = await Sale.findOne({ _id: id, business: user.businessId });
  if (!sale) throw new Error("Sale not found or unauthorized");

  sale.isDeleted = true;
  sale.updatedBy = user.userId;
  await sale.save();

  return { message: "Sale deleted successfully (soft delete)" };
};

// --------------------- SALE REPORT ---------------------
const getDateRange = (type: string, start?: string, end?: string) => {
  const today = new Date();
  let fromDate: Date, toDate: Date;

  switch (type) {
    case "today":
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
      break;
    case "week":
      const dayOfWeek = today.getDay();
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - dayOfWeek);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      if (!start || !end) throw new Error("Start and end dates required for custom range");
      fromDate = new Date(start);
      toDate = new Date(end);
      toDate.setHours(23, 59, 59, 999);
      break;
    default:
      throw new Error("Invalid date filter");
  }

  return { fromDate, toDate };
};

export const getSaleReport = async (
  user: UserPayload,
  filterQuery: { saleType?: string; payment?: string; status?: string; start?: string; end?: string }
) => {
  await connectDB();
  if (!user?.businessId) throw new Error("Unauthorized");

  const { saleType, payment, status, start, end } = filterQuery;
  const filter: any = { business: user.businessId, isDeleted: false };

  if (saleType) {
    const { fromDate, toDate } = getDateRange(saleType, start, end);
    filter.date = { $gte: fromDate, $lte: toDate };
  }
  // Use 'status' if available, otherwise fall back to 'payment' for filtering paymentStatus
  const paymentFilter = status || payment;
  if (paymentFilter) filter.paymentStatus = paymentFilter;

  const sales = await Sale.find(filter).populate("billTo").populate("items.item").sort({ createdAt: -1 }).lean();
  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.invoiceAmount || 0), 0);

  return { sales, totalSales: sales.length, totalAmount: totalSalesAmount };
};
