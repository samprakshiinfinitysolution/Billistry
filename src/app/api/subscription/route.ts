import { NextResponse } from "next/server";
import { asyncHandler } from "../../../lib/asyncHandler";
import { authMiddleware, UserPayload } from "../../../lib/middleware/auth";
import { connectDB } from "../../../lib/db";
import {
  getSubscriptions,
  createSubscription,
} from "../../../controllers/subscriptionController";

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Get all subscriptions
 *     description: Retrieves a list of subscriptions. Superadmins see all, while other users see subscriptions for their own business.
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: A list of subscriptions.
 */
export const GET = asyncHandler(async (req) => {
  await connectDB();
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult as UserPayload;

  const subscriptions = await getSubscriptions(user);
  return NextResponse.json({ success: true, subscriptions });
});

/**
 * @swagger
 * /api/subscription:
 *   post:
 *     summary: Create a new subscription
 *     description: Manually creates a new subscription for a business. This is an admin-only action.
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business:
 *                 type: string
 *               plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created subscription.
 */
export const POST = asyncHandler(async (req) => {
  await connectDB();
  const authResult = await authMiddleware(req, ["superadmin"]);

  // Check if authMiddleware returned a NextResponse (error)
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // If we're here, authResult is of type UserPayload
  const user = authResult as UserPayload;
  const body = await req.json();
  const subscription = await createSubscription(body, user);

  return NextResponse.json({ success: true, subscription }, { status: 201 });
});