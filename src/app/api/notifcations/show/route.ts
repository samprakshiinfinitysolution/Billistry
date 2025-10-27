import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification"; // Assuming this model exists
import { withAuth } from "@/lib/withAuth";
import { asyncHandler } from "@/lib/asyncHandler";

const handler = async (req: Request, context: any) => {
  await connectDB();
  const { user: adminUser } = context;

  await Notification.updateMany(
    { recipient: adminUser.sub, isRead: false },
    { $set: { isRead: true } }
  );

  return NextResponse.json({ success: true, message: "All notifications marked as read." });
};

export const POST = asyncHandler(withAuth(handler));