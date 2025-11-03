import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import Subscription from "@/models/Subscription";
import Business from "@/models/Business";
import { ApiError } from "@/controllers/apiError";
import { razorpay } from "@/lib/razorpay";

export const POST = asyncHandler(async (req) => {
  await connectDB();
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult as UserPayload;
  const { planId } = await req.json();

  if (!planId) {
    throw new ApiError(400, "Plan ID is required.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch the subscription plan from DB to get the razorpayPlanId
    const plan = await SubscriptionPlan.findById(planId).session(session);
    if (!plan || !plan.razorpayPlanId) {
      throw new ApiError(404, "Subscription plan not found or Razorpay plan ID is missing.");
    }

    // 2. Check for an existing pending subscription for this business and plan
    let subscription = await Subscription.findOne({
      business: user.businessId,
      plan: plan._id,
      status: "Pending",
    }).session(session);

    // 3. If no pending subscription, create a new one
    if (!subscription) {
      // Ensure sensible defaults
      const planIdForRazorpay = plan.razorpayPlanId?.toString() || "";
      const totalCount = typeof plan.totalCount === "number" && plan.totalCount > 0 ? plan.totalCount : 1;

      try {
        // Validate that the plan id looks correct and that the plan exists in Razorpay
        if (!planIdForRazorpay || typeof planIdForRazorpay !== "string") {
          throw new ApiError(404, `Razorpay plan id is missing or invalid in DB for plan ${plan._id}`);
        }

        // Basic sanity check: Razorpay plan ids typically start with "plan_". If yours use another prefix adjust as needed.
        if (!/^plan_/.test(planIdForRazorpay)) {
          console.error("Suspicious razorpayPlanId format:", planIdForRazorpay);
          throw new ApiError(404, `Razorpay plan id in DB does not look like a Razorpay plan id: ${planIdForRazorpay}`);
        }

        try {
          await razorpay.plans.fetch(planIdForRazorpay);
        } catch (planErr: any) {
          console.error("Razorpay plan fetch error:", planErr);
          const desc = planErr?.error?.description || planErr?.message || String(planErr);
          // If the plan is not found or URL not found, return a clear 404 to the caller
          if (planErr?.statusCode === 404 || /not found/i.test(desc) || /requested URL was not found/i.test(desc)) {
            throw new ApiError(404, `Razorpay plan not found: ${planIdForRazorpay}`);
          }
          throw new ApiError(502, `Razorpay error fetching plan: ${desc}`);
        }

        const razorpaySubscription = await razorpay.subscriptions.create({
          plan_id: planIdForRazorpay,
          total_count: totalCount,
          quantity: 1,
          customer_notify: 1,
        });

        subscription = new Subscription({
          business: user.businessId,
          plan: plan._id,
          razorpaySubscriptionId: razorpaySubscription.id,
          status: "Pending",
          createdBy: user.userId,
        });
        await subscription.save({ session });

        // Link this new pending subscription to the business
        await Business.findByIdAndUpdate(user.businessId, { currentSubscription: subscription._id }, { session });
      } catch (err: any) {
        // Razorpay-specific error handling: log full response if available and return a clear ApiError
        console.error("Razorpay subscription create error:", err);
        const razorpayErr = err?.error || err;
        // If razorpay responded with structured error info, include it
        throw new ApiError(502, `Razorpay error creating subscription: ${JSON.stringify(razorpayErr)}`);
      }
    }

    await session.commitTransaction();
    return NextResponse.json({ success: true, subscriptionId: subscription.razorpaySubscriptionId });
  } catch (error) {
    await session.abortTransaction();
    throw error; // Re-throw the error to be handled by asyncHandler
  } finally {
    session.endSession();
  }
});
