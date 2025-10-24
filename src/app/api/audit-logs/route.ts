import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const skip = parseInt(url.searchParams.get("skip") || "0", 10);
  const q: any = { business: user.businessId };

  const total = await AuditLog.countDocuments(q);
  // populate user and business to make name/email and business name available to clients
  const items = await AuditLog.find(q)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({ path: 'user', select: 'name email' })
    .populate({ path: 'business', select: 'name' })
    .lean();

  return NextResponse.json({ success: true, total, items });
}
