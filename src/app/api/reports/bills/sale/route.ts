// app/api/reports/bills/sale/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSaleReport } from "@/controllers/saleController";
import { authMiddleware } from "@/lib/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    // ✅ Authenticate user
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Extract query params
    const { searchParams } = new URL(req.url);
    const saleType = searchParams.get("saleType") || undefined;
    const payment = searchParams.get("payment") || undefined;
    const status = searchParams.get("status") || undefined;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    // ✅ Get sale report from controller
    const report = await getSaleReport(user, {
      saleType,
      payment,
      status,
      start,
      end,
    });

    return NextResponse.json(report, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ❌ If other methods are used
export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
