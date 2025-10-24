// app/api/cashbook-report/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cashbook } from "@/models/cashbookModel";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter: any = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const data = await Cashbook.find(filter).sort({ createdAt: -1 });

    const totalIN = data
      .filter((e) => e.type === "IN")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalOUT = data
      .filter((e) => e.type === "OUT")
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      success: true,
      data,
      totalIN,
      totalOUT,
      balance: totalIN - totalOUT
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
