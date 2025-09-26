// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import {Sale} from "@/models/Sale";
// import {Purchase} from "@/models/Purchase";
// import {Expense} from "@/models/expenseModel";
// import {Customer} from "@/models/customerModel";
// import {Supplier} from "@/models/supplierModel";
// import {Item} from "@/models/itemModel";

// type FilterType = "day" | "month" | "custom" | "all";

// function getDateRange(filter: FilterType, startDate?: string, endDate?: string) {
//   const today = new Date();
//   let start: Date;
//   let end: Date;

//   if (filter === "day") {
//     start = new Date(today.setHours(0, 0, 0, 0));
//     end = new Date(today.setHours(23, 59, 59, 999));
//   } else if (filter === "month") {
//     start = new Date(today.getFullYear(), today.getMonth(), 1);
//     end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
//   } else if (filter === "custom" && startDate && endDate) {
//     start = new Date(startDate);
//     end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
//   } else {
//     // all time
//     start = new Date(0);
//     end = new Date();
//   }

//   return { start, end };
// }

// async function getLast7DaysData(Model: any) {
//   const arr: number[] = [];
//   for (let i = 6; i >= 0; i--) {
//     const dayStart = new Date();
//     dayStart.setDate(dayStart.getDate() - i);
//     dayStart.setHours(0, 0, 0, 0);

//     const dayEnd = new Date(dayStart);
//     dayEnd.setHours(23, 59, 59, 999);

//     const total = await Model.aggregate([
//       { $match: { date: { $gte: dayStart, $lte: dayEnd } } },
//       { $group: { _id: null, total: { $sum: "$invoiceAmount" } } }
//     ]);

//     arr.push(total[0]?.total || 0);
//   }
//   return arr;
// }

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const filter = (searchParams.get("filter") as FilterType) || "all";
//     const startDate = searchParams.get("startDate") || undefined;
//     const endDate = searchParams.get("endDate") || undefined;

//     const { start, end } = getDateRange(filter, startDate, endDate);

//     const [salesTotal, purchaseTotal, expenseTotal, customers, suppliers, items] = await Promise.all([
//       Sale.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } }
//       ]),
//       Purchase.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } }
//       ]),
//       Expense.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]),
//       Customer.countDocuments(),
//       Supplier.countDocuments(),
//       Item.countDocuments()
//     ]);

//     const salesTrend = await getLast7DaysData(Sale);
//     const purchaseTrend = await getLast7DaysData(Purchase);

//     return NextResponse.json({
//       totals: {
//         sales: salesTotal[0]?.total || 0,
//         purchases: purchaseTotal[0]?.total || 0,
//         expenses: expenseTotal[0]?.total || 0,
//         customers,
//         suppliers,
//         items
//       },
//       trends: {
//         sales: salesTrend,
//         purchases: purchaseTrend
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
//   }
// }







// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Sale } from "@/models/Sale";
// import { Purchase } from "@/models/Purchase";
// import { Expense } from "@/models/expenseModel";
// import { Customer } from "@/models/customerModel";
// import { Supplier } from "@/models/supplierModel";
// import { Item } from "@/models/itemModel";

// type FilterType = "day" | "month" | "custom" | "all";

// function getDateRange(filter: FilterType, startDate?: string, endDate?: string) {
//   const today = new Date();
  

//   let start: Date;
//   let end: Date;

//   if (filter === "day") {
//     start = new Date(today.setHours(0, 0, 0, 0));
//     end = new Date(today.setHours(23, 59, 59, 999));
//   } else if (filter === "month") {
//     start = new Date(today.getFullYear(), today.getMonth(), 1);
//     end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
//   } else if (filter === "custom" && startDate && endDate) {
//     start = new Date(startDate);
//     end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
//   } else {
//     start = new Date(0); // all-time
//     end = new Date();
//   }

//   return { start, end };
// }

// async function getTrendData(Model: any, start: Date, end: Date) {
//   const trend = await Model.aggregate([
//     { $match: { date: { $gte: start, $lte: end } } },
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//         total: { $sum: "$invoiceAmount" },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);

//   const days: { date: string; total: number }[] = [];
//   let current = new Date(start);

//   while (current <= end) {
//     const dateStr = current.toISOString().slice(0, 10);
//     const found = trend.find((t) => t._id === dateStr);
//     days.push({ date: dateStr, total: found ? found.total : 0 });

//     current.setDate(current.getDate() + 1);
//   }

//   return days;
// }

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const filter = (searchParams.get("filter") as FilterType) || "all";
//     const startDate = searchParams.get("start") || undefined;
//     const endDate = searchParams.get("end") || undefined;

//     const { start, end } = getDateRange(filter, startDate, endDate);

