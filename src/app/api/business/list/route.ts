// app/api/business/list/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";

export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const business = await Business.findOne({ owner: userId, isDeleted: false });
    return NextResponse.json({ success: true, business });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
