import { SubscriptionPlan, ISubscriptionPlan } from "@/models/SubscriptionPlan";
import { UserPayload } from "@/lib/middleware/auth"; // Assuming UserPayload is defined here
import { ApiError } from "./apiError";

/**
 * Get all subscription plans.
 * (superadmin only)
 */
export const getSubscriptionPlans = async () => {
  return SubscriptionPlan.find({ isDeleted: { $ne: true } }).sort({ price: 1 });
};

/**
 * Get a single subscription plan by ID.
 * (superadmin only)
 * @param id - The ID of the plan.
 */
export const getSubscriptionPlanById = async (id: string) => {
  return SubscriptionPlan.findById(id);
};

/**
 * Create a new subscription plan.
 * (superadmin only)
 * @param body - The plan data.
 * @param user - The authenticated user payload.
 */
export const createSubscriptionPlan = async (body: Partial<ISubscriptionPlan>, user: UserPayload) => {
  if (!body.name || !body.price || !body.durationInDays) {
    throw new ApiError(400, "Name, price, and durationInDays are required.");
  }

  const plan = new SubscriptionPlan({
    ...body,
    createdBy: user.userId,
  });

  return plan.save();
};

/**
 * Update an existing subscription plan.
 * (superadmin only)
 * @param id - The ID of the plan to update.
 * @param updateData - The data to update.
 * @param user - The authenticated user payload.
 */
export const updateSubscriptionPlan = async (id: string, updateData: Partial<ISubscriptionPlan>, user: UserPayload) => {
  return SubscriptionPlan.findByIdAndUpdate(
    id,
    { ...updateData, updatedBy: user.userId },
    { new: true }
  );
};

/**
 * Soft delete a subscription plan.
 * (superadmin only)
 * @param id - The ID of the plan to delete.
 * @param user - The authenticated user payload.
 */
export const deleteSubscriptionPlan = async (id: string, user: UserPayload) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) {
    throw new ApiError(404, "Subscription plan not found.");
  }
  plan.isDeleted = true;
  plan.deletedAt = new Date(); // 'updatedBy' is not a standard field, assuming it's not on the model
  await plan.save();
  return { success: true, message: "Subscription plan deleted." };
};