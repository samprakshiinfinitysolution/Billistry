// import { connectDB } from "@/lib/db";
// import { Sale } from "@/models/Sale";
// import { Purchase } from "@/models/Purchase";
// import Expense from "@/models/Expense";
// import Customer from "@/models/Customer";
// import Supplier from "@/models/Supplier";
// import Product from "@/models/Product";
// import { UserPayload } from "@/lib/middleware/auth";

// type FilterType = "day" | "month" | "custom" | "all";

// /**
//  * Date range utility
//  */
// function getDateRange(filter: FilterType, startDate?: string, endDate?: string) {
//   const today = new Date();
//   let start: Date;
//   let end: Date;

//   if (filter === "day") {
//     start = new Date(today);
//     start.setHours(0, 0, 0, 0);
//     end = new Date(today);
//     end.setHours(23, 59, 59, 999);
//   } else if (filter === "month") {
//     start = new Date(today.getFullYear(), today.getMonth(), 1);
//     end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     end.setHours(23, 59, 59, 999);
//   } else if (filter === "custom" && startDate && endDate) {
//     start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);
//     end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
//   } else {
//     start = new Date(0); // epoch start
//     end = new Date();
//   }

//   return { start, end };
// }

// /**
//  * Trend chart aggregation
//  */
// async function getTrendData(
//   Model: any,
//   start: Date,
//   end: Date,
//   amountField: string,
//   filter: FilterType,
//   businessId: string
// ) {
//   const dateFormat = filter === "day" ? "%H:00" : "%Y-%m-%d";

//   const match: any = {
//     date: { $gte: start, $lte: end },
//     business: businessId, // ✅ restrict to business
//   };

//   const trend = await Model.aggregate([
//     { $match: match },
//     {
//       $group: {
//         _id: { $dateToString: { format: dateFormat, date: "$date" } },
//         total: { $sum: `$${amountField}` },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);

//   const results: { date: string; total: number }[] = [];

//   if (filter === "day") {
//     // hourly trend
//     for (let h = 0; h < 24; h++) {
//       const hourLabel = `${h.toString().padStart(2, "0")}:00`;
//       const found = trend.find((t) => t._id === hourLabel);
//       results.push({ date: hourLabel, total: found ? found.total : 0 });
//     }
//   } else {
//     // daily trend
//     let current = new Date(start);
//     while (current <= end) {
//       const dateStr = current.toISOString().split("T")[0]; // YYYY-MM-DD
//       const found = trend.find((t) => t._id === dateStr);
//       results.push({ date: dateStr, total: found ? found.total : 0 });
//       current.setDate(current.getDate() + 1);
//     }
//   }

//   return results;
// }

// /**
//  * Dashboard controller
//  */
// export async function getDashboardData(
//   filter: FilterType,
//   startDate: string | undefined,
//   endDate: string | undefined,
//   user: UserPayload
// ) {
//   if (!user?.businessId) {
//     throw new Error("Unauthorized: No business assigned");
//   }

//   await connectDB();

//   const { start, end } = getDateRange(filter, startDate, endDate);

//   const match: any = {
//     date: { $gte: start, $lte: end },
//     business: user.businessId, // ✅ always restrict by businessId
//   };

//   const businessFilter = { business: user.businessId };

//   const [
//     salesTotal,
//     purchaseTotal,
//     expenseTotal,
//     customers,
//     suppliers,
//     items,
//     salesTrend,
//     purchaseTrend,
//   ] = await Promise.all([
//     Sale.aggregate([
//       { $match: match },
//       { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//     ]),
//     Purchase.aggregate([
//       { $match: match },
//       { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//     ]),
//     Expense.aggregate([
//       { $match: match },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]),
//     Customer.countDocuments(businessFilter),
//     Supplier.countDocuments(businessFilter),
//     Product.countDocuments(businessFilter),
//     getTrendData(Sale, start, end, "invoiceAmount", filter, user.businessId),
//     getTrendData(Purchase, start, end, "invoiceAmount", filter, user.businessId),
//   ]);

//   return {
//     totals: {
//       sales: salesTotal[0]?.total || 0,
//       purchases: purchaseTotal[0]?.total || 0,
//       expenses: expenseTotal[0]?.total || 0,
//       customers,
//       suppliers,
//       items,
//     },
//     trends: {
//       sales: salesTrend,
//       purchases: purchaseTrend,
//     },
//   };
// }


import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Sale } from "@/models/Sale";
import { Purchase } from "@/models/Purchase";
import Expense from "@/models/Expense";
import Customer from "@/models/Customer";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import User from "@/models/User";
import Business from "@/models/Business";
import { UserPayload } from "@/lib/middleware/auth";

type FilterType = "day" | "month" | "custom" | "all";

