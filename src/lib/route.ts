import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification"; // Assuming this model exists
import { withAuth } from "@/lib/withAuth";
import { asyncHandler } from "@/lib/asyncHandler";

const handler = async (req: Request, context: any) => {
  await connectDB();
  const { user: adminUser } = context; // User from withAuth middleware

  // Use the correct field 'recipient' instead of 'userId'
  const notifications = await Notification.find({ recipient: adminUser.sub })
    .sort({ createdAt: -1 })
    .lean();

  // The frontend store expects a specific shape. Let's map to it.
  const formattedNotifications = notifications.map(n => ({
    id: n._id.toString(),
    type: n.type || 'info', // Default to 'info' if not present
    title: n.title,
    message: n.message,
    // The frontend store now expects a date string to format itself
    time: n.createdAt.toISOString(),
    unread: !n.isRead,
  }));

  return NextResponse.json({ notifications: formattedNotifications });
};

/**
 * @method GET
 * @description Fetches all notifications for the authenticated user.
 */
export const GET = asyncHandler(withAuth(handler));