import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import Business from "@/models/Business";

// GET /api/subscriptions/plans
export async function GET(req: NextRequest) {
  await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  // if query ?plans=1 return plans, else return business subscription info
  const url = new URL(req.url);
  if (url.searchParams.get("plans") === "1") {
  const plans = await SubscriptionPlan.find({}).lean();
    return NextResponse.json({ success: true, plans });
  }

  // return current business subscription
  const b = await Business.findById(user.businessId).lean();
  return NextResponse.json({ success: true, subscription: b?.subscriptionPlan || null, subscriptionExpiry: b?.subscriptionExpiry || null });
}

// PUT /api/subscriptions?action=changePlan&id=businessId
export async function PUT(req: NextRequest) {
  await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "changePlan") {
    const body = await req.json();
    const { businessId, planId } = body;
    if (!businessId || !planId) return NextResponse.json({ error: "businessId and planId required" }, { status: 400 });

  const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

    const b = await Business.findById(businessId);
    if (!b) return NextResponse.json({ error: "business not found" }, { status: 404 });

    b.subscriptionPlan = plan._id;
    // optionally set expiry
    await b.save();
    return NextResponse.json({ success: true, business: b });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
