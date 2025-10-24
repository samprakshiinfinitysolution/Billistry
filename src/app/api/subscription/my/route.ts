import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { authMiddleware } from "@/lib/middleware/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await authMiddleware(req, ["shopkeeper"]); // Only shopkeepers have subscriptions
    if (user instanceof NextResponse) {
      return user; // Return error response from middleware
    }

    const subscription = await Subscription.findOne({
      business: user.businessId, // Subscriptions are tied to the business
      isActive: true,
    }).populate("business", "name");

    if (!subscription) {
      return NextResponse.json({ message: "No active subscription" }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription });
  } catch (err) {
    console.error("My Subscription Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
