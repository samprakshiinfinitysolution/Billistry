import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
} from "@/controllers/subscriptionPlanController";

/**
 * @method GET
 * @description Get all subscription plans (superadmin only)
 * @access Superadmin
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  // Public listing of subscription plans. This endpoint is safe to expose as it only returns plan metadata.
  await connectDB();
  const plans = await getSubscriptionPlans();
  return NextResponse.json({ success: true, plans });
});

/**
 * @method POST
 * @description Create a new subscription plan (superadmin only)
 * @access Superadmin
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const user = (await authMiddleware(req, ["superadmin"])) as UserPayload;

  if (user instanceof NextResponse) {
    return user;
  }

  const body = await req.json();
  const plan = await createSubscriptionPlan(body, user);
  return NextResponse.json({ success: true, plan }, { status: 201 });
});