//     const [
//       salesTotal,
//       purchaseTotal,
//       expenseTotal,
//       customers,
//       suppliers,
//       items,
//       salesTrend,
//       purchaseTrend,
//     ] = await Promise.all([
//       Sale.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Purchase.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Expense.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//       ]),
//       Customer.countDocuments(),
//       Supplier.countDocuments(),
//       Item.countDocuments(),
//       getTrendData(Sale, start, end),
//       getTrendData(Purchase, start, end),
//     ]);

//     return NextResponse.json({
//       totals: {
//         sales: salesTotal[0]?.total || 0,
//         purchases: purchaseTotal[0]?.total || 0,
//         expenses: expenseTotal[0]?.total || 0,
//         customers,
//         suppliers,
//         items,
//       },
//       trends: {
//         sales: salesTrend,
//         purchases: purchaseTrend,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
//   }
// }





// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Sale } from "@/models/Sale";
// import { Purchase } from "@/models/Purchase";
// import { Expense } from "@/models/expenseModel";
// import { Customer } from "@/models/customerModel";
// import { Supplier } from "@/models/supplierModel";
// import { Item } from "@/models/itemModel";

// type FilterType = "day" | "month" | "custom" | "all";

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
//     // All time
//     start = new Date(0);
//     end = new Date();
//   }

//   return { start, end };
// }

// async function getTrendData(Model: any, start: Date, end: Date, amountField: string) {
//   const trend = await Model.aggregate([
//     { $match: { date: { $gte: start, $lte: end } } },
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//         total: { $sum: `$${amountField}` },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);

//   const days: { date: string; total: number }[] = [];
//   let current = new Date(start);

//   while (current <= end) {
//     const dateStr = current.toLocaleDateString("en-CA"); // Local YYYY-MM-DD
//     const found = trend.find((t) => t._id === dateStr);
//     days.push({ date: dateStr, total: found ? found.total : 0 });
//     current.setDate(current.getDate() + 1);
//   }

//   return days;
// }

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const filter = (searchParams.get("filter") as FilterType) || "all";
//     const startDate = searchParams.get("start") || undefined;
//     const endDate = searchParams.get("end") || undefined;

//     const { start, end } = getDateRange(filter, startDate, endDate);

//     const [
//       salesTotal,
//       purchaseTotal,
//       expenseTotal,
//       customers,
//       suppliers,
//       items,
//       salesTrend,
//       purchaseTrend,
//     ] = await Promise.all([
//       Sale.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Purchase.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Expense.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//       ]),
//       Customer.countDocuments(),
//       Supplier.countDocuments(),
//       Item.countDocuments(),
//       getTrendData(Sale, start, end, "invoiceAmount"),
//       getTrendData(Purchase, start, end, "invoiceAmount"),
//     ]);

//     return NextResponse.json({
//       totals: {
//         sales: salesTotal[0]?.total || 0,
//         purchases: purchaseTotal[0]?.total || 0,
//         expenses: expenseTotal[0]?.total || 0,
//         customers,
//         suppliers,
//         items,
//       },
//       trends: {
//         sales: salesTrend,
//         purchases: purchaseTrend,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to fetch dashboard data" },
//       { status: 500 }
//     );
//   }
// }





// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Sale } from "@/models/Sale";
// import { Purchase } from "@/models/Purchase";
// import  Expense  from "@/models/Expense";
// import  Customer  from "@/models/Customer";
// import  Supplier  from "@/models/Supplier";
// import  Product  from "@/models/Product";

// type FilterType = "day" | "month" | "custom" | "all";

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
//     // All time
//     start = new Date(0); // Jan 1, 2025
//     // This is just a placeholder, you can adjust it to your needs  
//     end = new Date();
//   }

//   return { start, end };
// }

// async function getTrendData(
//   Model: any,
//   start: Date,
//   end: Date,
//   amountField: string,
//   filter: FilterType
// ) {
//   const dateFormat =
//     filter === "day"
//       ? "%H:00" // hourly format
//       : "%Y-%m-%d"; // daily format

//   const trend = await Model.aggregate([
//     { $match: { date: { $gte: start, $lte: end } } },
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
//     // Fill all 24 hours
//     for (let h = 0; h < 24; h++) {
//       const hourLabel = `${h.toString().padStart(2, "0")}:00`;
//       const found = trend.find((t) => t._id === hourLabel);
//       results.push({ date: hourLabel, total: found ? found.total : 0 });
//     }
//   } else {
//     // Fill by days
//     let current = new Date(start);
//     while (current <= end) {
//       const dateStr = current.toLocaleDateString("en-CA");
//       const found = trend.find((t) => t._id === dateStr);
//       results.push({ date: dateStr, total: found ? found.total : 0 });
//       current.setDate(current.getDate() + 1);
//     }
//   }

//   return results;
// }

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const filter = (searchParams.get("filter") as FilterType) || "all";
//     const startDate = searchParams.get("start") || undefined;
//     const endDate = searchParams.get("end") || undefined;

