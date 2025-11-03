import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import {
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/controllers/subscriptionPlanController";
import { ApiError } from "@/controllers/apiError";

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * @method GET
 * @description Get a single subscription plan by ID (superadmin only)
 * @access Superadmin
 */
export const GET = asyncHandler(async (req: NextRequest, context: RouteContext) => {
  await connectDB();
  const user = (await authMiddleware(req, ["superadmin"])) as UserPayload;
  if (user instanceof NextResponse) return user;

  const { id } = context.params;
  const plan = await getSubscriptionPlanById(id);

  if (!plan) {
    throw new ApiError(404, "Subscription plan not found.");
  }

  return NextResponse.json({ success: true, plan });
});

/**
 * @method PATCH
 * @description Update a subscription plan (superadmin only)
 * @access Superadmin
 */
export const PATCH = asyncHandler(async (req: NextRequest, context: RouteContext) => {
  await connectDB();
  const user = (await authMiddleware(req, ["superadmin"])) as UserPayload;
  if (user instanceof NextResponse) return user;

  const { id } = context.params;
  const body = await req.json();

  const updatedPlan = await updateSubscriptionPlan(id, body, user);

  if (!updatedPlan) {
    throw new ApiError(404, "Subscription plan not found.");
  }

  return NextResponse.json({ success: true, plan: updatedPlan });
});

/**
 * @method DELETE
 * @description Soft-delete a subscription plan (superadmin only)
 * @access Superadmin
 */
export const DELETE = asyncHandler(async (req: NextRequest, context: RouteContext) => {
  await connectDB();
  const user = (await authMiddleware(req, ["superadmin"])) as UserPayload;
  if (user instanceof NextResponse) return user;

  const { id } = context.params;
  const result = await deleteSubscriptionPlan(id, user);

  return NextResponse.json(result);
});