/**
 * Date range utility
 */
function getDateRange(filter: FilterType, startDate?: string, endDate?: string) {
  const today = new Date();
  let start: Date;
  let end: Date;

  if (filter === "day") {
    start = new Date(today);
    start.setHours(0, 0, 0, 0);
    end = new Date(today);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "custom" && startDate && endDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(0); // epoch start
    end = new Date();
  }

  return { start, end };
}

/**
 * Trend chart aggregation
 */
async function getTrendData(
  Model: any,
  start: Date,
  end: Date,
  amountField: string,
  filter: FilterType,
  businessId?: string
) {
  const dateFormat = filter === "day" ? "%H:00" : "%Y-%m-%d";

  const match: any = {
    date: { $gte: start, $lte: end },
  };

  if (businessId) {
    match.business = new mongoose.Types.ObjectId(businessId);
  }

  const trend = await Model.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$date" } },
        total: { $sum: `$${amountField}` },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const results: { date: string; total: number }[] = [];

  if (filter === "day") {
    for (let h = 0; h < 24; h++) {
      const hourLabel = `${h.toString().padStart(2, "0")}:00`;
      const found = trend.find((t: { _id: string; total: number }) => t._id === hourLabel);
      results.push({ date: hourLabel, total: found ? found.total : 0 });
    }
  } else {
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const found = trend.find((t: { _id: string; total: number }) => t._id === dateStr);
      results.push({ date: dateStr, total: found ? found.total : 0 });
      current.setDate(current.getDate() + 1);
    }
  }

  return results;
}

/**
 * Dashboard controller
 */
export async function getDashboardData(
  filter: FilterType,
  startDate: string | undefined,
  endDate: string | undefined,
  user: UserPayload
) {
  // allow superadmin to fetch global aggregates (no businessId required)
  if (user.role !== "superadmin" && !user?.businessId) {
    throw new Error("Unauthorized: No business assigned");
  }

  await connectDB();
  const { start, end } = getDateRange(filter, startDate, endDate);

  // When superadmin: do not restrict by business (global aggregation)
  const match: any = { date: { $gte: start, $lte: end } };
  const businessFilter: any = {};

  if (user.role !== "superadmin") {
    match.business = new mongoose.Types.ObjectId(user.businessId);
    businessFilter.business = new mongoose.Types.ObjectId(user.businessId);
  }

  const [
    salesTotal,
    purchaseTotal,
    expenseTotal,
    customers,
    suppliers,
    items,
    salesTrend,
    purchaseTrend,
  ] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
    ]),
    Purchase.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Customer.countDocuments(businessFilter),
    Supplier.countDocuments(businessFilter),
    Product.countDocuments(businessFilter),
    getTrendData(Sale, start, end, "invoiceAmount", filter, user.role === 'superadmin' ? undefined : user.businessId),
    getTrendData(Purchase, start, end, "invoiceAmount", filter, user.role === 'superadmin' ? undefined : user.businessId),
  ]);

  // shopkeeper count: for superadmin show total shopkeeper users, for shopkeeper show 1 (or business owner count)
  let shopkeepers = 0;
  let staffCount = 0;
  let businessCount = 0;
  let activeSubscriptions = 0;
  if (user.role === "superadmin") {
    shopkeepers = await User.countDocuments({ role: 'shopkeeper', isDeleted: { $ne: true } });
    staffCount = await User.countDocuments({ role: 'staff', isDeleted: { $ne: true } });
    businessCount = await Business.countDocuments({ isDeleted: { $ne: true } });
    const now = new Date();
    activeSubscriptions = await Business.countDocuments({ subscriptionExpiry: { $gte: now }, isDeleted: { $ne: true } });
  } else {
    // for a regular shopkeeper user, count shopkeepers in this business (usually 1 owner)
    shopkeepers = await User.countDocuments({ business: new mongoose.Types.ObjectId(user.businessId), role: 'shopkeeper', isDeleted: { $ne: true } });
    staffCount = await User.countDocuments({ business: new mongoose.Types.ObjectId(user.businessId), role: 'staff', isDeleted: { $ne: true } });
    businessCount = 1;
    activeSubscriptions = await Business.countDocuments({ _id: user.businessId, subscriptionExpiry: { $gte: new Date() }, isDeleted: { $ne: true } });
  }

  return {
    totals: {
      sales: salesTotal[0]?.total || 0,
      purchases: purchaseTotal[0]?.total || 0,
      expenses: expenseTotal[0]?.total || 0,
      customers,
      suppliers,
      items,
      shopkeepers,
      staff: staffCount,
      businesses: businessCount,
      activeSubscriptions,
    },
    trends: {
      sales: salesTrend,
      purchases: purchaseTrend,
    },
  };
}
