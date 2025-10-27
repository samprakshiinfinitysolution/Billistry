import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification"; // Assuming this model exists
import { withAuth } from "@/lib/withAuth";
import { asyncHandler } from "@/lib/asyncHandler";

interface RouteContext {
  params: { id: string };
}

const handler = async (req: Request, context: RouteContext & any) => {
  await connectDB();
  const { user: adminUser } = context;
  const { id } = context.params;

  const result = await Notification.updateOne({ _id: id, recipient: adminUser.sub }, { isRead: true });

  if (result.modifiedCount === 0) {
    return NextResponse.json({ error: "Notification not found or you do not have permission." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Notification marked as read." });
};

export const POST = asyncHandler(withAuth(handler));