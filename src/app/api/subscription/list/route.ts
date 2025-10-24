import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { verifyAdminToken } from "@/utils/verifyAdminToken";

export async function GET() {
  try {
    await connectDB();

    const { payload, error } = await verifyAdminToken();
    if (error || !payload) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    if (payload.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subscriptions = await Subscription.find()
      .populate("business", "name")
      .populate("createdBy", "email role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, subscriptions });
  } catch (err) {
    console.error("List Subscriptions Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
