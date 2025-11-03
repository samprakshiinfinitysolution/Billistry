import Subscription, { ISubscription } from "@/models/Subscription";
import Business from "@/models/Business";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import { ApiError } from "./apiError";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";

/**
 * Get all subscriptions. Superadmins can see all, others see their own business's.
 * @param user - The authenticated user payload.
 */
export const getSubscriptions = async (user: UserPayload) => {
  const query =
    user.role === "superadmin" ? {} : { business: user.businessId };

  return Subscription.find(query)
    .populate("plan", "name price durationInDays")
    .populate("business", "name")
    .sort({ createdAt: -1 });
};

/**
 * Get a single subscription by its ID.
 * @param id - The ID of the subscription.
 * @param user - The authenticated user payload.
 */
export const getSubscriptionById = async (id: string, user: UserPayload) => {
  const subscription = await Subscription.findById(id)
    .populate("plan", "name price durationInDays")
    .populate("business", "name");

  if (!subscription) {
    return null;
  }

  // Superadmin can access any subscription, others can only access their own.
  if (
    user.role !== "superadmin" &&
    subscription.business._id.toString() !== user.businessId
  ) {
    return null;
  }

  return subscription;
};

/**
 * Create a new subscription and update the associated business.
 * @param body - The subscription data.
 * @param user - The authenticated user payload.
 */
export const createSubscription = async (
  body: Partial<ISubscription>,
  user: UserPayload
) => {
  // Ensure only a superadmin can manually create a subscription
  if (user.role !== "superadmin") {
    throw new ApiError(403, "Forbidden: You do not have permission to create subscriptions.");
  }

  const { business, plan } = body;

  if (!business || !plan) {
    throw new ApiError(400, "Business and Plan are required to create a subscription.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the plan to get its duration
    const subscriptionPlan = await SubscriptionPlan.findById(plan).session(session);
    if (!subscriptionPlan) {
      throw new ApiError(404, `Subscription Plan with ID "${plan}" not found.`);
    }

    // 2. Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + subscriptionPlan.durationInDays);

    // 3. Create the new subscription record
    const newSubscription = new Subscription({
      ...body,
      startDate,
      endDate,
      status: "Active",
      createdBy: user.userId,
    });
    await newSubscription.save({ session });

    // 4. Update the corresponding business with the new plan and expiry date
    await Business.findByIdAndUpdate(
      business,
      {
        $set: {
          subscriptionPlan: plan,
          subscriptionExpiry: endDate,
          updatedBy: user.userId,
        },
      },
      { session, new: true }
    );

    await session.commitTransaction();
    return newSubscription;
  } catch (error) {
    await session.abortTransaction();
    throw error; // Re-throw the error to be caught by the handler
  } finally {
    session.endSession();
  }
};

/**
 * Update an existing subscription.
 * @param id - The ID of the subscription to update.
 * @param updateData - The data to update.
 * @param user - The authenticated user payload.
 */
export const updateSubscription = async (
  id: string,
  updateData: Partial<ISubscription>,
  user: UserPayload
) => {
  // For now, only superadmin can update subscriptions (e.g., status)
  if (user.role !== "superadmin") {
    throw new Error("Forbidden: You do not have permission to update subscriptions.");
  }

  const subscription = await Subscription.findByIdAndUpdate(
    id,
    { ...updateData, updatedBy: user.userId },
    { new: true }
  );

  return subscription;
};

// Note: A dedicated DELETE function is omitted as subscriptions should typically be 'Cancelled' or 'Expired', not hard-deleted.
// You can add a delete function here if your business logic requires it.