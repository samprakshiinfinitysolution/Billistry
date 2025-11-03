import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import Business from "@/models/Business"; // Assuming IBusiness is exported from here
import { ISubscriptionPlan } from "@/models/SubscriptionPlan";
import { ApiError } from "@/controllers/apiError";

/**
 * Handles successful recurring payments.
 */
async function handleSubscriptionCharged(payload: any, session: mongoose.ClientSession) {
  const subId = payload.subscription.entity.id;
  const paymentId = payload.payment.entity.id;

  const subscription = await Subscription.findOne({ razorpaySubscriptionId: subId }).populate("plan").session(session);
  if (!subscription) {
    throw new ApiError(404, `Webhook Error: Subscription with razorpaySubscriptionId ${subId} not found.`);
  }

  const plan = subscription.plan as ISubscriptionPlan;
  if (!plan) {
    throw new ApiError(404, `Webhook Error: Plan for subscription ${subscription._id} not found.`);
  }

  // Extend the subscription end date based on the plan's duration
  const currentEndDate = subscription.endDate || new Date();
  const newEndDate = new Date(currentEndDate);
  newEndDate.setDate(newEndDate.getDate() + plan.durationInDays);

  subscription.status = "Active";
  subscription.endDate = newEndDate;
  // Log the new payment ID for reference
  subscription.razorpayPaymentId = paymentId;
  await subscription.save({ session });

  // Also update the business's expiry date
  await Business.findByIdAndUpdate(subscription.business, { subscriptionExpiry: newEndDate }, { session });

  console.log(`Subscription ${subscription._id} renewed until ${newEndDate.toISOString()}`);
}

/**
 * Handles subscription cancellations or expirations.
 */
async function handleSubscriptionEnd(payload: any, newStatus: "Cancelled" | "Expired", session: mongoose.ClientSession) {
  const subId = payload.subscription.entity.id;
  const subscription = await Subscription.findOneAndUpdate(
    { razorpaySubscriptionId: subId },
    { status: newStatus },
    { session, new: true }
  );

  if (!subscription) {
    // Log a warning but don't throw an error, as we might not track all subscriptions
    console.warn(`Webhook Warning: Received '${newStatus}' status for untracked subscription ${subId}`);
    return;
  }

  console.log(`Subscription ${subscription._id} status updated to ${newStatus}`);
}

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    switch (event.event) {
      case "subscription.charged":
        await handleSubscriptionCharged(event.payload, session);
        break;
      case "subscription.cancelled":
        await handleSubscriptionEnd(event.payload, "Cancelled", session);
        break;
      case "subscription.halted":
      case "subscription.completed":
        await handleSubscriptionEnd(event.payload, "Expired", session);
        break;
    }
    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error(`Webhook processing failed for event ${event.event}:`, error);
    return NextResponse.json({ error: "Webhook processing failed", details: error.message }, { status: 500 });
  } finally {
    session.endSession();
  }

  return NextResponse.json({ status: "ok" });
}
