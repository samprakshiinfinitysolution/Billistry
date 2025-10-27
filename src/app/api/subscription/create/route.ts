import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { verifyAdminToken } from "@/utils/verifyAdminToken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { payload, error } = await verifyAdminToken();
    if (error || !payload) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const { businessId, planName, planType, price, durationDays } = await req.json();

    if (!businessId || !planName || !planType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (durationDays || 30));

    const subscription = await Subscription.create({
      business: businessId,
      createdBy: payload.id, // ✅ FIXED: use payload.id
      planName,
      planType,
      price: price || 0,
      startDate: new Date(),
      endDate,
      isTrial: false,
      paymentStatus: price > 0 ? "paid" : "trial",
      isActive: true,
    });

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (err) {
    console.error("Create Subscription Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
