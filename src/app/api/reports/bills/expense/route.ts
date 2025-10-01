import { NextRequest, NextResponse } from "next/server";
import { getExpenseReport } from "@/controllers/expenseController"; // controller wrapper
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
    const search = searchParams.get("search") || undefined;
    const dateType =
      (searchParams.get("dateType") as
        | "today"
        | "thisWeek"
        | "thisMonth"
        | "custom"
        | "all") || "all";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // ✅ Get expense report
    const report = await getExpenseReport(user, {
      search,
      dateType,
      startDate,
      endDate,
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
