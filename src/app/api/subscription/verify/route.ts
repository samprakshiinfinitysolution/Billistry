import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import Business from "@/models/Business";
import { ISubscriptionPlan } from "@/models/SubscriptionPlan";
import { ApiError } from "@/controllers/apiError";

export const POST = asyncHandler(async (req) => {
  await connectDB();
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult as UserPayload;
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
  } = await req.json();

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay payment details.");
  }

  // 1. Verify Razorpay signature
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("RAZORPAY_KEY_SECRET is not set.");
    throw new ApiError(500, "Server configuration error: Razorpay secret is missing.");
  }

  const bodyToSign = razorpay_payment_id + "|" + razorpay_subscription_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(bodyToSign)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Find the pending subscription and its plan
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: razorpay_subscription_id,
      business: user.businessId,
    }).populate("plan").session(session);

    if (!subscription || !subscription.plan) {
      throw new ApiError(404, "Subscription not found.");
    }

    // Check if the subscription is already active to prevent reprocessing
    if (subscription.status === "Active") {
      return NextResponse.json({ success: true, message: "Subscription is already active." });
    }

    const plan = subscription.plan as ISubscriptionPlan;

    // 3. Calculate start and end dates based on the plan's duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationInDays);

    // 4. Update the subscription to "Active"
    subscription.status = "Active";
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.razorpayPaymentId = razorpay_payment_id;
    await subscription.save({ session });

    // 5. Update the business with the active plan and expiry date
    await Business.findByIdAndUpdate(user.businessId, { subscriptionPlan: plan._id, subscriptionExpiry: endDate }, { session });

    await session.commitTransaction();
    return NextResponse.json({ success: true, message: "Subscription activated successfully." });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