//     const { start, end } = getDateRange(filter, startDate, endDate);

//     const [
//       salesTotal,
//       purchaseTotal,
//       expenseTotal,
//       customers,
//       suppliers,
//       items,
//       salesTrend,
//       purchaseTrend,
//     ] = await Promise.all([
//       Sale.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Purchase.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Expense.aggregate([
//         { $match: { date: { $gte: start, $lte: end } } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//       ]),
//       Customer.countDocuments(),
//       Supplier.countDocuments(),
//       Product.countDocuments(),
//       getTrendData(Sale, start, end, "invoiceAmount", filter),
//       getTrendData(Purchase, start, end, "invoiceAmount", filter),
//     ]);

//     return NextResponse.json({
//       totals: {
//         sales: salesTotal[0]?.total || 0,
//         purchases: purchaseTotal[0]?.total || 0,
//         expenses: expenseTotal[0]?.total || 0,
//         customers,
//         suppliers,
//         items,
//       },
//       trends: {
//         sales: salesTrend,
//         purchases: purchaseTrend,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to fetch dashboard data" },
//       { status: 500 }
//     );
//   }
// }


// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Sale } from "@/models/Sale";
// import { Purchase } from "@/models/Purchase";
// import Expense from "@/models/Expense";
// import Customer from "@/models/Customer";
// import Supplier from "@/models/Supplier";
// import Product from "@/models/Product";
// import { authMiddleware, UserPayload } from "@/lib/middleware/auth";

// type FilterType = "day" | "month" | "custom" | "all";

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
//     start = new Date(0); // epoch
//     end = new Date();
//   }

//   return { start, end };
// }

// async function getTrendData(
//   Model: any,
//   start: Date,
//   end: Date,
//   amountField: string,
//   filter: FilterType,
//   user: UserPayload
// ) {
//   const dateFormat = filter === "day" ? "%H:00" : "%Y-%m-%d";

//   const match: any = { date: { $gte: start, $lte: end } };
//   if (user.role !== "shopkeeper") {
//     match.userId = user.id; // 🔑 restrict data to this user
//   }

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
//     for (let h = 0; h < 24; h++) {
//       const hourLabel = `${h.toString().padStart(2, "0")}:00`;
//       const found = trend.find((t) => t._id === hourLabel);
//       results.push({ date: hourLabel, total: found ? found.total : 0 });
//     }
//   } else {
//     let current = new Date(start);
//     while (current <= end) {
//       const dateStr = current.toLocaleDateString("en-CA");
//       const found = trend.find((t) => t._id === dateStr);
//       results.push({ date: dateStr, total: found ? found.total : 0 });
//       current.setDate(current.getDate() + 1);
//     }
//   }

//   return results;
// }

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     // ✅ Authenticate
//     const user = authMiddleware(req);
//     if (user instanceof NextResponse) return user;

//     const { searchParams } = new URL(req.url);
//     const filter = (searchParams.get("filter") as FilterType) || "all";
//     const startDate = searchParams.get("start") || undefined;
//     const endDate = searchParams.get("end") || undefined;

//     const { start, end } = getDateRange(filter, startDate, endDate);

//     // 🔑 Apply user filter
//     const match: any = { date: { $gte: start, $lte: end } };
//     const userFilter =
//       user.role === "shopkeeper" ? {} : { userId: user.id };

//     if (user.role !== "shopkeeper") {
//       match.userId = user.id;
//     }

//     const [
//       salesTotal,
//       purchaseTotal,
//       expenseTotal,
//       customers,
//       suppliers,
//       items,
//       salesTrend,
//       purchaseTrend,
//     ] = await Promise.all([
//       Sale.aggregate([
//         { $match: match },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Purchase.aggregate([
//         { $match: match },
//         { $group: { _id: null, total: { $sum: "$invoiceAmount" } } },
//       ]),
//       Expense.aggregate([
//         { $match: match },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//       ]),
//       Customer.countDocuments(userFilter),
//       Supplier.countDocuments(userFilter),
//       Product.countDocuments(userFilter),
//       getTrendData(Sale, start, end, "invoiceAmount", filter, user),
//       getTrendData(Purchase, start, end, "invoiceAmount", filter, user),
//     ]);

//     return NextResponse.json({
//       totals: {
//         sales: salesTotal[0]?.total || 0,
//         purchases: purchaseTotal[0]?.total || 0,
//         expenses: expenseTotal[0]?.total || 0,
//         customers,
//         suppliers,
//         items,
//       },
//       trends: {
//         sales: salesTrend,
//         purchases: purchaseTrend,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to fetch dashboard data" },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getDashboardData } from "@/controllers/dashboardController";

export async function GET(req: Request) {
  try {
    const user =await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") as any) || "all";
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const data = await getDashboardData(filter, startDate, endDate, user);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
