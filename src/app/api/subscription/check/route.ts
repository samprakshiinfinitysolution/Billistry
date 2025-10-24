import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { verifyAdminToken } from "@/utils/verifyAdminToken";

export async function GET() {
  try {
    await connectDB();
    const { payload, error } = await verifyAdminToken();
    // After this check, payload is guaranteed to be defined.
    if (error || !payload) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const sub = await Subscription.findOne({
      createdBy: payload.userId,
      isActive: true,
    });

    if (!sub)
      return NextResponse.json({ valid: false, message: "No active subscription" });

    const now = new Date();
    const isValid = new Date(sub.endDate) > now;

    if (!isValid) {
      sub.isActive = false;
      await sub.save();
    }

    return NextResponse.json({
      valid: isValid,
      remainingDays: isValid
        ? Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      planType: sub.planType,
    });
  } catch (err) {
    console.error("Subscription Check Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
