// app/api/reports/bills/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPurchaseReport } from "@/controllers/purchaseController";
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
    const purchaseType = searchParams.get("purchaseType") || undefined;
    const payment = searchParams.get("payment") || undefined;
    const status = searchParams.get("status") || undefined;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    // ✅ Get purchase report from controller
    const report = await getPurchaseReport(user, {
      purchaseType,
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

// ❌ Block other methods
export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
