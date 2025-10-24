


import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getDashboardData } from "@/controllers/dashboardController";

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const filter = (req.nextUrl.searchParams.get("filter") || "all") as "day" | "month" | "custom" | "all";
    const startDate = req.nextUrl.searchParams.get("start") || undefined;
    const endDate = req.nextUrl.searchParams.get("end") || undefined;

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
